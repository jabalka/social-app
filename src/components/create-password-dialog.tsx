"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type FormValues = z.infer<typeof formSchema>

interface CreatePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userData: any
}

const CreatePasswordDialog: React.FC<CreatePasswordDialogProps> = ({ open, onOpenChange, userData }) => {
  const [errorMessage, setErrorMessage] = useState("")
  const { signUp } = useAuth()
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      setErrorMessage("")

      // Combine user data with password
      const completeUserData = {
        ...userData,
        password: data.password,
        username: userData.email || userData.phone,
      }

      // Sign up the user
      await signUp(completeUserData)

      // Close dialog and redirect
      onOpenChange(false)
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Error during signup:", error)
      setErrorMessage(error.message || "An error occurred during signup.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black text-white border border-gray-600 max-w-md p-8 rounded-lg z-50">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded-full"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
        </Button>

        <DialogTitle className="text-center text-xl font-semibold mb-4">Create a password</DialogTitle>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-400">Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      className="bg-transparent border-gray-600 focus:border-blue-500 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-400">Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      className="bg-transparent border-gray-600 focus:border-blue-500 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {errorMessage && <div className="text-red-500 text-center">{errorMessage}</div>}

            <Button
              type="submit"
              className="w-full rounded-full bg-white hover:bg-gray-200 text-black font-bold"
              disabled={!form.formState.isValid}
            >
              Create Account
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default CreatePasswordDialog

