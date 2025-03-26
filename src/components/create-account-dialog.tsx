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
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

import CreatePasswordDialog from "./create-password-dialog"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/utils/cn.utils"

const formSchema = z
  .object({
    name: z.string().min(1, "What's your name?"),
    email: z.string().email("Please enter a valid email.").optional(),
    phone: z
      .string()
      .regex(/^\d{10}$/, "Please enter a valid phone number.")
      .optional(),
    dob: z.date({
      required_error: "Please select a date of birth.",
    }),
  })
  .refine((data) => data.email || data.phone, {
    message: "Either email or phone is required",
    path: ["email"],
  })

type FormValues = z.infer<typeof formSchema>

interface CreateAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CreateAccountDialog: React.FC<CreateAccountDialogProps> = ({ open, onOpenChange }) => {
  const [isPhone, setIsPhone] = useState(true)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const { getUser } = useAuth()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  })
  // here needs to be used useEffect()
  const onSubmit = async (data: FormValues) => {
    try {
      setErrorMessage("")

      // Check if user exists
      let existingUser
      if (data.email) {
        existingUser = await getUser("username", data.email)
      } else if (data.phone) {
        existingUser = await getUser("username", data.phone)
      }

      if (existingUser) {
        setErrorMessage("User with this email or phone number already exists!")
        return
      }

      // Store user data and open password dialog
      setUserData(data)
      onOpenChange(false)
      setIsPasswordDialogOpen(true)
    } catch (error) {
      console.error("Error during account creation:", error)
      setErrorMessage("An error occurred during account creation.")
    }
  }

  const toggleInputType = () => {
    setIsPhone(!isPhone)
    form.setValue("email", "")
    form.setValue("phone", "")
  }

  return (
    <>
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

          <DialogTitle className="text-center text-xl font-semibold mb-4">Create your account</DialogTitle>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-400">Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        maxLength={50}
                        className="bg-transparent border-gray-600 focus:border-blue-500 text-white"
                      />
                    </FormControl>
                    <div className="text-xs text-gray-500 text-right">{field.value.length}/50</div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isPhone ? (
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-400">Phone</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-transparent border-gray-600 focus:border-blue-500 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-400">Email</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-transparent border-gray-600 focus:border-blue-500 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="text-right">
                <button type="button" onClick={toggleInputType} className="text-blue-500 hover:underline text-sm">
                  {isPhone ? "Use email instead" : "Use phone instead"}
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-white">Date of birth</h3>
                <p className="text-gray-400 text-sm">
                  This will not be shown publicly. Confirm your own age, even if this account is for a business, a pet,
                  or something else.
                </p>

                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal bg-transparent border-gray-600 text-white",
                                !field.value && "text-gray-400",
                              )}
                            >
                              {field.value ? format(field.value, "MM/dd/yyyy") : <span>MM/DD/YYYY</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-700" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                            className="bg-gray-900 text-white"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {errorMessage && <div className="text-red-500 text-center">{errorMessage}</div>}

              <Button
                type="submit"
                className="w-full rounded-full bg-white hover:bg-gray-200 text-black font-bold"
                disabled={!form.formState.isValid}
              >
                Next
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {userData && (
        <CreatePasswordDialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen} userData={userData} />
      )}
    </>
  )
}

export default CreateAccountDialog

