"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { blogAPI } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import BlogEditor from "../components/BlogEditor"
import { Button } from "../components/ui/button"
import { ArrowLeft, Save, Send, ExternalLink } from "lucide-react"
import toast from "react-hot-toast"

const CreateBlog = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [blogData, setBlogData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    tags: [],
    featuredImage: null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastCreatedBlog, setLastCreatedBlog] = useState(null)

  const validateBlogData = () => {
    console.log("Validating blog data:", blogData)

    if (!blogData.title || !blogData.title.trim()) {
      toast.error("Title is required")
      return false
    }

    if (!blogData.content || !blogData.content.trim() || blogData.content === "<p><br></p>") {
      toast.error("Content is required")
      return false
    }

    if (!blogData.category || !blogData.category.trim()) {
      toast.error("Category is required")
      return false
    }

    return true
  }

  const handleSubmit = async (status) => {
    if (!validateBlogData()) {
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("title", blogData.title.trim())
      formData.append("content", blogData.content)
      formData.append("excerpt", blogData.excerpt.trim())
      formData.append("category", blogData.category)
      formData.append("tags", JSON.stringify(blogData.tags))
      formData.append("status", status)

      if (blogData.featuredImage) {
        formData.append("featuredImage", blogData.featuredImage)
      }

      // console.log("Submitting blog with status:", status)

      const response = await blogAPI.createBlog(formData)
      const blog = response.data.data

      // console.log("Blog created successfully:", blog)
      setLastCreatedBlog(blog)

      toast.success(response.data.message)

      // Wait a moment for the database to update
      setTimeout(() => {
        if (status === "published") {
          // console.log("Navigating to:", `/blog/${blog.slug}`)
          navigate(`/blog/${blog.slug}`)
        } else {
          navigate("/dashboard")
        }
      }, 1000)
    } catch (error) {
      // console.error("Create blog error:", error)
      toast.error(error.response?.data?.message || "Failed to create blog")
    } finally {
      setIsSubmitting(false)
    }
  }

  const testBlogAccess = async () => {
    if (!lastCreatedBlog) return

    try {
      // console.log("Testing blog access for slug:", lastCreatedBlog.slug)
      const response = await blogAPI.getBlogBySlug(lastCreatedBlog.slug)
      // console.log("Test successful:", response.data)
      toast.success("Blog is accessible!")
    } catch (error) {
      console.error("Test failed:", error)
      toast.error("Blog not accessible: " + error.response?.data?.message)
    }
  }

  const handleSaveDraft = () => handleSubmit("draft")
  const handlePublish = () => handleSubmit("published")

  if (!user) {
    navigate("/login")
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Blog</h1>
              <p className="text-gray-600 mt-1">Share your thoughts with the world</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleSaveDraft} disabled={isSubmitting} className="flex items-center">
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Draft"}
            </Button>
            <Button onClick={handlePublish} disabled={isSubmitting} className="flex items-center">
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </div>

        {/* Success Message with Test Button */}
        {lastCreatedBlog && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-green-800">Blog Created Successfully!</h3>
                <p className="text-sm text-green-700 mt-1">
                  Blog "{lastCreatedBlog.title}" was created with slug: {lastCreatedBlog.slug}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={testBlogAccess}>
                  Test Access
                </Button>
                <Button size="sm" asChild>
                  <a href={`/blog/${lastCreatedBlog.slug}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Blog
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Debug Info */}
        {/* {process.env.NODE_ENV === "development" && (
          <div className="bg-gray-100 p-4 rounded mb-4 text-sm">
            <strong>Debug Info:</strong>
            <br />
            User: {user?.username} ({user?._id})
            <br />
            Title: {blogData.title || "Empty"}
            <br />
            Category: {blogData.category || "Empty"}
            <br />
            Content Length: {blogData.content?.length || 0}
            <br />
            API URL: {import.meta.env.VITE_API_URL || "http://localhost:5000/api"}
            {lastCreatedBlog && (
              <>
                <br />
                <strong>Last Created Blog:</strong>
                <br />
                ID: {lastCreatedBlog._id}
                <br />
                Slug: {lastCreatedBlog.slug}
                <br />
                Status: {lastCreatedBlog.status}
              </>
            )}
          </div>
        )} */}

        {/* Blog Editor */}
        <BlogEditor blogData={blogData} setBlogData={setBlogData} isSubmitting={isSubmitting} />
      </div>
    </div>
  )
}

export default CreateBlog
