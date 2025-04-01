import { z } from "zod";
import { SCHEMAS } from ".";


export const authSchema = z.object({
  callbackUrl: SCHEMAS.CALLBACK_URL,
  email: SCHEMAS.EMAIL,
  password: SCHEMAS.PASSWORD.optional(),
  name: SCHEMAS.NAME.optional(),
  // Apparently we cannot pass arrays down to our auth.config
  // therefore we need to serialize them using JSON.stringify
  // and pass them as strings
  backupCodes: z.string().optional(),
});

export type AuthFormInput = z.infer<typeof authSchema>;
