import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const {
    title,
    description,
    postcode,
    latitude,
    longitude,
    newImageUrls = [],
    deletedImageUrls = [],
  } = await request.json();

  try {
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project || project.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (deletedImageUrls.length > 0) {
      await prisma.projectImage.deleteMany({
        where: { projectId: id, url: { in: deletedImageUrls } },
      });
    }

    if (newImageUrls.length > 0) {
      await prisma.projectImage.createMany({
        data: newImageUrls.map((url: string) => ({ projectId: id, url })),
      });
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: { title, description, postcode, latitude, longitude },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("[PROJECT_UPDATE_ERROR]", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}
