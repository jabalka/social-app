"use server";

import { auth } from "@/auth";

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

