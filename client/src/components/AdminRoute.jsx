"use client"

import { useAuth } from "../contexts/AuthContext"
import { Navigate } from "react-router-dom"

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/" replace />
  }

  return children
}

export default AdminRoute
