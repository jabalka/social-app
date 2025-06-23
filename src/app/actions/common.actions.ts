"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

import { revalidateTag } from "next/cache";

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
      username: true,
      name: true,
      image: true,
      ideas: true,
      likes: true,
      comments: true,
      projects: true,
      role: true,
      roleId: true,
      emailVerified: true,
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

