"use client"

import { useState, useRef } from "react"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Card, CardContent } from "./ui/card"
import { categories } from "../lib/utils"
import { X, Upload, Eye } from "lucide-react"

const BlogEditor = ({ blogData, setBlogData, isSubmitting }) => {
  const [tagInput, setTagInput] = useState("")
  const [previewMode, setPreviewMode] = useState(false)
  const [imagePreview, setImagePreview] = useState(blogData?.featuredImage || null)
  const fileInputRef = useRef(null)

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["link", "image", "video"],
      [{ align: [] }],
      ["blockquote", "code-block"],
      ["clean"],
    ],
  }

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
    "align",
    "blockquote",
    "code-block",
  ]

  const handleInputChange = (field, value) => {
    setBlogData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setBlogData((prev) => ({
        ...prev,
        featuredImage: file,
      }))

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setBlogData((prev) => ({
      ...prev,
      featuredImage: null,
    }))
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !blogData.tags.includes(tagInput.trim())) {
      setBlogData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove) => {
    setBlogData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div className="space-y-6">
      {/* Preview Toggle */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setPreviewMode(!previewMode)} disabled={isSubmitting}>
          <Eye className="h-4 w-4 mr-2" />
          {previewMode ? "Edit" : "Preview"}
        </Button>
      </div>

      {previewMode ? (
        <Card>
          <CardContent className="p-8">
            {imagePreview && (
              <img
                src={imagePreview || "/placeholder.svg"}
                alt="Featured"
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}
            <div className="flex items-center space-x-2 mb-4">
              {blogData.category && <Badge>{blogData.category}</Badge>}
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">5 min read</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{blogData.title || "Untitled"}</h1>
            {blogData.excerpt && <p className="text-lg text-gray-600 mb-6">{blogData.excerpt}</p>}
            <div
              className="blog-content prose max-w-none"
              dangerouslySetInnerHTML={{ __html: blogData.content || "<p>Start writing your content...</p>" }}
            />
            {blogData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t">
                {blogData.tags.map((tag, index) => (
                  <span key={index} className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Featured Image */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Featured Image (Optional)</h3>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Featured"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={removeImage}
                    className="absolute top-2 right-2"
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => !isSubmitting && fileInputRef.current?.click()}
                  className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Click to upload featured image</p>
                  <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isSubmitting}
              />
            </CardContent>
          </Card>

          {/* Title */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Title <span className="text-red-500">*</span>
              </h3>
              <Input
                placeholder="Enter your blog title..."
                value={blogData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="text-lg"
                disabled={isSubmitting}
                required
              />
            </CardContent>
          </Card>

          {/* Excerpt */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Excerpt (Optional)</h3>
              <textarea
                placeholder="Write a brief description of your blog post..."
                value={blogData.excerpt}
                onChange={(e) => handleInputChange("excerpt", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md resize-none h-20 focus:ring-2 focus:ring-primary focus:border-transparent"
                maxLength={300}
                disabled={isSubmitting}
              />
              <p className="text-sm text-gray-500 mt-2">{blogData.excerpt.length}/300 characters</p>
            </CardContent>
          </Card>

          {/* Category & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Category <span className="text-red-500">*</span>
                </h3>
                <select
                  value={blogData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={isSubmitting}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Tags (Optional)</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {blogData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500"
                        disabled={isSubmitting}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isSubmitting}
                  />
                  <Button onClick={addTag} variant="outline" disabled={isSubmitting}>
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Editor */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Content <span className="text-red-500">*</span>
              </h3>
              <ReactQuill
                theme="snow"
                value={blogData.content}
                onChange={(content) => handleInputChange("content", content)}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Start writing your blog post..."
                style={{ height: "400px", marginBottom: "50px" }}
                readOnly={isSubmitting}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default BlogEditor
