// File: src/app/api/users/me/comments-likes/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const skip = (page - 1) * pageSize;

  try {
    // Step 1: Get authored project IDs
    const projects = await prisma.project.findMany({
      where: { authorId: userId },
      select: { id: true },
    });

    const projectIds = projects.map((p) => p.id);

    // Step 2: Count total likes on authored projects
    const projectLikeCount = await prisma.like.count({
      where: { projectId: { in: projectIds } },
    });

    // Step 3: Count total top-level comments across all authored projects
    const totalCommentCount = await prisma.comment.count({
      where: {
        projectId: { in: projectIds },
        parentId: null,
      },
    });

    // Step 4: Fetch paginated top-level comments
    const comments = await prisma.comment.findMany({
      where: {
        projectId: { in: projectIds },
        parentId: null,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        likes: true,
        author: {
          select: { id: true, name: true, email: true, image: true },
        },
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            likes: true,
            author: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      comments,
      projectLikeCount,
      totalCommentCount,
      hasMore: skip + pageSize < totalCommentCount,
    });
  } catch (error) {
    console.error("[USER_COMMENTS_LIKES_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch comments and likes" }, { status: 500 });
  }
}


// {
//   "comments": [ ... ],
//   "projectLikeCount": 42,
//   "totalCommentCount": 125,
//   "hasMore": true
// }