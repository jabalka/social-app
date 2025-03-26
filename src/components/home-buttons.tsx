"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import CreateAccountDialog from "./create-account-dialog"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button" // Use shadcn Button for consistent styling

const HomeButtons: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const router = useRouter()
  const { googleSignIn } = useAuth()

  const handleGoogleSignin = async () => {
    try {
      await googleSignIn()
      router.push("/dashboard")
    } catch (error) {
      console.error("Google sign in failed:", error)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 text-white font-bold">
        <h1 className="text-3xl mb-2">Happening now</h1>
        <h3 className="text-xl">Join today.</h3>
      </div>

      <section className="flex flex-col gap-3 w-full">
        <Button
          variant="outline"
          className="w-4/5 mx-auto justify-center rounded-xl bg-white text-black hover:bg-gray-200"
          onClick={handleGoogleSignin}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span>Sign up with Google</span>
        </Button>

        <Button
          variant="outline"
          className="w-4/5 mx-auto justify-center rounded-xl bg-white text-black hover:bg-gray-200"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z"
              fill="currentColor"
            />
          </svg>
          <span>Sign up with Apple</span>
        </Button>

        <Button
          variant="outline"
          className="w-4/5 mx-auto justify-center rounded-xl bg-white text-black hover:bg-gray-200"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              fill="#1877F2"
            />
          </svg>
          <span>Sign up with Facebook</span>
        </Button>

        <div className="relative flex items-center text-center my-5">
          <div className="absolute w-full border-t border-gray-600"></div>
          <div className="relative px-2 text-gray-400 bg-black z-10 mx-auto">or</div>
        </div>

        <div className="w-4/5 mx-auto">
          <Button
            className="w-full justify-center font-bold rounded-full bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            Create Account
          </Button>
        </div>

        <span className="text-gray-400 text-sm mt-2 text-center">
          By signing up, you agree to the{" "}
          <a href="/toLink" className="text-blue-400 no-underline hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/toLink" className="text-blue-400 no-underline hover:underline">
            Privacy Policy
          </a>
          , including{" "}
          <a href="/goLink" className="text-blue-400 no-underline hover:underline">
            Cookie Use.
          </a>
        </span>
      </section>

      <CreateAccountDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  )
}

export default HomeButtons

