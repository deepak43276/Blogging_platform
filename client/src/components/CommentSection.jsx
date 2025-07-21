"use client"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
import { Button } from "./ui/button"
import { formatRelativeTime, getInitials } from "../lib/utils"
import { Heart, Reply, Edit, Trash2, Send } from "lucide-react"
import { commentAPI } from "../services/api"
import toast from "react-hot-toast"

const CommentSection = ({ blogId, comments: initialComments }) => {
  const { user, isAuthenticated } = useAuth()
  const [comments, setComments] = useState(initialComments || [])
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState(null)
  const [replyContent, setReplyContent] = useState("")
  const [editingComment, setEditingComment] = useState(null)
  const [editContent, setEditContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error("Please login to comment")
      return
    }

    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      console.log("Creating comment:", { content: newComment, blogId })
      const response = await commentAPI.createComment({
        content: newComment,
        blog: blogId, // Changed from blogId to blog to match backend expectation
      })

      console.log("Comment created:", response.data)
      setComments((prev) => [response.data.data, ...prev])
      setNewComment("")
      toast.success("Comment added successfully")
    } catch (error) {
      console.error("Comment creation error:", error)
      toast.error(error.response?.data?.message || "Failed to add comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitReply = async (parentCommentId) => {
    if (!isAuthenticated) {
      toast.error("Please login to reply")
      return
    }

    if (!replyContent.trim()) return

    setIsSubmitting(true)
    try {
      const response = await commentAPI.createComment({
        content: replyContent,
        blog: blogId, // Changed from blogId to blog
        parentCommentId,
      })

      // Update the parent comment's replies
      setComments((prev) =>
        prev.map((comment) =>
          comment._id === parentCommentId
            ? { ...comment, replies: [...(comment.replies || []), response.data.data] }
            : comment,
        ),
      )

      setReplyTo(null)
      setReplyContent("")
      toast.success("Reply added successfully")
    } catch (error) {
      console.error("Reply creation error:", error)
      toast.error(error.response?.data?.message || "Failed to add reply")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditComment = async (commentId) => {
    if (!editContent.trim()) return

    setIsSubmitting(true)
    try {
      const response = await commentAPI.updateComment(commentId, {
        content: editContent,
      })

      setComments((prev) => prev.map((comment) => (comment._id === commentId ? response.data.data : comment)))

      setEditingComment(null)
      setEditContent("")
      toast.success("Comment updated successfully")
    } catch (error) {
      console.error("Comment update error:", error)
      toast.error("Failed to update comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return

    try {
      await commentAPI.deleteComment(commentId)
      setComments((prev) => prev.filter((comment) => comment._id !== commentId))
      toast.success("Comment deleted successfully")
    } catch (error) {
      console.error("Comment deletion error:", error)
      toast.error("Failed to delete comment")
    }
  }

  const handleLikeComment = async (commentId) => {
    if (!isAuthenticated) {
      toast.error("Please login to like comments")
      return
    }

    try {
      const response = await commentAPI.likeComment(commentId)
      // Update comment likes in state
      setComments((prev) =>
        prev.map((comment) =>
          comment._id === commentId
            ? {
                ...comment,
                isLiked: response.data.data.isLiked,
                likesCount: response.data.data.likesCount,
              }
            : comment,
        ),
      )
    } catch (error) {
      console.error("Comment like error:", error)
      toast.error("Failed to like comment")
    }
  }

  const CommentItem = ({ comment, isReply = false }) => (
    <div className={`${isReply ? "ml-12" : ""} mb-6`}>
      <div className="flex space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author.avatar || "/placeholder.svg"} alt={comment.author.username} />
          <AvatarFallback className="text-xs">
            {getInitials(comment.author.firstName, comment.author.lastName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-medium text-sm text-gray-900">
                  {comment.author.firstName} {comment.author.lastName}
                </span>
                <span className="text-xs text-gray-500 ml-2">{formatRelativeTime(comment.createdAt)}</span>
                {comment.isEdited && <span className="text-xs text-gray-400 ml-1">(edited)</span>}
              </div>

              {user && user._id === comment.author._id && (
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingComment(comment._id)
                      setEditContent(comment.content)
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteComment(comment._id)}>
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              )}
            </div>

            {editingComment === comment._id ? (
              <div className="space-y-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                />
                <div className="flex space-x-2">
                  <Button size="sm" onClick={() => handleEditComment(comment._id)} disabled={isSubmitting}>
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingComment(null)
                      setEditContent("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 text-sm">{comment.content}</p>
            )}
          </div>

          {/* Comment Actions */}
          <div className="flex items-center space-x-4 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLikeComment(comment._id)}
              className={`text-gray-500 hover:text-red-500 ${comment.isLiked ? "text-red-500" : ""}`}
            >
              <Heart className={`h-3 w-3 mr-1 ${comment.isLiked ? "fill-current" : ""}`} />
              <span className="text-xs">{comment.likesCount || 0}</span>
            </Button>

            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setReplyTo(replyTo === comment._id ? null : comment._id)
                  setReplyContent("")
                }}
                className="text-gray-500 hover:text-blue-500"
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
          </div>

          {/* Reply Form */}
          {replyTo === comment._id && (
            <div className="mt-3 ml-3">
              <div className="flex space-x-3">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.username} />
                  <AvatarFallback className="text-xs">{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full p-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={2}
                  />
                  <div className="flex space-x-2 mt-2">
                    <Button size="sm" onClick={() => handleSubmitReply(comment._id)} disabled={isSubmitting}>
                      <Send className="h-3 w-3 mr-1" />
                      Reply
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setReplyTo(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4">
              {comment.replies.map((reply) => (
                <CommentItem key={reply._id} comment={reply} isReply={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Comments ({comments.length})</h3>

      {/* Debug Info in Development */}
      {/* {process.env.NODE_ENV === "development" && (
        <div className="bg-gray-100 p-2 rounded mb-4 text-xs">
          <strong>Comment Debug:</strong> BlogId: {blogId} | Comments: {comments.length} | User:{" "}
          {user?.username || "Not logged in"}
        </div>
      )} */}

      {/* Add Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.username} />
              <AvatarFallback className="text-xs">{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="What are your thoughts?"
                className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
              />
              <div className="flex justify-end mt-3">
                <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Posting..." : "Comment"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6 text-center mb-8">
          <p className="text-gray-600 mb-4">Join the conversation</p>
          <div className="space-x-3">
            <Button asChild>
              <a href="/login">Login</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/register">Sign Up</a>
            </Button>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment) => <CommentItem key={comment._id} comment={comment} />)
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CommentSection
