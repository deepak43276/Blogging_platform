import express from "express"
import { authenticate } from "../middleware/auth.js"
import multer from "multer"
import {
  getUserProfile,
  updateProfile,
  toggleFollow,
  getFollowers,
  getFollowing,
} from "../controllers/userController.js"

const router = express.Router()
const upload = multer({ dest: "uploads/" })

// @route   GET /api/users/:username
router.get("/:username", getUserProfile)

// @route   PUT /api/users/profile
router.put("/profile", authenticate, upload.single("avatar"), updateProfile)

// @route   POST /api/users/:id/follow
router.post("/:id/follow", authenticate, toggleFollow)

// @route   GET /api/users/:id/followers
router.get("/:id/followers", getFollowers)

// @route   GET /api/users/:id/following
router.get("/:id/following", getFollowing)

export default router
