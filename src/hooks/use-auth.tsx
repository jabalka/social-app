"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type PropsWithChildren } from "react"

// import GoogleProvider from "next-auth/providers/google";

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

// export interface GoogleProfile extends Record<string, any> {
//   aud: string
//   azp: string
//   email: string
//   email_verified: boolean
//   exp: number
//   family_name: string
//   given_name: string
//   hd: string
//   iat: number
//   iss: string
//   jti: string
//   name: string
//   nbf: number
//   picture: string
//   sub: string
// }

// Define auth context type
interface AuthContextType {
  user: UserModel | null
//   loading: boolean
//   error: string | null
//   signUp: (userData: UserModel) => Promise<UserModel>
//   login: (username: string, password: string) => Promise<UserModel>
//   signOut: () => Promise<void>
//   getUser: (field: string, value: string) => Promise<any>
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)



// Auth provider component
export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<UserModel | null>(null)
  const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

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
//   const signUp = async (userData: UserModel): Promise<UserModel> => {
//     try {
//       setLoading(true)
//       setError(null)

//       // Make API call to signup endpoint
//       const response = await fetch("/api/auth/signup", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(userData),
//       })

//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.error || "Sign up failed")
//       }

//       const newUser = await response.json()

//       // Store user in local storage
//       localStorage.setItem("user", JSON.stringify(newUser))
//       setUser(newUser)

//       return newUser
//     } catch{
      
//       throw error
//     } finally {
//       setLoading(false)
//     }
//   }

  // Login function
//   const login = async (username: string, password: string): Promise<UserModel> => {
//     try {
//       setLoading(true)
//       setError(null)

//       // Make API call to login endpoint
//       const response = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ username, password }),
//       })

//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.error || "Login failed")
//       }

//       const loggedInUser = await response.json()

//       // Store user in local storage
//       localStorage.setItem("user", JSON.stringify(loggedInUser))
//       setUser(loggedInUser)

//       return loggedInUser
//     } catch{
//       setError("Login failed")
//       throw error
//     } finally {
//       setLoading(false)
//     }
//   }

  // export default function Google<P extends GoogleProfile>(
  //   options: OAuthUserConfig<P>
  // ): OAuthConfig<P> {
  //   return {
  //     id: "google",
  //     name: "Google",
  //     type: "oauth",
  //     wellKnown: "https://accounts.google.com/.well-known/openid-configuration",
  //     authorization: { params: { scope: "openid email profile" } },
  //     idToken: true,
  //     checks: ["pkce", "state"],
  //     profile(profile) {
  //       return {
  //         id: profile.sub,
  //         name: profile.name,
  //         email: profile.email,
  //         image: profile.picture,
  //       }
  //     },
  //     style: { logo: "/google.svg", bg: "#fff", text: "#000" },
  //     options,
  //   }
  // }

  // Sign out function
//   const signOut = async (): Promise<void> => {
//     try {
//       setLoading(true)

//       // Remove user from local storage
//       localStorage.removeItem("user")
//       setUser(null)
//     } catch {
//       setError("Sign out failed")
//       throw error
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Get user by field
//   const getUser = async (field: string, value: string): Promise<any> => {
//     try {
//       // Make API call to get user endpoint
//       const response = await fetch(`/api/auth/user?field=${field}&value=${value}`)

//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.error || "Failed to retrieve user")
//       }

//       return await response.json()
//     } catch  {
//       console.error("Error retrieving user:", error)
//       return null
//     }
//   }

  // Auth context value
  const value = {
    user,
    loading,
    // error,
    // signUp,
    // login,
    // // googleSignIn,
    // signOut,
    // getUser,
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

