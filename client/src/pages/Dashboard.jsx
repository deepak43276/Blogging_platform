"use client"

import { useState } from "react"
import { useQuery } from "react-query"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { blogAPI } from "../services/api"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { formatDate, formatRelativeTime } from "../lib/utils"
import { PenTool, FileText, Eye, Heart, Edit, Trash2, Plus, BarChart3, TrendingUp } from "lucide-react"
import toast from "react-hot-toast"

const Dashboard = () => {
  const { user, isAuthenticated, token, loading } = useAuth()


  // console.log("🧠 Dashboard - user:", user)
  // console.log("✅ isAuthenticated:", isAuthenticated)
  // console.log("🔐 token:", token)
  // console.log("⏳ loading:", loading)
  
  const [activeTab, setActiveTab] = useState("overview")
  const [blogFilter, setBlogFilter] = useState("all")

  const {
    data: blogsData,
    isLoading: blogsLoading,
    refetch,
    error,
  } = useQuery(
    ["my-blogs"],
    async () => {
      const response = await blogAPI.getMyBlogs({ limit: 50 })
      return response.data
    },
    {
      enabled: !!user && !loading,
      refetchOnWindowFocus: false,
      retry: 3,
    },
  )

  const blogs = blogsData?.data?.blogs || []

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return

    try {
      await blogAPI.deleteBlog(blogId)
      toast.success("Blog deleted successfully")
      refetch()
    } catch (error) {
      toast.error("Failed to delete blog")
    }
  }

  const stats = {
    totalBlogs: blogs.length,
    publishedBlogs: blogs.filter((blog) => blog.status === "published").length,
    draftBlogs: blogs.filter((blog) => blog.status === "draft").length,
    totalViews: blogs.reduce((sum, blog) => sum + (blog.views || 0), 0),
    totalLikes: blogs.reduce((sum, blog) => sum + (blog.likes?.length || 0), 0),
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "blogs", label: "My Blogs", icon: FileText },
  ]

  const filteredBlogs = blogs.filter((blog) => {
    if (blogFilter === "published") return blog.status === "published"
    if (blogFilter === "draft") return blog.status === "draft"
    if (blogFilter === "views") return blog.views && blog.views > 0
    if (blogFilter === "likes") return blog.likes && blog.likes > 0
    return true
  })

  const handleStatClick = (filterType) => {
    setBlogFilter(filterType)
    setActiveTab("blogs")
  }

  // Show loading while processing OAuth or loading user
  if (loading || blogsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load dashboard: {error.message}</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    
    <div className="min-h-screen bg-gray-50">
      
      {/* Debug Info in Development */}
      {/* {process.env.NODE_ENV === "development" && (
        <div className="bg-green-50 border-b border-green-200 p-2">
          <div className="max-w-7xl mx-auto text-xs text-green-800">
            <strong>Dashboard Debug:</strong> Found {blogs.length} blogs | User: {user?.username} | Role: {user?.role} |
            Filter: {blogFilter}
          </div>
        </div>
      )} */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.firstName || user?.username}!</p>
          </div>
          <Button asChild className="mt-4 sm:mt-0">
            <Link to="/create-blog">
              <Plus className="h-4 w-4 mr-2" />
              Write New Blog
            </Link>
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleStatClick("all")}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Blogs</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalBlogs}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleStatClick("published")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <PenTool className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Published</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.publishedBlogs}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleStatClick("draft")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Edit className="h-8 w-8 text-yellow-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Drafts</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.draftBlogs}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleStatClick("views")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Eye className="h-8 w-8 text-purple-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Views</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleStatClick("likes")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Heart className="h-8 w-8 text-red-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Likes</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalLikes}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Blogs */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Blogs ({blogs.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {blogs.length > 0 ? (
                  <div className="space-y-4">
                    {blogs.slice(0, 5).map((blog) => (
                      <div key={blog._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant={blog.status === "published" ? "default" : "secondary"}>{blog.status}</Badge>
                            <Badge variant="outline">{blog.category}</Badge>
                          </div>
                          <Link
                            to={`/blog/${blog.slug}`}
                            className="text-lg font-medium text-gray-900 hover:text-primary block mb-2"
                          >
                            {blog.title}
                          </Link>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{formatRelativeTime(blog.createdAt)}</span>
                            <div className="flex items-center space-x-3">
                              <span className="flex items-center">
                                <Eye className="h-4 w-4 mr-1" />
                                {blog.views || 0}
                              </span>
                              <span className="flex items-center">
                                <Heart className="h-4 w-4 mr-1" />
                                {blog.likes?.length || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/edit-blog/${blog._id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteBlog(blog._id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <PenTool className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs yet</h3>
                    <p className="text-gray-600 mb-4">Start writing your first blog post!</p>
                    <Button asChild>
                      <Link to="/create-blog">Create Your First Blog</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Blogs Tab */}
        {activeTab === "blogs" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">
                My Blogs ({filteredBlogs.length})
                {blogFilter !== "all" && (
                  <span className="text-lg font-normal text-gray-600 ml-2">
                    - {blogFilter === "published" ? "Published" : "Drafts"}
                  </span>
                )}
              </h2>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Button
                    variant={blogFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setBlogFilter("all")}
                  >
                    All ({blogs.length})
                  </Button>
                  <Button
                    variant={blogFilter === "published" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setBlogFilter("published")}
                  >
                    Published ({stats.publishedBlogs})
                  </Button>
                  <Button
                    variant={blogFilter === "draft" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setBlogFilter("draft")}
                  >
                    Drafts ({stats.draftBlogs})
                  </Button>
                </div>
                <Button asChild>
                  <Link to="/create-blog">
                    <Plus className="h-4 w-4 mr-2" />
                    New Blog
                  </Link>
                </Button>
              </div>
            </div>

            {filteredBlogs.length > 0 ? (
              <div className="grid gap-6">
                {filteredBlogs.map((blog) => (
                  <Card key={blog._id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant={blog.status === "published" ? "default" : "secondary"}>{blog.status}</Badge>
                            <Badge variant="outline">{blog.category}</Badge>
                          </div>
                          <Link
                            to={`/blog/${blog.slug}`}
                            className="text-xl font-semibold text-gray-900 hover:text-primary mb-2 block"
                          >
                            {blog.title}
                          </Link>
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {blog.excerpt || blog.content.replace(/<[^>]*>/g, "").substring(0, 150) + "..."}
                          </p>
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <span>Created {formatDate(blog.createdAt)}</span>
                            <span className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {blog.views || 0} views
                            </span>
                            <span className="flex items-center">
                              <Heart className="h-4 w-4 mr-1" />
                              {blog.likes?.length || 0} likes
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/edit-blog/${blog._id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteBlog(blog._id)}>
                            <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <PenTool className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {blogFilter === "all" ? "No blogs yet" : `No ${blogFilter} blogs`}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {blogFilter === "all"
                      ? "Start sharing your thoughts with the world!"
                      : `You don't have any ${blogFilter} blogs yet.`}
                  </p>
                  <Button asChild>
                    <Link to="/create-blog">Write Your First Blog</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Analytics Tab */}
      </div>
    </div>
  )
}

export default Dashboard
