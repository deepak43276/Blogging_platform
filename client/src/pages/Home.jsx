"use client"

import { useState } from "react"
import { useQuery } from "react-query"
import { useSearchParams, useNavigate } from "react-router-dom"
import { blogAPI } from "../services/api"
import BlogCard from "../components/BlogCard"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { categories } from "../lib/utils"
import { Search, Filter, TrendingUp, Heart, BookOpen, Users, Star } from "lucide-react"
import { motion } from "framer-motion"

const Home = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "all",
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortOrder: searchParams.get("sortOrder") || "desc",
  })
  const [page, setPage] = useState(1)

  const { data, isLoading, error, refetch } = useQuery(
    ["blogs", filters, page],
    async () => {
      const response = await blogAPI.getBlogs({ ...filters, page, limit: 9 })
      return response.data // Return response.data directly
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds
    },
  )

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    setPage(1)

    // Update URL params
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== "all") params.set(k, v)
    })
    setSearchParams(params)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    refetch()
  }

  const handleLikeUpdate = (blogId, likeData) => {
    // Update the blog in the current data
    if (data?.data?.blogs) {
      const updatedBlogs = data.data.blogs.map((blog) => (blog._id === blogId ? { ...blog, ...likeData } : blog))
      // This would typically be handled by React Query's cache update
    }
  }

  const stats = [
    { label: "Active Writers", value: "10K+", icon: Users },
    { label: "Published Posts", value: "50K+", icon: BookOpen },
    { label: "Monthly Readers", value: "1M+", icon: Heart },
    { label: "Success Stories", value: "500+", icon: Star },
  ]

  const featuredCategories = [
    { name: "Technology", count: "2.5K", color: "bg-blue-500" },
    { name: "Lifestyle", count: "1.8K", color: "bg-green-500" },
    { name: "Business", count: "1.2K", color: "bg-purple-500" },
    { name: "Travel", count: "900", color: "bg-orange-500" },
  ]

  // Debug logging
  // console.log("Home page render - data:", data)
  // console.log("Home page render - blogs:", data?.data?.blogs)

  return (
    <div className="min-h-screen bg-gray-50">
    

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Unleash Your Post <span className="text-primary">Build Your Audience.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              Turn your ideas into impact. Write, publish, and connect with a vibrant community of creators and readers. Whether you’re a seasoned writer or just starting out, PostCraft gives you the tools to grow your influence and share your story with the world.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button size="lg" className="px-8 py-3 text-lg" onClick={() => navigate("/register")}> 
                Start Your Journey
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-3 text-lg"
                onClick={() => navigate("/?category=all")}
              >
                Browse Top Stories
              </Button>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <Icon className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                </div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10 pr-4 py-2"
                />
              </div>
            </form>

            {/* Category Filter */}
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="createdAt">Latest</option>
                <option value="views">Most Viewed</option>
                <option value="likes">Most Liked</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore by Category</h2>
            <p className="text-gray-600">Discover content that matches your interests</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => handleFilterChange("category", category.name)}
                className="bg-white rounded-lg p-6 text-center cursor-pointer hover:shadow-lg transition-all duration-300 border"
              >
                <div className={`w-12 h-12 ${category.color} rounded-lg mx-auto mb-3 flex items-center justify-center`}>
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count} articles</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {filters.category !== "all" ? `${filters.category} Articles` : "Latest Articles"}
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <TrendingUp className="h-4 w-4" />
              <span>{data?.data?.pagination?.totalBlogs || 0} articles found</span>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg border animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                      <div className="h-4 bg-gray-200 rounded flex-1"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">Failed to load articles: {error.message}</p>
              <Button onClick={() => refetch()}>Try Again</Button>
            </div>
          ) : data?.data?.blogs?.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.data.blogs.map((blog, index) => (
                  <motion.div
                    key={blog._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <BlogCard blog={blog} onLikeUpdate={handleLikeUpdate} />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {data.data.pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-12">
                  <Button variant="outline" onClick={() => setPage(page - 1)} disabled={!data.data.pagination.hasPrev}>
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {data.data.pagination.currentPage} of {data.data.pagination.totalPages}
                  </span>
                  <Button variant="outline" onClick={() => setPage(page + 1)} disabled={!data.data.pagination.hasNext}>
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600 mb-6">
                {filters.search || filters.category !== "all"
                  ? "Try adjusting your search or filters"
                  : "Be the first to share your story!"}
              </p>
              <Button onClick={() => navigate("/create-blog")}>Start Writing</Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
