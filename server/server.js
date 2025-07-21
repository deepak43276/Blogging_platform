import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import session from "express-session"
import MongoStore from "connect-mongo"
import passport from "passport"
import path from "path"
import { fileURLToPath } from "url"

// Import routes
import authRoutes from "./routes/auth.js"
import blogRoutes from "./routes/blogs.js"
import commentRoutes from "./routes/comments.js"
import userRoutes from "./routes/users.js"
import adminRoutes from "./routes/admin.js"

// Import middleware
import { errorHandler } from "./middleware/errorHandler.js"
import connectDB from "./config/database.js"

// Load environment variables
dotenv.config()

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Connect to database
connectDB()

const app = express()

// Trust proxy for production
app.set("trust proxy", 1)

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Session configuration (required for Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      touchAfter: 24 * 3600, // lazy session update
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
)

// Initialize Passport
app.use(passport.initialize())
app.use(passport.session())

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "BlogSpace API is running!",
    timestamp: new Date().toISOString(),
  })
})

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/blogs", blogRoutes)
app.use("/api/comments", commentRoutes)
app.use("/api/users", userRoutes)
app.use("/api/admin", adminRoutes)

// Handle 404 for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  })
})

// Error handling middleware (must be last)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  // Remove all console.log and console.error statements
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  // Remove all console.log and console.error statements
  // Close server & exit process
  process.exit(1)
})
