"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function signInWithGoogle() {
  await signIn("google", {
    redirectTo: "/dashboard",
  });
}

export async function signInWithCredentials(email: string, password: string) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        error: error.cause?.err?.message || error.message,
      };
    }
  }
  return {
    success: false,
    error: "Unknown error occurred auth-actions.ts",
  };
}
