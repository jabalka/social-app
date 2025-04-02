"use server";

import prisma from "@/prisma";

export const getUserWithContent = async (userId: string) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      posts: true,
      comments: true,
      likes: true,
    },
  });
};
