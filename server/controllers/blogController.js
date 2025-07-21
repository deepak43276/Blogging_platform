import Blog from "../models/Blog.js"
import Comment from "../models/Comment.js"
import { uploadImage } from "../utils/cloudinary.js"

// @desc    Get all published blogs with pagination and filters
// @route   GET /api/blogs
// @access  Public
export const getBlogs = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const { category, tags, search, author, sortBy = "createdAt", sortOrder = "desc" } = req.query

    // Build query - show published blogs for public, all blogs for author
    const query = { status: "published" }

    if (category && category !== "all") {
      query.category = category
    }

    if (tags) {
      query.tags = { $in: tags.split(",") }
    }

    if (author) {
      query.author = author
    }

    if (search) {
      query.$text = { $search: search }
    }

    // Sort options
    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1

    const blogs = await Blog.find(query)
      .populate("author", "username firstName lastName avatar")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Blog.countDocuments(query)

    // Add like status for authenticated users
    if (req.user) {
      blogs.forEach((blog) => {
        blog.isLiked = blog.likes.some((like) => like.user.toString() === req.user._id.toString())
        blog.likesCount = blog.likes.length
      })
    } else {
      blogs.forEach((blog) => {
        blog.isLiked = false
        blog.likesCount = blog.likes.length
      })
    }

    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalBlogs: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching blogs",
      error: error.message,
    })
  }
}

// @desc    Get current user's blogs
// @route   GET /api/blogs/my-blogs
// @access  Private
export const getMyBlogs = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 50
    const skip = (page - 1) * limit

    const { status = "all" } = req.query

    const query = { author: req.user._id }
    if (status !== "all") {
      query.status = status
    }

    const blogs = await Blog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()

    const total = await Blog.countDocuments(query)

    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalBlogs: total,
        },
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching your blogs",
      error: error.message,
    })
  }
}

// @desc    Get single blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
export const getBlogBySlug = async (req, res) => {
  try {
    const slug = req.params.slug

    // Build query based on authentication
    let query = { slug: slug }

    // If user is authenticated, they can see their own drafts
    if (req.user) {
      query = {
        slug: slug,
        $or: [{ status: "published" }, { author: req.user._id }],
      }
    } else {
      // Public users only see published blogs
      query = {
        slug: slug,
        status: "published",
      }
    }

    const blog = await Blog.findOne(query)
      .populate("author", "username firstName lastName avatar bio socialLinks")
      .lean()

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      })
    }

    // Increment views only for published blogs
    if (blog.status === "published") {
      await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } })
    }

    // Add like status for authenticated users
    if (req.user) {
      blog.isLiked = blog.likes.some((like) => like.user.toString() === req.user._id.toString())
    } else {
      blog.isLiked = false
    }

    blog.likesCount = blog.likes.length

    // Get comments only for published blogs
    let comments = []
    if (blog.status === "published") {
      comments = await Comment.find({
        blog: blog._id,
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
    }

    res.json({
      success: true,
      data: {
        blog,
        comments,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching blog",
      error: error.message,
    })
  }
}

// @desc    Get single blog by ID (for editing)
// @route   GET /api/blogs/edit/:id
// @access  Private
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("author", "username firstName lastName avatar")

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      })
    }

    // Check ownership
    if (blog.author._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this blog",
      })
    }

    res.json({
      success: true,
      data: blog,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching blog",
      error: error.message,
    })
  }
}

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private
export const createBlog = async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, status = "draft" } = req.body

    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, content, and category are required",
      })
    }

    let featuredImage = ""
    if (req.file) {
      try {
        featuredImage = await uploadImage(req.file.path, "blog-images")
      } catch (uploadError) {
        // Continue without image if upload fails
      }
    }

    // Parse tags if it's a string
    let parsedTags = []
    if (tags) {
      try {
        parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags
      } catch (e) {
        parsedTags = Array.isArray(tags) ? tags : [tags]
      }
    }

    const blog = new Blog({
      title,
      content,
      excerpt: excerpt || "",
      featuredImage,
      author: req.user._id,
      category,
      tags: parsedTags,
      status,
    })

    await blog.save()
    await blog.populate("author", "username firstName lastName avatar")

    res.status(201).json({
      success: true,
      message: `Blog ${status === "published" ? "published" : "saved as draft"} successfully`,
      data: blog,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating blog",
      error: error.message,
    })
  }
}

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private
export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      })
    }

    // Check ownership
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this blog",
      })
    }

    const { title, content, excerpt, category, tags, status } = req.body

    let featuredImage = blog.featuredImage
    if (req.file) {
      try {
        featuredImage = await uploadImage(req.file.path, "blog-images")
      } catch (uploadError) {
        // Keep existing image if upload fails
      }
    }

    // Parse tags if it's a string
    let parsedTags = blog.tags
    if (tags) {
      try {
        parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags
      } catch (e) {
        parsedTags = Array.isArray(tags) ? tags : [tags]
      }
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        excerpt: excerpt || "",
        featuredImage,
        category,
        tags: parsedTags,
        status,
      },
      { new: true, runValidators: true },
    ).populate("author", "username firstName lastName avatar")

    res.json({
      success: true,
      message: `Blog ${status === "published" ? "published" : "updated"} successfully`,
      data: updatedBlog,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating blog",
      error: error.message,
    })
  }
}

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      })
    }

    // Check ownership
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this blog",
      })
    }

    await Blog.findByIdAndDelete(req.params.id)
    await Comment.deleteMany({ blog: req.params.id })

    res.json({
      success: true,
      message: "Blog deleted successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting blog",
      error: error.message,
    })
  }
}

// @desc    Like/Unlike blog
// @route   POST /api/blogs/:id/like
// @access  Private
export const toggleLike = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      })
    }

    const existingLike = blog.likes.find((like) => like.user.toString() === req.user._id.toString())

    if (existingLike) {
      // Unlike
      blog.likes = blog.likes.filter((like) => like.user.toString() !== req.user._id.toString())
    } else {
      // Like
      blog.likes.push({ user: req.user._id })
    }

    await blog.save()

    res.json({
      success: true,
      message: existingLike ? "Blog unliked" : "Blog liked",
      data: {
        isLiked: !existingLike,
        likesCount: blog.likes.length,
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
