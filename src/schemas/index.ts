import { z } from "zod";

export const SCHEMAS = {
  CALLBACK_URL: z.string(),

  EMAIL: z
    .string({
      required_error: "Email is required",
    })
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),

  PASSWORD: z
    .string({
      required_error: "Password is required",
    })
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),

  CONFIRM_PASSWORD: z.string({
    required_error: "Confirm password is required",
  }),
  

  CURRENT_PASSWORD: z.string({
    required_error: "Current password is required",
  }),





  NAME: z
    .string({
      required_error: "Name is required",
    })
    .min(2, { message: "Name must be at least 2 characters" })
    .max(256, { message: "Name cannot exceed 256 characters" }),

  MESSAGE: z
    .string({
      required_error: "Message is required",
    })
    .min(10, { message: "Message must be at least 10 characters" })
    .max(512, { message: "Message cannot exceed 512 characters" }),


};
