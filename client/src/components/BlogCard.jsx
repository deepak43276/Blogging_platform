"use client"

import { Link } from "react-router-dom"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { formatRelativeTime, truncateText, getInitials } from "../lib/utils"
import { Heart, MessageCircle, Eye, Clock, Bookmark } from "lucide-react"
import { useState } from "react"
import { blogAPI } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import toast from "react-hot-toast"

const BlogCard = ({ blog, onLikeUpdate }) => {
  const { isAuthenticated } = useAuth()
  const [isLiking, setIsLiking] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  const handleLike = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error("Please login to like posts")
      return
    }

    setIsLiking(true)
    try {
      const response = await blogAPI.likeBlog(blog._id)
      onLikeUpdate?.(blog._id, response.data.data)
      toast.success(response.data.message)
    } catch (error) {
      toast.error("Failed to like post")
    } finally {
      setIsLiking(false)
    }
  }

  const handleBookmark = (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error("Please login to bookmark posts")
      return
    }
    setIsBookmarked(!isBookmarked)
    toast.success(isBookmarked ? "Removed from bookmarks" : "Added to bookmarks")
  }

  return (
    <article className="w-full h-full flex flex-col bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group p-6">
      {/* Featured Image */}
      {blog.featuredImage && (
        <div className="aspect-video overflow-hidden mb-4">
          <Link to={`/blog/${blog.slug}`}>
            <img
              src={blog.featuredImage || "/placeholder.svg"}
              alt={blog.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>
      )}

      {/* Category & Read Time */}
      <div className="flex items-center justify-between mb-3">
        <Badge variant="secondary" className="text-xs">
          {blog.category}
        </Badge>
        <div className="flex items-center text-gray-500 text-sm">
          <Clock className="h-3 w-3 mr-1" />
          <span>{blog.readTime} min read</span>
        </div>
      </div>

      {/* Title */}
      <Link to={`/blog/${blog.slug}`}>
        <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {blog.title}
        </h2>
      </Link>

      {/* Excerpt */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {blog.excerpt || truncateText(blog.content.replace(/<[^>]*>/g, ""), 120)}
      </p>

      {/* Tags */}
      {blog.tags && blog.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {blog.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full hover:bg-gray-200 transition-colors"
            >
              #{tag}
            </span>
          ))}
          {blog.tags.length > 3 && <span className="text-xs text-gray-500">+{blog.tags.length - 3} more</span>}
        </div>
      )}

      {/* Author & Meta */}
      <div className="flex items-center justify-between mt-auto pt-2">
        <Link
          to={`/profile/${blog.author.username}`}
          className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={blog.author.avatar || "/placeholder.svg"} alt={blog.author.username} />
            <AvatarFallback className="text-xs">
              {getInitials(blog.author.firstName, blog.author.lastName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {blog.author.firstName} {blog.author.lastName}
            </p>
            <p className="text-xs text-gray-500">{formatRelativeTime(blog.createdAt)}</p>
          </div>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isLiking}
            className={`p-2 bg-transparent shadow-none text-gray-500 hover:text-red-500 ${blog.isLiked ? "text-red-500" : ""}`}
          >
            <Heart className={`h-4 w-4 ${blog.isLiked ? "fill-current" : ""}`} />
            <span className="text-xs ml-1">{blog.likesCount || 0}</span>
          </Button>

          <Button variant="ghost" size="sm" className="p-2 bg-transparent shadow-none text-gray-500 hover:text-blue-500">
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs ml-1">0</span>
          </Button>

          <Button variant="ghost" size="sm" className="p-2 bg-transparent shadow-none text-gray-500 hover:text-green-500">
            <Eye className="h-4 w-4" />
            <span className="text-xs ml-1">{blog.views || 0}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            className={`p-2 bg-transparent shadow-none text-gray-500 hover:text-yellow-500 ${isBookmarked ? "text-yellow-500" : ""}`}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
          </Button>
        </div>
      </div>
    </article>
  )
}

export default BlogCard
