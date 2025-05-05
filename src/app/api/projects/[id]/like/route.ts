import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId } = await context.params;

  try {
    const existingLike = await prisma.like.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: session.user.id,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });

      return NextResponse.json({ liked: false });
    } else {
      const newLike = await prisma.like.create({
        data: {
          projectId,
          userId: session.user.id,
        },
      });
      return NextResponse.json({ liked: true, like: newLike });
    }
  } catch (error) {
    console.error("[LIKE_ERROR]", error);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await context.params;

  try {
    const likes = await prisma.like.findMany({
      where: { projectId },
      select: {
        id: true,
        userId: true,
        createdAt: true,
      },
    });

    return NextResponse.json(likes);
  } catch (error) {
    console.error("[LIKE_FETCH_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch likes" }, { status: 500 });
  }
}
