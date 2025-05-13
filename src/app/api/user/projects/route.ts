import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sort = req.nextUrl.searchParams.get("sort"); // 'date' | 'likes' | 'comments'

  let orderBy: Prisma.ProjectOrderByWithRelationInput = { createdAt: "desc" };

  if (sort === "likes") {
    orderBy = {
      likes: {
        _count: "desc",
      },
    };
  } else if (sort === "comments") {
    orderBy = {
      comments: {
        _count: "desc",
      },
    };
  }

  try {
    const projects = await prisma.project.findMany({
      where: { authorId: session.user.id },
      include: {
        images: true,
        categories: true,
        comments: true,
        likes: true,
        author: true,
      },
      orderBy,
    });

    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    console.error("[USER_PROJECTS_GET_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch user's projects" }, { status: 500 });
  }
}
