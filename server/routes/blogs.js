import express from "express"
import multer from "multer"
import { authenticate, optionalAuth } from "../middleware/auth.js"
import {
  getBlogs,
  getBlogBySlug,
  getBlogById,
  getMyBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLike,
} from "../controllers/blogController.js"

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed!"), false)
    }
  },
})

// Public routes
router.get("/", optionalAuth, getBlogs) // GET /api/blogs

// Protected routes (must come before slug route)
router.get("/my-blogs", authenticate, getMyBlogs) // GET /api/blogs/my-blogs
router.get("/edit/:id", authenticate, getBlogById) // GET /api/blogs/edit/:id
router.post("/", authenticate, upload.single("featuredImage"), createBlog) // POST /api/blogs
router.put("/:id", authenticate, upload.single("featuredImage"), updateBlog) // PUT /api/blogs/:id
router.delete("/:id", authenticate, deleteBlog) // DELETE /api/blogs/:id
router.post("/:id/like", authenticate, toggleLike) // POST /api/blogs/:id/like

// Slug route must be last to avoid conflicts
router.get("/:slug", optionalAuth, getBlogBySlug) // GET /api/blogs/:slug

export default router
