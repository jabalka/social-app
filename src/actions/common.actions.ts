"use server";

import { auth, signIn } from "@/auth";
import { User } from "@prisma/client";
import { AuthError } from "next-auth";
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { connection } from "next/server";

export const isomorphicNow = async () => {
  await connection();
  return Date.now();
};

export const fetchUser = async (email: string) => {
  const readonlyHeaders = await headers();
  const host = readonlyHeaders.get("host");
  const protocol = process?.env.NODE_ENV === "development" ? "http" : "https";
  const url = `${protocol}://${host}/api/users/${encodeURIComponent(email)}`;

  const res = await fetch(url, { next: { tags: [`user-${email}`] } });

  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }

  return res.json<User>();
};

export const getUser = async (email: string) => {
  try {
    const user = await fetchUser(email);
    return user;
  } catch {
    return null;
  }
};

export const refreshUser = async (email: string) => {
  revalidateTag(`user-${email}`);
};

export const getCurrentUser = async () => {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  return getUser(session.user.email);
};

export const login = async (email: string, password: string, twoFactorToken?: string, backupCodes?: string[]) => {
  try {
    await signIn("credentials", {
      redirect: false,
      email,
      password,
      ...(twoFactorToken ? { twoFactorToken } : {}),
      ...(backupCodes ? { backupCodes: JSON.stringify(backupCodes) } : {}),
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.cause?.err?.message ?? error.type };
    }

    throw error;
  }
};
