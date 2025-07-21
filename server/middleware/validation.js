import { body, validationResult } from "express-validator"

// Blog validation rules
export const blogValidation = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Title is required and must be between 1-100 characters"),
  body("content").trim().isLength({ min: 1 }).withMessage("Content is required"),
  body("category").trim().isLength({ min: 1 }).withMessage("Category is required"),
  body("status").optional().isIn(["draft", "published", "archived"]).withMessage("Invalid status"),
]

// User registration validation
export const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3-20 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("firstName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("First name is required and must be less than 50 characters"),
  body("lastName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name is required and must be less than 50 characters"),
]

// User login validation
export const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").isLength({ min: 1 }).withMessage("Password is required"),
]

// Comment validation
export const commentValidation = [
  body("content")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Comment content is required and must be less than 1000 characters"),
  body("blog").isMongoId().withMessage("Valid blog ID is required"),
]

// Profile update validation
export const profileValidation = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("First name must be less than 50 characters"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name must be less than 50 characters"),
  body("bio").optional().trim().isLength({ max: 500 }).withMessage("Bio must be less than 500 characters"),
]

// Validation result handler
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    })
  }
  next()
}
