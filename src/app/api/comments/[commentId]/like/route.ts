import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ projectId: string; commentId: string }> },
) {
  const session = await auth();
  const { commentId } = await context.params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    return NextResponse.json(updatedLikes);
  } catch (err) {
    console.error("[COMMENT_LIKE_ERROR]", err);
    return NextResponse.json({ error: "Failed to toggle comment like" }, { status: 500 });
  }
}
