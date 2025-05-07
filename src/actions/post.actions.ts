"use server";

import prisma from "@/lib/prisma";


// Create a new post
const createPost = async (postData: { title: string; content: string; authorId: string }) => {
  return await prisma.post.create({
    data: postData,
  });
};

// Get all posts with author and comment count
const getPostsWithDetails = async () => {
  return await prisma.post.findMany({
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// Get single post with full details
const getPostDetails = async (postId: string) => {
  return await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      comments: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      likes: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
};

export const postActions = {
  createPost,
  getPostsWithDetails,
  getPostDetails,
};
