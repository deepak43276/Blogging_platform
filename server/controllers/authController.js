import dotenv from "dotenv"
dotenv.config()

import jwt from "jsonwebtoken"
import User from "../models/User.js"
import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { Strategy as FacebookStrategy } from "passport-facebook"

// Configure Passport strategies
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log("Google profile received:", profile.id, profile.emails?.[0]?.value)

          // Check if user already exists with Google ID
          let user = await User.findOne({ googleId: profile.id })

          if (user) {
            console.log("Existing Google user found:", user.username)
            user.lastLogin = new Date()
            await user.save()
            return done(null, user)
          }

          // Check if user exists with same email
          if (profile.emails && profile.emails[0]) {
            user = await User.findOne({ email: profile.emails[0].value })

            if (user) {
              console.log("Linking Google account to existing user:", user.username)
              // Link Google account to existing user
              user.googleId = profile.id
              user.lastLogin = new Date()
              if (!user.avatar && profile.photos && profile.photos[0]) {
                user.avatar = profile.photos[0].value
              }
              await user.save()
              return done(null, user)
            }
          }

          // Create new user
          const email = profile.emails?.[0]?.value || ""
          const firstName = profile.name?.givenName || ""
          const lastName = profile.name?.familyName || ""

          // Generate unique username
          let username = email.split("@")[0] || `user_${profile.id}`
          const existingUsername = await User.findOne({ username })
          if (existingUsername) {
            username = `${username}_${Date.now()}`
          }

          console.log("Creating new Google user:", username, email)

          user = new User({
            googleId: profile.id,
            username,
            email,
            firstName,
            lastName,
            avatar: profile.photos?.[0]?.value || "",
            isEmailVerified: true,
            lastLogin: new Date(),
          })

          await user.save()
          console.log("New Google user created:", user.username)
          done(null, user)
        } catch (error) {
          console.error("Google OAuth error:", error)
          done(error, null)
        }
      },
    ),
  )
}

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: "/api/auth/facebook/callback",
        profileFields: ["id", "emails", "name", "picture.type(large)"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log("Facebook profile received:", profile.id)

          // Check if user already exists with Facebook ID
          let user = await User.findOne({ facebookId: profile.id })

          if (user) {
            user.lastLogin = new Date()
            await user.save()
            return done(null, user)
          }

          // Check if user exists with same email
          if (profile.emails && profile.emails[0]) {
            user = await User.findOne({ email: profile.emails[0].value })

            if (user) {
              // Link Facebook account to existing user
              user.facebookId = profile.id
              user.lastLogin = new Date()
              if (!user.avatar && profile.photos && profile.photos[0]) {
                user.avatar = profile.photos[0].value
              }
              await user.save()
              return done(null, user)
            }
          }

          // Create new user
          const email = profile.emails?.[0]?.value || ""
          const firstName = profile.name?.givenName || ""
          const lastName = profile.name?.familyName || ""

          // Generate unique username
          let username = email ? email.split("@")[0] : `user_${profile.id}`
          const existingUsername = await User.findOne({ username })
          if (existingUsername) {
            username = `${username}_${Date.now()}`
          }

          user = new User({
            facebookId: profile.id,
            username,
            email,
            firstName,
            lastName,
            avatar: profile.photos?.[0]?.value || "",
            isEmailVerified: !!email,
            lastLogin: new Date(),
          })

          await user.save()
          done(null, user)
        } catch (error) {
          console.error("Facebook OAuth error:", error)
          done(error, null)
        }
      },
    ),
  )
}

passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  })
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? "Email already registered" : "Username already taken",
      })
    }

    // Create user
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      lastLogin: new Date(),
    })

    await user.save()

    // Generate token
    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    })
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email }).select("+password")

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate token
    const token = generateToken(user._id)

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    })
  }
}

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("followers", "username firstName lastName avatar")
      .populate("following", "username firstName lastName avatar")

    res.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Get me error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Private
export const refreshToken = async (req, res) => {
  try {
    const token = generateToken(req.user._id)

    res.json({
      success: true,
      token,
    })
  } catch (error) {
    console.error("Refresh token error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// @desc    Google OAuth
// @route   GET /api/auth/google
// @access  Public
export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
})

// @desc    Google OAuth Callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallback = (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user) => {
    console.log("Google callback - err:", err, "user:", user?.username)

    if (err) {
      console.error("Google callback error:", err)
      return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=auth_failed`)
    }
    if (!user) {
      console.error("No user returned from Google auth")
      return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=auth_failed`)
    }

    try {
      const token = generateToken(user._id)
      console.log("Generated token for user:", user.username)

      // Redirect to auth callback page with token
      const redirectUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/auth/callback?token=${token}`
      // const redirectUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`

      console.log("Redirecting to:", redirectUrl)

      res.redirect(redirectUrl)
    } catch (tokenError) {
      console.error("Token generation error:", tokenError)
      res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=token_failed`)
    }
  })(req, res, next)
}

// @desc    Facebook OAuth
// @route   GET /api/auth/facebook
// @access  Public
export const facebookAuth = passport.authenticate("facebook", {
  scope: ["email"],
})

// @desc    Facebook OAuth Callback
// @route   GET /api/auth/facebook/callback
// @access  Public
export const facebookCallback = (req, res, next) => {
  passport.authenticate("facebook", { session: false }, (err, user) => {
    if (err) {
      console.error("Facebook callback error:", err)
      return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=auth_failed`)
    }
    if (!user) {
      console.error("No user returned from Facebook auth")
      return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=auth_failed`)
    }

    try {
      const token = generateToken(user._id)
      res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/auth/callback?token=${token}`)
    } catch (tokenError) {
      console.error("Token generation error:", tokenError)
      res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=token_failed`)
    }
  })(req, res, next)
}
