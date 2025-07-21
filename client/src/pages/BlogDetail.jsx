"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery } from "react-query"
import { useAuth } from "../contexts/AuthContext"
import { blogAPI } from "../services/api"
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import CommentSection from "../components/CommentSection"
import { formatDate, getInitials } from "../lib/utils"
import {
  Heart,
  MessageCircle,
  Eye,
  Clock,
  Share2,
  Bookmark,
  Edit,
  Trash2,
  ArrowLeft,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  AlertCircle,
} from "lucide-react"
import toast from "react-hot-toast"

const BlogDetail = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [isLiking, setIsLiking] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

  // Debug logging
  useEffect(() => {
    // console.log("BlogDetail mounted with slug:", slug)
    // console.log("User authenticated:", isAuthenticated)
    // console.log("Current user:", user)
  }, [slug, isAuthenticated, user])

  const { data, isLoading, error, refetch } = useQuery(
    ["blog", slug],
    async () => {
      // console.log("Fetching blog with slug:", slug)
      try {
        const response = await blogAPI.getBlogBySlug(slug)
        // console.log("Blog fetch successful:", response.data)
        return response.data // Return response.data directly, not response
      } catch (err) {
        // console.error("Blog fetch error:", err)
        throw err
      }
    },
    {
      enabled: !!slug,
      retry: 2,
      retryDelay: 1000,
      onError: (error) => {
        // console.error("Query error:", error)
      },
    },
  )

  // Now data should be the API response data directly
  const blog = data?.data?.blog // This should now work correctly
  const comments = data?.data?.comments || []

  // Debug logging for blog data
  useEffect(() => {
    // console.log("Raw query data:", data)
    // console.log("Extracted blog:", blog)
    if (blog) {
      // console.log("Blog loaded:", {
      //   id: blog._id,
      //   title: blog.title,
      //   slug: blog.slug,
      //   status: blog.status,
      //   author: blog.author,
      // })
    } else {
      // console.log("Blog is null/undefined")
      // console.log("Data structure:", JSON.stringify(data, null, 2))
    }
  }, [data, blog])

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to like posts")
      return
    }

    if (blog.status !== "published") {
      toast.error("Cannot like draft posts")
      return
    }

    setIsLiking(true)
    try {
      const response = await blogAPI.likeBlog(blog._id)
      // Update blog data with new like status
      blog.isLiked = response.data.data.isLiked
      blog.likesCount = response.data.data.likesCount
      toast.success(response.data.message)
      refetch()
    } catch (error) {
      toast.error("Failed to like post")
    } finally {
      setIsLiking(false)
    }
  }

  const handleBookmark = () => {
    if (!isAuthenticated) {
      toast.error("Please login to bookmark posts")
      return
    }
    setIsBookmarked(!isBookmarked)
    toast.success(isBookmarked ? "Removed from bookmarks" : "Added to bookmarks")
  }

  const handleShare = (platform) => {
    const url = window.location.href
    const title = blog.title
    const text = blog.excerpt || blog.title

    switch (platform) {
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`)
        break
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)
        break
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
        )
        break
      case "copy":
        navigator.clipboard.writeText(url)
        toast.success("Link copied to clipboard!")
        break
    }
    setShowShareMenu(false)
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) return

    try {
      await blogAPI.deleteBlog(blog._id)
      toast.success("Blog post deleted successfully")
      navigate("/dashboard")
    } catch (error) {
      toast.error("Failed to delete blog post")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading blog post...</p>
            <p className="text-sm text-gray-500 mt-2">Slug: {slug}</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    // console.error("BlogDetail error:", error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Blog</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-red-800 font-medium">Debug Information:</p>
            <p className="text-red-700 text-sm mt-1">Slug: {slug}</p>
            <p className="text-red-700 text-sm">Status: {error.response?.status}</p>
            <p className="text-red-700 text-sm">Message: {error.response?.data?.message || error.message}</p>
            <p className="text-red-700 text-sm">URL: {error.config?.url}</p>
          </div>
          <div className="space-x-4">
            <Button onClick={() => refetch()}>Try Again</Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Home
            </Button>
            {isAuthenticated && (
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                My Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Enhanced blog existence check with detailed debugging
  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Data Received</h1>
          <p className="text-gray-600 mb-6">The API didn't return any data.</p>
          <div className="bg-gray-100 border rounded-lg p-4 mb-6 text-left max-w-md">
            <p className="text-gray-800 font-medium">Debug Information:</p>
            <p className="text-gray-700 text-sm mt-1">Slug: {slug}</p>
            <p className="text-gray-700 text-sm">Data: {JSON.stringify(data)}</p>
            <p className="text-gray-700 text-sm">Loading: {isLoading.toString()}</p>
            <p className="text-gray-700 text-sm">Error: {error ? error.message : "None"}</p>
          </div>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    )
  }

  if (!data.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">API Error</h1>
          <p className="text-gray-600 mb-6">The API returned an error response.</p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left max-w-md">
            <p className="text-red-800 font-medium">API Response:</p>
            <pre className="text-red-700 text-xs mt-1 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
          </div>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    )
  }

  if (!data.data || !data.data.blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Data Missing</h1>
          <p className="text-gray-600 mb-6">The blog data is missing from the API response.</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left max-w-md">
            <p className="text-yellow-800 font-medium">API Response Structure:</p>
            <pre className="text-yellow-700 text-xs mt-1 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
          </div>
          <div className="space-x-4">
            <Button onClick={() => refetch()}>Retry</Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // At this point, we know blog exists
  const isAuthor = user && user._id === blog.author._id
  const isDraft = blog.status === "draft"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Debug Info in Development */}
      {/* {process.env.NODE_ENV === "development" && (
        <div className="bg-green-50 border-b border-green-200 p-2">
          <div className="max-w-4xl mx-auto text-xs text-green-800">
            <strong>✅ Blog Found:</strong> Slug: {slug} | Blog ID: {blog._id} | Status: {blog.status} | Author:{" "}
            {blog.author.username} | Title: {blog.title}
          </div>
        </div>
      )} */}

      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Draft Notice */}
        {isDraft && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Draft Post</h3>
                <p className="text-sm text-yellow-700">
                  This is a draft post and is only visible to you. Publish it to make it public.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Badge variant={isDraft ? "secondary" : "default"}>{blog.category}</Badge>
            {isDraft && <Badge variant="outline">Draft</Badge>}
            <span className="text-gray-500">•</span>
            <div className="flex items-center text-gray-500 text-sm">
              <Clock className="h-4 w-4 mr-1" />
              <span>{blog.readTime} min read</span>
            </div>
            {!isDraft && (
              <>
                <span className="text-gray-500">•</span>
                <div className="flex items-center text-gray-500 text-sm">
                  <Eye className="h-4 w-4 mr-1" />
                  <span>{blog.views} views</span>
                </div>
              </>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">{blog.title}</h1>

          {blog.excerpt && <p className="text-xl text-gray-600 mb-6 leading-relaxed">{blog.excerpt}</p>}

          {/* Author Info */}
          <div className="flex items-center justify-between">
            <Link
              to={`/profile/${blog.author.username}`}
              className="flex items-center space-x-4 hover:opacity-80 transition-opacity"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={blog.author.avatar || "/placeholder.svg"} alt={blog.author.username} />
                <AvatarFallback>{getInitials(blog.author.firstName, blog.author.lastName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900">
                  {blog.author.firstName} {blog.author.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  {isDraft ? "Created" : "Published"} on {formatDate(blog.publishedAt || blog.createdAt)}
                </p>
              </div>
            </Link>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {isAuthor && (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/edit-blog/${blog._id}`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {blog.featuredImage && (
          <div className="mb-8">
            <img
              src={blog.featuredImage || "/placeholder.svg"}
              alt={blog.title}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="blog-content prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: blog.content }} />

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t">
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Engagement Bar - Only for published posts */}
        {!isDraft && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Button
                  variant="ghost"
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`text-gray-600 hover:text-red-500 ${blog.isLiked ? "text-red-500" : ""}`}
                >
                  <Heart className={`h-5 w-5 mr-2 ${blog.isLiked ? "fill-current" : ""}`} />
                  <span>{blog.likesCount || 0} Likes</span>
                </Button>

                <Button variant="ghost" className="text-gray-600 hover:text-blue-500">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  <span>{comments.length} Comments</span>
                </Button>

                <Button
                  variant="ghost"
                  onClick={handleBookmark}
                  className={`text-gray-600 hover:text-yellow-500 ${isBookmarked ? "text-yellow-500" : ""}`}
                >
                  <Bookmark className={`h-5 w-5 mr-2 ${isBookmarked ? "fill-current" : ""}`} />
                  <span>Bookmark</span>
                </Button>
              </div>

              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="text-gray-600 hover:text-primary"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>

                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={() => handleShare("twitter")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                      Share on Twitter
                    </button>
                    <button
                      onClick={() => handleShare("facebook")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                      Share on Facebook
                    </button>
                    <button
                      onClick={() => handleShare("linkedin")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
                      Share on LinkedIn
                    </button>
                    <button
                      onClick={() => handleShare("copy")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Author Bio */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={blog.author.avatar || "/placeholder.svg"} alt={blog.author.username} />
              <AvatarFallback className="text-lg">
                {getInitials(blog.author.firstName, blog.author.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {blog.author.firstName} {blog.author.lastName}
              </h3>
              {blog.author.bio && <p className="text-gray-600 mb-3">{blog.author.bio}</p>}
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/profile/${blog.author.username}`}>View Profile</Link>
                </Button>
                {blog.author.socialLinks && (
                  <div className="flex space-x-2">
                    {blog.author.socialLinks.twitter && (
                      <a
                        href={blog.author.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-400"
                      >
                        <Twitter className="h-4 w-4" />
                      </a>
                    )}
                    {blog.author.socialLinks.linkedin && (
                      <a
                        href={blog.author.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section - Only for published posts */}
        {!isDraft && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <CommentSection blogId={blog._id} comments={comments} />
          </div>
        )}
      </article>
    </div>
  )
}

export default BlogDetail
