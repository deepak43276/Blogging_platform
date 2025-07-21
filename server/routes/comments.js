import express from "express"
import { authenticate } from "../middleware/auth.js"
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
} from "../controllers/commentController.js"

const router = express.Router()

// @route   GET /api/comments/:blogId
router.get("/:blogId", getComments)

// @route   POST /api/comments
router.post("/", authenticate, createComment)

// @route   PUT /api/comments/:id
router.put("/:id", authenticate, updateComment)

// @route   DELETE /api/comments/:id
router.delete("/:id", authenticate, deleteComment)

// @route   POST /api/comments/:id/like
router.post("/:id/like", authenticate, toggleCommentLike)

export default router
