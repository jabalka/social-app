import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, username, imageUrl } = await req.json();

  try {
    const updatedUser = await prisma.user.update({
  where: { id: session.user.id },
  data: {
    name: name ?? undefined,
    username: username ?? undefined,
    image: imageUrl ?? undefined,
  },
  include: {
    comments: true,
    likes: true,
    posts: true,
    projects: true,
    role: true,
  },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[USER_UPDATE_ERROR]", error);
    return NextResponse.json({ error: "Profile update failed" }, { status: 500 });
  }
}
