import prisma from "@/prisma";

// Add a comment to a post
const createComment = async (commentData: { content: string; postId: string; authorId: string }) => {
  return await prisma.comment.create({
    data: commentData,
  });
};

// Get comments for a post
const getPostComments = async (postId: string) => {
  return await prisma.comment.findMany({
    where: { postId },
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
  });
};

export const commentActions = {
  createComment,
  getPostComments,
};
