"use client"

import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "react-query"
import { useAuth } from "../contexts/AuthContext"
import { adminAPI } from "../services/api"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { formatDate } from "../lib/utils"
import {
  Users,
  FileText,
  MessageCircle,
  Shield,
  Settings,
  BarChart3,
  Eye,
  Ban,
  Trash2,
  AlertCircle,
  X,
} from "lucide-react"
import toast from "react-hot-toast"

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview")
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const [detailedStatsModal, setDetailedStatsModal] = useState({ open: false, type: "", title: "" })

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery(["admin-stats"], adminAPI.getDashboardStats, {
    retry: 3,
    retryDelay: 1000,
    onSuccess: (data) => {
    },
    onError: (error) => {
      toast.error("Failed to load dashboard stats")
    },
  })

  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useQuery(["admin-users"], () => adminAPI.getAllUsers({ limit: 20 }), {
    enabled: activeTab === "users",
    retry: 2,
    onSuccess: (data) => {
    },
    onError: (error) => {
      toast.error("Failed to load users")
    },
  })

  const {
    data: blogsData,
    isLoading: blogsLoading,
    error: blogsError,
    refetch: refetchBlogs,
  } = useQuery(["admin-blogs"], () => adminAPI.getAllBlogs({ limit: 20 }), {
    enabled: activeTab === "blogs",
    retry: 2,
    onSuccess: (data) => {
    },
    onError: (error) => {
      toast.error("Failed to load blogs")
    },
  })

  const {
    data: detailedStatsData,
    isLoading: detailedStatsLoading,
    refetch: refetchDetailedStats,
  } = useQuery(
    ["admin-detailed-stats", detailedStatsModal.type],
    () => adminAPI.getDetailedStats(detailedStatsModal.type, { limit: 50 }),
    {
      enabled: detailedStatsModal.open && !!detailedStatsModal.type,
      onSuccess: (data) => {
      },
    },
  )

  // Extract data with fallbacks
  const stats = statsData?.data?.data?.stats || {
    totalUsers: 0,
    totalBlogs: 0,
    totalComments: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
  }

  const recentActivity = statsData?.data?.data?.recentActivity || {
    users: [],
    blogs: [],
  }

  const users = usersData?.data?.data?.users || []
  const blogs = blogsData?.data?.data?.blogs || []

  // Debug logging
  useEffect(() => {
  }, [activeTab, statsLoading, statsError, stats, recentActivity, users.length, blogs.length, user])

  const handleUserStatusUpdate = async (userId, isActive) => {
    try {
      await adminAPI.updateUserStatus(userId, { isActive })
      toast.success(`User ${isActive ? "activated" : "deactivated"} successfully`)
      refetchUsers()
      refetchStats()
    } catch (error) {
      toast.error("Failed to update user status")
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return

    try {
      await adminAPI.deleteUser(userId)
      toast.success("User deleted successfully")
      refetchUsers()
      refetchStats()
    } catch (error) {
      toast.error("Failed to delete user")
    }
  }

  const handleBlogStatusUpdate = async (blogId, status) => {
    try {
      await adminAPI.updateBlogStatus(blogId, { status })
      toast.success("Blog status updated successfully")
      refetchBlogs()
      refetchStats()
    } catch (error) {
      toast.error("Failed to update blog status")
    }
  }

  const handleStatsCardClick = (type, title) => {
    setDetailedStatsModal({ open: true, type, title })
  }

  const handleUserRoleUpdate = async (userId, newRole) => {
    // Prevent admin from changing their own role
    if (userId === user?._id) {
      toast.error("You cannot change your own role")
      return
    }

    try {
      await adminAPI.updateUserRole(userId, { role: newRole })
      toast.success(`User role updated to ${newRole} successfully`)
      refetchUsers()
      refetchStats()
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user role")
    }
  }

  const closeModal = () => {
    setDetailedStatsModal({ open: false, type: "", title: "" })
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "blogs", label: "Blogs", icon: FileText },
  ]

  // Error display component
  const ErrorDisplay = ({ error, onRetry, title }) => (
    <Card className="border-red-200">
      <CardContent className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-700 mb-2">{title}</h3>
        <p className="text-red-600 mb-4">{error?.response?.data?.message || error?.message || "Unknown error"}</p>
        <Button onClick={onRetry} variant="outline" className="text-red-600 border-red-300">
          Try Again
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Shield className="h-8 w-8 mr-3 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.firstName} {user?.lastName} • Manage your blogging platform
            </p>
          </div>
          <Button onClick={refetchStats} variant="outline" disabled={statsLoading}>
            {statsLoading ? "Refreshing..." : "Refresh Data"}
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
            {statsError ? (
              <ErrorDisplay error={statsError} onRetry={refetchStats} title="Failed to Load Dashboard Stats" />
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <button
                    onClick={() => handleStatsCardClick("users", "All Users")}
                    className="w-full text-left hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <Card className="hover:border-blue-300">
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <Users className="h-8 w-8 text-blue-500" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {statsLoading ? "..." : stats.totalUsers}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">Click to view details</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </button>

                  <button
                    onClick={() => handleStatsCardClick("blogs", "All Blogs")}
                    className="w-full text-left hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <Card className="hover:border-green-300">
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <FileText className="h-8 w-8 text-green-500" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Blogs</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {statsLoading ? "..." : stats.totalBlogs}
                            </p>
                            <p className="text-xs text-green-600 mt-1">Click to view details</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </button>

                  <button
                    onClick={() => handleStatsCardClick("published-blogs", "Published Blogs")}
                    className="w-full text-left hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <Card className="hover:border-purple-300">
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <Eye className="h-8 w-8 text-purple-500" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Published Blogs</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {statsLoading ? "..." : stats.publishedBlogs}
                            </p>
                            <p className="text-xs text-purple-600 mt-1">Click to view details</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </button>

                  <button
                    onClick={() => handleStatsCardClick("comments", "All Comments")}
                    className="w-full text-left hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <Card className="hover:border-orange-300">
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <MessageCircle className="h-8 w-8 text-orange-500" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Comments</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {statsLoading ? "..." : stats.totalComments}
                            </p>
                            <p className="text-xs text-orange-600 mt-1">Click to view details</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Users ({recentActivity.users?.length || 0})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {statsLoading ? (
                        <div className="space-y-4">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                <div className="space-y-1">
                                  <div className="w-24 h-4 bg-gray-200 rounded"></div>
                                  <div className="w-16 h-3 bg-gray-200 rounded"></div>
                                </div>
                              </div>
                              <div className="w-16 h-3 bg-gray-200 rounded"></div>
                            </div>
                          ))}
                        </div>
                      ) : recentActivity.users?.length > 0 ? (
                        <div className="space-y-4">
                          {recentActivity.users.map((user) => (
                            <div key={user._id} className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-sm text-gray-500">@{user.username}</p>
                              </div>
                              <p className="text-sm text-gray-500">{formatDate(user.createdAt)}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No recent users</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Blogs ({recentActivity.blogs?.length || 0})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {statsLoading ? (
                        <div className="space-y-4">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse flex items-center justify-between">
                              <div className="space-y-1 flex-1">
                                <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                                <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
                              </div>
                              <div className="w-16 h-6 bg-gray-200 rounded"></div>
                            </div>
                          ))}
                        </div>
                      ) : recentActivity.blogs?.length > 0 ? (
                        <div className="space-y-4">
                          {recentActivity.blogs.map((blog) => (
                            <div key={blog._id} className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{blog.title}</p>
                                <p className="text-sm text-gray-500">
                                  by {blog.author?.firstName} {blog.author?.lastName}
                                </p>
                              </div>
                              <Badge variant={blog.status === "published" ? "default" : "secondary"}>
                                {blog.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No recent blogs</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
              <Button onClick={refetchUsers} variant="outline" disabled={usersLoading}>
                {usersLoading ? "Loading..." : "Refresh Users"}
              </Button>
            </div>

            {usersError ? (
              <ErrorDisplay error={usersError} onRetry={refetchUsers} title="Failed to Load Users" />
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Joined
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {usersLoading ? (
                          [...Array(5)].map((_, i) => (
                            <tr key={i}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="animate-pulse flex items-center">
                                  <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                                  <div className="space-y-1">
                                    <div className="w-24 h-4 bg-gray-200 rounded"></div>
                                    <div className="w-16 h-3 bg-gray-200 rounded"></div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex space-x-2">
                                  <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
                                  <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : users.length > 0 ? (
                          users.map((userItem) => (
                            <tr key={userItem._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {userItem.firstName} {userItem.lastName}
                                  </p>
                                  <p className="text-sm text-gray-500">@{userItem.username}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userItem.email}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <select
                                  value={userItem.role}
                                  onChange={(e) => handleUserRoleUpdate(userItem._id, e.target.value)}
                                  className="text-sm border border-gray-300 rounded px-2 py-1"
                                  disabled={userItem._id === user?._id} // Prevent self role change
                                >
                                  <option value="user">User</option>
                                  <option value="moderator">Moderator</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant={userItem.isActive ? "default" : "destructive"}>
                                  {userItem.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(userItem.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUserStatusUpdate(userItem._id, !userItem.isActive)}
                                  disabled={userItem._id === user?._id}
                                >
                                  <Ban className="h-4 w-4 mr-1" />
                                  {userItem.isActive ? "Deactivate" : "Activate"}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteUser(userItem._id)}
                                  disabled={userItem._id === user?._id}
                                >
                                  <Trash2 className="h-4 w-4 mr-1 text-red-500" />
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                              No users found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Blogs Tab */}
        {activeTab === "blogs" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Blogs Management</h2>
              <Button onClick={refetchBlogs} variant="outline" disabled={blogsLoading}>
                {blogsLoading ? "Loading..." : "Refresh Blogs"}
              </Button>
            </div>

            {blogsError ? (
              <ErrorDisplay error={blogsError} onRetry={refetchBlogs} title="Failed to Load Blogs" />
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Author
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {blogsLoading ? (
                          [...Array(5)].map((_, i) => (
                            <tr key={i}>
                              <td className="px-6 py-4">
                                <div className="w-48 h-4 bg-gray-200 rounded animate-pulse"></div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
                              </td>
                            </tr>
                          ))
                        ) : blogs.length > 0 ? (
                          blogs.map((blog) => (
                            <tr key={blog._id}>
                              <td className="px-6 py-4">
                                <p className="text-sm font-medium text-gray-900 line-clamp-2">{blog.title}</p>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {blog.author?.firstName} {blog.author?.lastName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant="outline">{blog.category}</Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge
                                  variant={
                                    blog.status === "published"
                                      ? "default"
                                      : blog.status === "draft"
                                        ? "secondary"
                                        : "destructive"
                                  }
                                >
                                  {blog.status}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(blog.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <select
                                  value={blog.status}
                                  onChange={(e) => handleBlogStatusUpdate(blog._id, e.target.value)}
                                  className="text-sm border border-gray-300 rounded px-2 py-1"
                                >
                                  <option value="draft">Draft</option>
                                  <option value="published">Published</option>
                                  <option value="archived">Archived</option>
                                </select>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                              No blogs found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {/* Removed settings tab content */}
      </div>

      {/* Detailed Stats Modal */}
      {detailedStatsModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{detailedStatsModal.title}</h3>
              <Button variant="outline" onClick={closeModal}>
                <X className="h-4 w-4" />
                Close
              </Button>
            </div>

            {detailedStatsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2">Loading detailed stats...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {detailedStatsData?.data?.data?.items?.length > 0 ? (
                  detailedStatsData.data.data.items.map((item, index) => (
                    <div key={item._id || index} className="border rounded p-4">
                      {detailedStatsModal.type === "users" && (
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              {item.firstName} {item.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              @{item.username} • {item.email}
                            </p>
                            <p className="text-xs text-gray-400">Joined: {formatDate(item.createdAt)}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={item.role === "admin" ? "default" : "secondary"}>{item.role}</Badge>
                            <Badge variant={item.isActive ? "default" : "destructive"}>
                              {item.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      )}

                      {(detailedStatsModal.type === "blogs" || detailedStatsModal.type === "published-blogs") && (
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-gray-500">
                            by {item.author?.firstName} {item.author?.lastName}
                          </p>
                          <p className="text-xs text-gray-400">Created: {formatDate(item.createdAt)}</p>
                          <div className="mt-2 flex items-center space-x-2">
                            <Badge variant={item.status === "published" ? "default" : "secondary"}>{item.status}</Badge>
                            <Badge variant="outline">{item.category}</Badge>
                          </div>
                        </div>
                      )}

                      {detailedStatsModal.type === "comments" && (
                        <div>
                          <p className="font-medium">{item.content}</p>
                          <p className="text-sm text-gray-500">
                            by {item.author?.firstName} {item.author?.lastName}
                          </p>
                          <p className="text-xs text-gray-400">on "{item.blog?.title}"</p>
                          <p className="text-xs text-gray-400">Posted: {formatDate(item.createdAt)}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No data available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
