"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useQuery } from "react-query"
import { useAuth } from "../contexts/AuthContext"
import { userAPI } from "../services/api"
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import BlogCard from "../components/BlogCard"
import { getInitials, formatDate } from "../lib/utils"
import { Calendar, LinkIcon, Twitter, Linkedin, Github, Mail, Users, FileText, Eye, Heart, Edit } from "lucide-react"
import toast from "react-hot-toast"

const Profile = () => {
  const { username } = useParams()
  const { user: currentUser, isAuthenticated } = useAuth()
  const [isFollowing, setIsFollowing] = useState(false)
  const [activeTab, setActiveTab] = useState("blogs")
  const [followersCount, setFollowersCount] = useState(0)

  const { data, isLoading, error, refetch } = useQuery(
    ["user-profile", username],
    async () => {
      console.log("Fetching user profile for:", username)
      const response = await userAPI.getUserProfile(username)
      console.log("Profile response:", response.data)
      return response.data // Return response.data directly
    },
    {
      enabled: !!username,
    },
  )

  const user = data?.data?.user
  const blogs = data?.data?.blogs || []
  const stats = data?.data?.stats || {}

  const isOwnProfile = currentUser && user && currentUser.username === user.username

  // Check if current user is following this user
  useEffect(() => {
    if (user && currentUser && !isOwnProfile) {
      const following = user.followers?.some((follower) => follower._id === currentUser._id)
      setIsFollowing(following)
    }
    if (user) {
      setFollowersCount(user.followers?.length || 0)
    }
  }, [user, currentUser, isOwnProfile])

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to follow users")
      return
    }

    try {
      // console.log("Following user:", user._id)
      const response = await userAPI.followUser(user._id)
      // console.log("Follow response:", response.data)

      setIsFollowing(response.data.data.isFollowing)
      setFollowersCount(response.data.data.followersCount)
      toast.success(response.data.message)

      // Refetch profile data to update followers list
      refetch()
    } catch (error) {
      console.error("Follow error:", error)
      toast.error(error.response?.data?.message || "Failed to follow user")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">User not found</h1>
          <p className="text-gray-600">The user profile you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const socialLinks = [
    { name: "Twitter", icon: Twitter, url: user.socialLinks?.twitter, color: "text-blue-400" },
    { name: "LinkedIn", icon: Linkedin, url: user.socialLinks?.linkedin, color: "text-blue-600" },
    { name: "GitHub", icon: Github, url: user.socialLinks?.github, color: "text-gray-800" },
    { name: "Website", icon: LinkIcon, url: user.socialLinks?.website, color: "text-green-500" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Debug Info in Development */}
      {/* {process.env.NODE_ENV === "development" && (
        <div className="bg-blue-50 border-b border-blue-200 p-2">
          <div className="max-w-4xl mx-auto text-xs text-blue-800">
            <strong>Profile Debug:</strong> User: {user.username} | Blogs: {blogs.length} | Following:{" "}
            {isFollowing.toString()} | Followers: {followersCount}
          </div>
        </div>
      )} */}

      {/* Profile Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="h-24 w-24 md:h-32 md:w-32">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
              <AvatarFallback className="text-2xl">{getInitials(user.firstName, user.lastName)}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-gray-600 text-lg">@{user.username}</p>
                </div>

                <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                  {isOwnProfile ? (
                    <Button variant="outline" asChild>
                      <a href="/edit-profile">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </a>
                    </Button>
                  ) : (
                    <>
                      <Button onClick={handleFollow} variant={isFollowing ? "outline" : "default"}>
                        <Users className="h-4 w-4 mr-2" />
                        {isFollowing ? "Unfollow" : "Follow"}
                      </Button>
                      <Button variant="outline">
                        <Mail className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {user.bio && <p className="text-gray-700 mt-4 text-lg leading-relaxed">{user.bio}</p>}

              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Joined {formatDate(user.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <button onClick={() => setActiveTab("followers")} className="hover:text-gray-700 transition-colors">
                    <strong className="text-gray-900">{followersCount}</strong> followers
                  </button>
                  <button onClick={() => setActiveTab("following")} className="hover:text-gray-700 transition-colors">
                    <strong className="text-gray-900">{user.following?.length || 0}</strong> following
                  </button>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-3 mt-4">
                {socialLinks.map((social) => {
                  if (!social.url) return null
                  const Icon = social.icon
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${social.color} hover:opacity-80 transition-opacity`}
                      title={social.name}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <FileText className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-2xl font-bold text-gray-900">{stats.totalBlogs || 0}</span>
              </div>
              <p className="text-sm text-gray-600">Articles</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Eye className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-2xl font-bold text-gray-900">{stats.totalViews || 0}</span>
              </div>
              <p className="text-sm text-gray-600">Views</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Heart className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-2xl font-bold text-gray-900">{stats.totalLikes || 0}</span>
              </div>
              <p className="text-sm text-gray-600">Likes</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-2xl font-bold text-gray-900">{followersCount}</span>
              </div>
              <p className="text-sm text-gray-600">Followers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("blogs")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "blogs"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Articles ({blogs.length})
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "about"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab("followers")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "followers"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Followers ({followersCount})
            </button>
            <button
              onClick={() => setActiveTab("following")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "following"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Following ({user.following?.length || 0})
            </button>
          </nav>
        </div>

        {/* Blogs Tab */}
        {activeTab === "blogs" && (
          <div>
            {blogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {blogs.map((blog) => (
                  <BlogCard key={blog._id} blog={blog} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles yet</h3>
                  <p className="text-gray-600">
                    {isOwnProfile
                      ? "Start writing your first article!"
                      : "This user hasn't published any articles yet."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* About Tab */}
        {activeTab === "about" && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About {user.firstName}</h3>
                {user.bio ? (
                  <p className="text-gray-700 leading-relaxed">{user.bio}</p>
                ) : (
                  <p className="text-gray-500 italic">No bio available.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Member since</p>
                    <p className="font-medium">{formatDate(user.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total articles</p>
                    <p className="font-medium">{stats.totalBlogs || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total views</p>
                    <p className="font-medium">{stats.totalViews || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total likes</p>
                    <p className="font-medium">{stats.totalLikes || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Followers Tab */}
        {activeTab === "followers" && (
          <div>
            {user.followers && user.followers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.followers.map((follower) => (
                  <Card key={follower._id}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={follower.avatar || "/placeholder.svg"} alt={follower.username} />
                          <AvatarFallback>{getInitials(follower.firstName, follower.lastName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {follower.firstName} {follower.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">@{follower.username}</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/profile/${follower.username}`}>View</a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No followers yet</h3>
                  <p className="text-gray-600">
                    {isOwnProfile ? "Start creating content to gain followers!" : "This user has no followers yet."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Following Tab */}
        {activeTab === "following" && (
          <div>
            {user.following && user.following.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.following.map((following) => (
                  <Card key={following._id}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={following.avatar || "/placeholder.svg"} alt={following.username} />
                          <AvatarFallback>{getInitials(following.firstName, following.lastName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {following.firstName} {following.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">@{following.username}</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/profile/${following.username}`}>View</a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Not following anyone</h3>
                  <p className="text-gray-600">
                    {isOwnProfile ? "Discover and follow other users!" : "This user isn't following anyone yet."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
