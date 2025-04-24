// app/api/projects/[id]/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const PATCH = async (req: NextRequest, context: { params: { id: string } }) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = context.params?.id;

  const body = await req.json();
  const { title, description, postcode, latitude, longitude, newImageUrls = [], deletedImageUrls = [] } = body;

  try {
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project || project.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Remove selected images
    if (deletedImageUrls.length > 0) {
      await prisma.projectImage.deleteMany({
        where: { projectId: id, url: { in: deletedImageUrls } },
      });
    }

    // Add new uploaded images
    if (newImageUrls.length > 0) {
      await prisma.projectImage.createMany({
        data: newImageUrls.map((url: string) => ({ projectId: id, url })),
      });
    }

    // Update other project fields
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        title,
        description,
        postcode,
        latitude,
        longitude,
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("[PROJECT_UPDATE_ERROR]", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
};

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project || project.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.projectImage.deleteMany({ where: { projectId: id } });
    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ message: "Project deleted" }, { status: 200 });
  } catch (error) {
    console.error("[PROJECT_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
