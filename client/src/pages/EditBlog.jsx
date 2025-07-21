"use client"

import React from "react"

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "react-query"
import { blogAPI } from "../services/api"
import BlogEditor from "../components/BlogEditor"
import { Button } from "../components/ui/button"
import { ArrowLeft, Save, Send } from "lucide-react"
import toast from "react-hot-toast"

const EditBlog = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const {
    data,
    isLoading: isFetching,
    error,
  } = useQuery(
    ["blog-edit", id],
    async () => {
      console.log("Fetching blog for edit:", id)
      const response = await blogAPI.getBlogById(id)
      console.log("Edit blog response:", response.data)
      return response.data // Return response.data directly
    },
    {
      enabled: !!id,
    },
  )

  const blog = data?.data

  const [blogData, setBlogData] = useState({
    title: blog?.title || "",
    content: blog?.content || "",
    excerpt: blog?.excerpt || "",
    category: blog?.category || "",
    tags: blog?.tags || [],
    featuredImage: null, // Don't set existing image as file
  })

  // Update blogData when blog loads
  React.useEffect(() => {
    if (blog) {
      setBlogData({
        title: blog.title || "",
        content: blog.content || "",
        excerpt: blog.excerpt || "",
        category: blog.category || "",
        tags: blog.tags || [],
        featuredImage: null, // Don't set existing image as file
      })
    }
  }, [blog])

  const handleSubmit = async (status) => {
    setIsLoading(true)
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

      // console.log("Updating blog:", id, "with status:", status)
      const response = await blogAPI.updateBlog(id, formData)
      const updatedBlog = response.data.data

      toast.success(response.data.message)
      navigate(`/blog/${updatedBlog.slug}`)
    } catch (error) {
      console.error("Update blog error:", error)
      toast.error(error.response?.data?.message || "Failed to update blog")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveDraft = () => handleSubmit("draft")
  const handlePublish = () => handleSubmit("published")

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog for editing...</p>
        </div>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog not found</h1>
          <p className="text-gray-600 mb-6">
            The blog post you're trying to edit doesn't exist or you don't have permission to edit it.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left max-w-md">
            <p className="text-red-800 font-medium">Debug Information:</p>
            <p className="text-red-700 text-sm mt-1">Blog ID: {id}</p>
            <p className="text-red-700 text-sm">
              Error: {error?.response?.data?.message || error?.message || "Unknown error"}
            </p>
            <p className="text-red-700 text-sm">Status: {error?.response?.status}</p>
          </div>
          <div className="space-x-4">
            <Button onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Go Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Debug Info in Development */}
      {/* {process.env.NODE_ENV === "development" && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-2">
          <div className="max-w-4xl mx-auto text-xs text-yellow-800">
            <strong>Edit Debug:</strong> Blog ID: {id} | Title: {blog.title} | Status: {blog.status} | Author:{" "}
            {blog.author?.username}
          </div>
        </div>
      )} */}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate(-1)} disabled={isLoading}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Blog</h1>
              <p className="text-gray-600 mt-1">Update your blog post</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleSaveDraft} disabled={isLoading} className="flex items-center">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Draft"}
            </Button>
            <Button onClick={handlePublish} disabled={isLoading} className="flex items-center">
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </div>

        {/* Blog Editor */}
        <BlogEditor blogData={blogData} setBlogData={setBlogData} isSubmitting={isLoading} />
      </div>
    </div>
  )
}

export default EditBlog
