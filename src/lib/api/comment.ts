import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";


export const createComment = async (projectId: string, content: string, parentId?: string) => {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized", status: 401 };
    }
    if (!content?.trim()) {
      return { error: "Comment content is required", status: 400 };
    }
    try {
      const comment = await prisma.comment.create({
        data: {
          content,
          authorId: session.user.id,
          projectId,
          parentId: parentId || null,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          likes: true,
          replies: {
            orderBy: { createdAt: "asc" },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
              likes: true,
            },
          },
        },
      });
      return { data: comment, status: 201 };
    } catch (err) {
      console.error("[COMMENT_CREATE_ERROR]", err);
      return { error: "Failed to create comment", status: 500 };
    }
  };
  
  export const getProjectComments = async (projectId: string, page: number = 1, pageSize: number = 10) => {
    const skip = (page - 1) * pageSize;
    try {
      const [comments, totalCount] = await Promise.all([
        prisma.comment.findMany({
          where: {
            projectId,
            parentId: null,
          },
          orderBy: { createdAt: "desc" },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            likes: true,
            replies: {
              orderBy: { createdAt: "asc" },
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                  },
                },
                likes: true,
              },
            },
          },
          skip,
          take: pageSize,
        }),
        prisma.comment.count({
          where: { projectId, parentId: null },
        }),
      ]);
      return { data: { comments, totalCount, hasMore: skip + pageSize < totalCount }, status: 200 };
    } catch (err) {
      console.error("[COMMENT_FETCH_ERROR]", err);
      return { error: "Failed to load comments", status: 500 };
    }
  };
  
  export const updateComment = async (commentId: string, content: string) => {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized", status: 401 };
    }
    if (!content?.trim()) {
      return { error: "Content is required", status: 400 };
    }
    try {
      const existing = await prisma.comment.findUnique({ where: { id: commentId } });
      if (!existing || existing.authorId !== session.user.id) {
        return { error: "Forbidden", status: 403 };
      }
      await prisma.comment.update({
        where: { id: commentId },
        data: { content },
      });
      const updated = await prisma.comment.findUnique({
        where: { id: commentId },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          likes: true,
          replies: {
            orderBy: { createdAt: "asc" },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
              likes: true,
            },
          },
        },
      });
      return { data: updated, status: 200 };
    } catch (err) {
      console.error("[COMMENT_UPDATE_ERROR]", err);
      return { error: "Failed to update comment", status: 500 };
    }
  };
  
  export const deleteComment = async (commentId: string) => {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized", status: 401 };
    }
    try {
      const comment = await prisma.comment.findUnique({ where: { id: commentId } });
      if (!comment || comment.authorId !== session.user.id) {
        return { error: "Forbidden", status: 403 };
      }
      await prisma.comment.delete({ where: { id: commentId } });
      return { data: { success: true }, status: 200 };
    } catch (err) {
      console.error("[COMMENT_DELETE_ERROR]", err);
      return { error: "Failed to delete comment", status: 500 };
    }
  };
  
  export const toggleCommentLike = async (commentId: string) => {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized", status: 401 };
    }
  
    try {
      const existingLike = await prisma.like.findUnique({
        where: {
          commentId_userId: {
            commentId,
            userId: session.user.id,
          },
        },
      });
  
      if (existingLike) {
        await prisma.like.delete({ where: { id: existingLike.id } });
      } else {
        await prisma.like.create({
          data: {
            commentId,
            userId: session.user.id,
          },
        });
      }
  
      const updatedLikes = await prisma.like.findMany({
        where: { commentId },
      });
  
      return { data: updatedLikes, status: 200 };
    } catch (err) {
      console.error("[COMMENT_LIKE_ERROR]", err);
      return { error: "Failed to toggle comment like", status: 500 };
    }
  };