import Comment from "../models/Comment.js"
import Blog from "../models/Blog.js"

// @desc    Get comments for a blog
// @route   GET /api/comments/:blogId
// @access  Public
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      blog: req.params.blogId,
      parentComment: null,
      isActive: true,
    })
      .populate("author", "username firstName lastName avatar")
      .populate({
        path: "replies",
        populate: {
          path: "author",
          select: "username firstName lastName avatar",
        },
      })
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      data: comments,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching comments",
      error: error.message,
    })
  }
}

// @desc    Create new comment
// @route   POST /api/comments
// @access  Private
export const createComment = async (req, res) => {
  try {
    const { content, blog: blogId, parentCommentId } = req.body

    console.log("Creating comment with data:", { content, blogId, parentCommentId, userId: req.user._id })

    // Check if blog exists
    const blog = await Blog.findById(blogId)
    if (!blog) {
      console.log("Blog not found with ID:", blogId)
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      })
    }

    console.log("Blog found:", blog.title)

    // Check if parent comment exists (for replies)
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId)
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: "Parent comment not found",
        })
      }
    }

    const comment = new Comment({
      content,
      author: req.user._id,
      blog: blogId,
      parentComment: parentCommentId || null,
    })

    await comment.save()
    await comment.populate("author", "username firstName lastName avatar")

    console.log("Comment created successfully:", comment._id)

    res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: comment,
    })
  } catch (error) {
    console.error("Comment creation error:", error)
    res.status(500).json({
      success: false,
      message: "Error creating comment",
      error: error.message,
    })
  }
}

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
export const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      })
    }

    // Check ownership
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this comment",
      })
    }

    const { content } = req.body

    comment.content = content
    comment.isEdited = true
    comment.editedAt = new Date()

    await comment.save()
    await comment.populate("author", "username firstName lastName avatar")

    res.json({
      success: true,
      message: "Comment updated successfully",
      data: comment,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating comment",
      error: error.message,
    })
  }
}

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      })
    }

    // Check ownership or admin
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment",
      })
    }

    // Soft delete
    comment.isActive = false
    await comment.save()

    res.json({
      success: true,
      message: "Comment deleted successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting comment",
      error: error.message,
    })
  }
}

// @desc    Like/Unlike comment
// @route   POST /api/comments/:id/like
// @access  Private
export const toggleCommentLike = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      })
    }

    const existingLike = comment.likes.find((like) => like.user.toString() === req.user._id.toString())

    if (existingLike) {
      // Unlike
      comment.likes = comment.likes.filter((like) => like.user.toString() !== req.user._id.toString())
    } else {
      // Like
      comment.likes.push({ user: req.user._id })
    }

    await comment.save()

    res.json({
      success: true,
      message: existingLike ? "Comment unliked" : "Comment liked",
      data: {
        isLiked: !existingLike,
        likesCount: comment.likes.length,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing like",
      error: error.message,
    })
  }
}
