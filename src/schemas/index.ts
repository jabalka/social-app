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
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),

  CONFIRM_PASSWORD: z.string({
    required_error: "Confirm password is required",
  }),

  CURRENT_PASSWORD: z.string({
    required_error: "Current password is required",
  }),

  TWO_FACTOR_TOKEN: z
    .string({
      required_error: "MFA code is required",
    })
    .length(6, { message: "MFA code must be exactly 6 digits" })
    .regex(/^\d{6}$/, { message: "MFA code must contain only numbers" }),

  TOKENS_AMOUNT: z
    .number({
      invalid_type_error: "Please enter a valid number",
      required_error: "Amount is required",
    })
    .min(0.0000000000000001, { message: "Amount must be a positive number" })
    .transform((val) => (isNaN(val) ? 0 : val)),

  BACKUP_CODES: z
    .array(z.string().length(8, { message: "Backup code must be exactly 8 characters" }))
    .length(8, { message: "Please enter all 8 backup codes" }),

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
