// lib/posts.ts
import prisma from '@/prisma';
import { Prisma } from '@prisma/client';

import { CommentWithAuthor } from 'comment-likes-posts-hooks-etrc/type-extensions';

const postWithDetails = Prisma.validator<Prisma.PostArgs>()({
  include: {
    author: { select: { id: true, name: true, image: true } },
    _count: { select: { comments: true, likes: true } }
  }
});
export type PostWithDetails = Prisma.PostGetPayload<typeof postWithDetails>;

export async function getPaginatedPosts(
  page: number = 1,
  limit: number = 10
): Promise<{ posts: PostWithDetails[]; total: number }> {
  const skip = (page - 1) * limit;
  
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      skip,
      take: limit,
      ...postWithDetails,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.post.count()
  ]);

  return { posts, total };
}

// lib/comments.ts
export async function getPaginatedComments(
  postId: string,
  page: number = 1,
  limit: number = 10
): Promise<{ comments: CommentWithAuthor[]; total: number }> {
  const skip = (page - 1) * limit;
  
  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: { postId },
      skip,
      take: limit,
      include: { author: { select: { id: true, name: true, image: true } } },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.comment.count({ where: { postId } })
  ]);

  return { comments, total };
}