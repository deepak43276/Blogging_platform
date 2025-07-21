import express from "express"
import {
  getDashboardStats,
  getAllUsers,
  getAllBlogs,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  updateBlogStatus,
  getDetailedStats,
} from "../controllers/adminController.js"
import { authenticate, authorize } from "../middleware/auth.js"

const router = express.Router()

// Test route to verify admin access
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Admin routes are working!",
    timestamp: new Date().toISOString(),
  })
})

// Debug middleware
router.use((req, res, next) => {
  next()
})

// Apply authentication and authorization
router.use(authenticate)
router.use(authorize("admin"))

// Add another debug after auth
router.use((req, res, next) => {
  next()
})

// Dashboard stats
router.get("/stats", getDashboardStats)
router.get("/stats/:type", getDetailedStats)

// User management
router.get("/users", getAllUsers)
router.put("/users/:id/status", updateUserStatus)
router.put("/users/:id/role", updateUserRole)
router.delete("/users/:id", deleteUser)

// Blog management
router.get("/blogs", getAllBlogs)
router.put("/blogs/:id/status", updateBlogStatus)

export default router
