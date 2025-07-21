import express from "express"
import Blog from "../models/Blog.js"

const router = express.Router()

// Test route to check all blogs
router.get("/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find({}).populate("author", "username firstName lastName").lean()

    res.json({
      success: true,
      count: blogs.length,
      blogs: blogs.map((blog) => ({
        id: blog._id,
        title: blog.title,
        slug: blog.slug,
        status: blog.status,
        author: blog.author.username,
        createdAt: blog.createdAt,
      })),
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
