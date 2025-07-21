import mongoose from "mongoose"

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    excerpt: {
      type: String,
      maxlength: [300, "Excerpt cannot exceed 300 characters"],
    },
    featuredImage: {
      type: String,
      default: "",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Technology",
        "Lifestyle",
        "Travel",
        "Food",
        "Health",
        "Business",
        "Education",
        "Entertainment",
        "Sports",
        "Other",
      ],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    readTime: {
      type: Number, // in minutes
      default: 1,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    meta: {
      title: String,
      description: String,
      keywords: [String],
    },
  },
  {
    timestamps: true,
  },
)

// Helper function to generate unique slug
const generateUniqueSlug = async (title, blogId = null) => {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/\s+/g, "-")
    .trim("-")

  let slug = baseSlug
  let counter = 1

  while (true) {
    const query = { slug }
    if (blogId) {
      query._id = { $ne: blogId }
    }

    const existingBlog = await mongoose.model("Blog").findOne(query)
    if (!existingBlog) {
      return slug
    }

    slug = `${baseSlug}-${counter}`
    counter++
  }
}

// Create slug from title
blogSchema.pre("save", async function (next) {
  try {
    // Generate slug if title is modified or new document
    if (this.isModified("title") || this.isNew) {
      this.slug = await generateUniqueSlug(this.title, this._id)
    }

    // Calculate read time (average 200 words per minute)
    if (this.isModified("content")) {
      const wordCount = this.content.split(/\s+/).length
      this.readTime = Math.ceil(wordCount / 200) || 1
    }

    // Set published date and status
    if (this.isModified("status") && this.status === "published" && !this.publishedAt) {
      this.publishedAt = new Date()
      this.isPublished = true
    } else if (this.status !== "published") {
      this.isPublished = false
    }

    next()
  } catch (error) {
    next(error)
  }
})

// Indexes for better performance
blogSchema.index({ author: 1, createdAt: -1 })
blogSchema.index({ category: 1, status: 1 })
blogSchema.index({ tags: 1 })
// blogSchema.index({ slug: 1 }, { unique: true })
blogSchema.index({ title: "text", content: "text" })

export default mongoose.model("Blog", blogSchema)
