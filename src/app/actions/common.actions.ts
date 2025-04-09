"use server";

import { auth, signIn } from "@/auth";

import { AuthError } from "@auth/core/errors";
import { revalidateTag } from "next/cache";

import prisma from "@/prisma";
import { connection } from "next/server";

export const isomorphicNow = async () => {
  await connection();
  return Date.now();
};

export const findUserByIdentifier = async (identifier: string) => {
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

  return prisma.user.findUnique({
    where: isEmail ? { email: identifier.toLowerCase() } : { username: identifier },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      posts: true,
      likes: true,
      comments: true,
      // can be added any User fields needed
    },
  });
};

export const refreshUser = async (email: string) => {
  revalidateTag(`user-${email}`);
};

export const getCurrentUser = async () => {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  return findUserByIdentifier(session.user.email);
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
