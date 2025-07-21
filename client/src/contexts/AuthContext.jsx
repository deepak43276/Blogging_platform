"use client"

import { createContext, useContext, useReducer, useEffect } from "react"
import { authAPI } from "../services/api"

const AuthContext = createContext()

const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  loading: true,
  isAuthenticated: false,
}

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
      localStorage.setItem("token", action.payload.token)
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      }
    case "USER_LOADED":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      }
    case "LOGOUT":
    case "AUTH_ERROR":
      localStorage.removeItem("token")
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      }
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Load user on app start
  useEffect(() => {
    if (state.token) {
      loadUser()
    } else {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [])

  const loadUser = async () => {
    try {
      const response = await authAPI.getMe()
      dispatch({ type: "USER_LOADED", payload: response.data.user })
      return response.data.user
    } catch (error) {
      dispatch({ type: "AUTH_ERROR" })
      throw error
    }
  }

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      dispatch({ type: "LOGIN_SUCCESS", payload: response.data })
      return response.data
    } catch (error) {
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      dispatch({ type: "REGISTER_SUCCESS", payload: response.data })
      return response.data
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    dispatch({ type: "LOGOUT" })
  }

  const updateUser = (userData) => {
    dispatch({ type: "USER_LOADED", payload: userData })
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateUser,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
