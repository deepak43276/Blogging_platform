import express from "express"
import { authenticate } from "../middleware/auth.js"
import { registerValidation, loginValidation, validateRequest } from "../middleware/validation.js"
import {
  register,
  login,
  getMe,
  refreshToken,
  googleAuth,
  googleCallback,
  facebookAuth,
  facebookCallback,
} from "../controllers/authController.js"

const router = express.Router()

// @route   POST /api/auth/register
router.post("/register", registerValidation, validateRequest, register)

// @route   POST /api/auth/login
router.post("/login", loginValidation, validateRequest, login)

// @route   GET /api/auth/me
router.get("/me", authenticate, getMe)

// @route   POST /api/auth/refresh
router.post("/refresh", authenticate, refreshToken)

// @route   GET /api/auth/google
router.get("/google", googleAuth)

// @route   GET /api/auth/google/callback
router.get("/google/callback", googleCallback)

// @route   GET /api/auth/facebook
router.get("/facebook", facebookAuth)

// @route   GET /api/auth/facebook/callback
router.get("/facebook/callback", facebookCallback)

export default router
