import User from "../models/User.js"
import Blog from "../models/Blog.js"
import { uploadImage } from "../utils/cloudinary.js"

// @desc    Get user profile
// @route   GET /api/users/:username
// @access  Public
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate("followers", "username firstName lastName avatar")
      .populate("following", "username firstName lastName avatar")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Get user's published blogs
    const blogs = await Blog.find({
      author: user._id,
      status: "published",
      isPublished: true,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    // Get blog stats
    const blogStats = await Blog.aggregate([
      { $match: { author: user._id, status: "published" } },
      {
        $group: {
          _id: null,
          totalBlogs: { $sum: 1 },
          totalViews: { $sum: "$views" },
          totalLikes: { $sum: { $size: "$likes" } },
        },
      },
    ])

    const stats = blogStats[0] || { totalBlogs: 0, totalViews: 0, totalLikes: 0 }

    res.json({
      success: true,
      data: {
        user,
        blogs,
        stats,
      },
    })
  } catch (error) {
    console.error("Get user profile error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
      error: error.message,
    })
  }
}

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    console.log("Update profile request body:", req.body)
    console.log("Update profile request file:", req.file)

    const { firstName, lastName, bio } = req.body
    let socialLinks = {}

    // Parse social links if they exist
    try {
      if (req.body.socialLinks) {
        socialLinks = typeof req.body.socialLinks === "string" ? JSON.parse(req.body.socialLinks) : req.body.socialLinks
      }
    } catch (e) {
      console.log("Error parsing social links:", e)
      socialLinks = {}
    }

    // Handle individual social link fields
    if (req.body.website) socialLinks.website = req.body.website
    if (req.body.twitter) socialLinks.twitter = req.body.twitter
    if (req.body.linkedin) socialLinks.linkedin = req.body.linkedin
    if (req.body.github) socialLinks.github = req.body.github

    const updateData = {
      firstName: firstName || req.user.firstName,
      lastName: lastName || req.user.lastName,
      bio: bio || req.user.bio,
      socialLinks: socialLinks,
    }

    // Handle avatar upload
    if (req.file) {
      try {
        const avatarUrl = await uploadImage(req.file.path, "avatars")
        updateData.avatar = avatarUrl
      } catch (uploadError) {
        console.error("Avatar upload error:", uploadError)
        return res.status(400).json({
          success: false,
          message: "Error uploading avatar",
          error: uploadError.message,
        })
      }
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password")

    console.log("Updated user:", updatedUser)

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: updatedUser,
      },
    })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    })
  }
}

// @desc    Follow/Unfollow user
// @route   POST /api/users/:id/follow
// @access  Private
export const toggleFollow = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id)

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    if (userToFollow._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      })
    }

    const currentUser = await User.findById(req.user._id)

    const isFollowing = currentUser.following.includes(userToFollow._id)

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter((id) => id.toString() !== userToFollow._id.toString())
      userToFollow.followers = userToFollow.followers.filter((id) => id.toString() !== currentUser._id.toString())
    } else {
      // Follow
      currentUser.following.push(userToFollow._id)
      userToFollow.followers.push(currentUser._id)
    }

    await currentUser.save()
    await userToFollow.save()

    res.json({
      success: true,
      message: isFollowing ? "User unfollowed" : "User followed",
      data: {
        isFollowing: !isFollowing,
        followersCount: userToFollow.followers.length,
      },
    })
  } catch (error) {
    console.error("Toggle follow error:", error)
    res.status(500).json({
      success: false,
      message: "Error processing follow",
      error: error.message,
    })
  }
}

// @desc    Get user's followers
// @route   GET /api/users/:id/followers
// @access  Public
export const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("followers", "username firstName lastName avatar bio")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      data: user.followers,
    })
  } catch (error) {
    console.error("Get followers error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching followers",
      error: error.message,
    })
  }
}

// @desc    Get user's following
// @route   GET /api/users/:id/following
// @access  Public
export const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("following", "username firstName lastName avatar bio")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      data: user.following,
    })
  } catch (error) {
    console.error("Get following error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching following",
      error: error.message,
    })
  }
}
