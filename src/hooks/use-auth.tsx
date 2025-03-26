"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode, type PropsWithChildren } from "react"

// Define user model type
export interface UserModel {
  id?: string
  username: string
  email: string
  phone?: number
  name: string
  password?: string
  photoUrl?: string
  googleId?: string
}

// Define auth context type
interface AuthContextType {
  user: UserModel | null
  loading: boolean
  error: string | null
  signUp: (userData: UserModel) => Promise<UserModel>
  login: (username: string, password: string) => Promise<UserModel>
  googleSignIn: () => Promise<UserModel>
  signOut: () => Promise<void>
  getUser: (field: string, value: string) => Promise<any>
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider props
interface AuthProviderProps {
  children: ReactNode
}

// Auth provider component
export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<UserModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if user is already logged in
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // Sign up function
  const signUp = async (userData: UserModel): Promise<UserModel> => {
    try {
      setLoading(true)
      setError(null)

      // Make API call to signup endpoint
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Sign up failed")
      }

      const newUser = await response.json()

      // Store user in local storage
      localStorage.setItem("user", JSON.stringify(newUser))
      setUser(newUser)

      return newUser
    } catch (error: any) {
      setError(error.message || "Sign up failed")
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Login function
  const login = async (username: string, password: string): Promise<UserModel> => {
    try {
      setLoading(true)
      setError(null)

      // Make API call to login endpoint
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Login failed")
      }

      const loggedInUser = await response.json()

      // Store user in local storage
      localStorage.setItem("user", JSON.stringify(loggedInUser))
      setUser(loggedInUser)

      return loggedInUser
    } catch (error: any) {
      setError(error.message || "Login failed")
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Google sign in function
  const googleSignIn = async (): Promise<UserModel> => {
    try {
      setLoading(true)
      setError(null)

      // In a real app, you would use a library like next-auth for Google auth
      // For this example, we'll simulate a successful Google login
      const googleUser = {
        username: "google_user@example.com",
        email: "google_user@example.com",
        name: "Google User",
        id: `google_user_${Date.now()}`, // Simulate a unique ID
        photoUrl: "https://lh3.googleusercontent.com/a/default-user",
        googleId: `google_${Date.now()}`,
      }

      // Store user in local storage
      localStorage.setItem("user", JSON.stringify(googleUser))
      setUser(googleUser)

      return googleUser
    } catch (error: any) {
      setError(error.message || "Google sign in failed")
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Sign out function
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true)

      // Remove user from local storage
      localStorage.removeItem("user")
      setUser(null)
    } catch (error: any) {
      setError(error.message || "Sign out failed")
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Get user by field
  const getUser = async (field: string, value: string): Promise<any> => {
    try {
      // Make API call to get user endpoint
      const response = await fetch(`/api/auth/user?field=${field}&value=${value}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to retrieve user")
      }

      return await response.json()
    } catch (error: any) {
      console.error("Error retrieving user:", error)
      return null
    }
  }

  // Auth context value
  const value = {
    user,
    loading,
    error,
    signUp,
    login,
    googleSignIn,
    signOut,
    getUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export default useAuth

