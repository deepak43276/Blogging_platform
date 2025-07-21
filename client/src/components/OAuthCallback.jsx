"use client"

import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import toast from "react-hot-toast"

const OAuthCallback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { loadUser } = useAuth()

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const token = searchParams.get("token")
        const error = searchParams.get("error")

        if (error) {
          toast.error("Authentication failed. Please try again.")
          navigate("/login", { replace: true })
          return
        }

        if (token) {
          localStorage.setItem("token", token)

          // Load user data
          const user = await loadUser()

          toast.success("Login successful!")

          // Redirect based on user role
          if (user.role === "admin") {
            navigate("/admin", { replace: true })
          } else {
            navigate("/dashboard", { replace: true })
          }
        } else {
          toast.error("Authentication failed. No token received.")
          navigate("/login", { replace: true })
        }
      } catch (error) {
        toast.error("Authentication failed. Please try again.")
        navigate("/login", { replace: true })
      }
    }

    handleOAuthCallback()
  }, [searchParams, navigate, loadUser])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing Authentication...</h2>
        <p className="text-gray-600">Please wait while we log you in.</p>
      </div>
    </div>
  )
}

export default OAuthCallback
