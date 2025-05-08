// File: src/app/api/projects/[id]/comment/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Create a comment
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id: projectId } = await context.params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content, parentId } = await request.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
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
    return NextResponse.json(comment, { status: 201 });
  } catch (err) {
    console.error("[COMMENT_CREATE_ERROR]", err);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
// Get paginated comments for a project with replies and author info
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await context.params;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

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

    return NextResponse.json({ comments, totalCount, hasMore: skip + pageSize < totalCount });
  } catch (err) {
    console.error("[COMMENT_FETCH_ERROR]", err);
    return NextResponse.json({ error: "Failed to load comments" }, { status: 500 });
  }
}

// Edit a comment
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id: commentId } = await context.params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content } = await request.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  try {
    const existing = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!existing || existing.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[COMMENT_UPDATE_ERROR]", err);
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
  }
}

// Delete a comment
export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id: commentId } = await context.params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment || comment.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.comment.delete({ where: { id: commentId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[COMMENT_DELETE_ERROR]", err);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
