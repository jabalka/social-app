import { z } from "zod";
import { SCHEMAS } from "./index";

export const PasswordSchema = z
  .object({
    password: SCHEMAS.PASSWORD,
    confirmPassword: SCHEMAS.CONFIRM_PASSWORD,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export type PasswordFormValues = z.infer<typeof PasswordSchema>;
