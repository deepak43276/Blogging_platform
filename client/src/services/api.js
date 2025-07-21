import axios from "axios"

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api"

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  login: (credentials) => {
    return api.post("/auth/login", credentials)
  },
  register: (userData) => {
    return api.post("/auth/register", userData)
  },
  getMe: () => {
    return api.get("/auth/me")
  },
  refreshToken: () => {
    return api.post("/auth/refresh")
  },
  updateProfile: (userData) => {
    return api.put("/auth/profile", userData)
  },
  uploadAvatar: (formData) =>
    api.post("/auth/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
}

// Blog API
export const blogAPI = {
  getAllBlogs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/blogs${queryString ? `?${queryString}` : ""}`)
  },
  getBlogs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/blogs${queryString ? `?${queryString}` : ""}`)
  },
  getBlogBySlug: (slug) => {
    return api.get(`/blogs/${slug}`)
  },
  getBlogById: (id) => {
    return api.get(`/blogs/edit/${id}`)
  },
  getMyBlogs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/blogs/my-blogs${queryString ? `?${queryString}` : ""}`)
  },
  getUserBlogs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/blogs/user/me${queryString ? `?${queryString}` : ""}`)
  },
  createBlog: (formData) => {
    return api.post("/blogs", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },
  updateBlog: (id, formData) => {
    return api.put(`/blogs/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },
  deleteBlog: (id) => {
    return api.delete(`/blogs/${id}`)
  },
  likeBlog: (id) => {
    return api.post(`/blogs/${id}/like`)
  },
  uploadImage: (formData) =>
    api.post("/blogs/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
}

// Comment API
export const commentAPI = {
  getComments: (blogId) => {
    return api.get(`/comments/${blogId}`)
  },
  createComment: (commentData) => {
    return api.post("/comments", commentData)
  },
  updateComment: (id, commentData) => {
    return api.put(`/comments/${id}`, commentData)
  },
  deleteComment: (id) => {
    return api.delete(`/comments/${id}`)
  },
  likeComment: (id) => {
    return api.post(`/comments/${id}/like`)
  },
}

// Admin API with enhanced logging
export const adminAPI = {
  getDashboardStats: async () => {
    try {
      const response = await api.get("/admin/stats")
      return response
    } catch (error) {
      throw error
    }
  },
  getDetailedStats: async (type, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await api.get(`/admin/stats/${type}${queryString ? `?${queryString}` : ""}`)
      return response
    } catch (error) {
      throw error
    }
  },
  getAllUsers: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await api.get(`/admin/users${queryString ? `?${queryString}` : ""}`)
      return response
    } catch (error) {
      throw error
    }
  },
  getAllBlogs: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await api.get(`/admin/blogs${queryString ? `?${queryString}` : ""}`)
      return response
    } catch (error) {
      throw error
    }
  },
  updateUserStatus: (userId, statusData) => api.put(`/admin/users/${userId}/status`, statusData),
  updateUserRole: (userId, roleData) => {
    return api.put(`/admin/users/${userId}/role`, roleData)
  },
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  updateBlogStatus: (blogId, statusData) => api.put(`/admin/blogs/${blogId}/status`, statusData),
}

// User API
export const userAPI = {
  getUserProfile: (username) => {
    return api.get(`/users/${username}`)
  },
  updateProfile: (formData) => {
    return api.put("/users/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },
  followUser: (userId) => {
    return api.post(`/users/${userId}/follow`)
  },
  getFollowers: (userId) => api.get(`/users/${userId}/followers`),
  getFollowing: (userId) => api.get(`/users/${userId}/following`),
}

export default api
