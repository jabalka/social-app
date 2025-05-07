import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ROLES_FOR_PROGRESS_NOTES = ["admin", "council", "mayor", "planner", "inspector"];
const ALLOWED_ROLES_FOR_PROGRESS = ["admin", "council", "mayor", "inspector"];
const ALLOWED_ROLES_FOR_PROJECT_STATUS = ["admin", "council", "mayor"];
const ALLOWED_ROLES_FOR_PROJECT_CATEGORIES = ["admin", "council", "mayor", "planner", "inspector"];

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const roleName = session.user.role!.name;

  const {
    title,
    description,
    postcode,
    latitude,
    longitude,
    progress,
    progressNotes,
    status,
    categories,
    newImageUrls = [],
    deletedImageUrls = [],
  } = await request.json();

  try {
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const updateData: Prisma.ProjectUpdateInput = {
      title,
      description,
      postcode,
      latitude,
      longitude,
    };

    if (progress !== undefined && ALLOWED_ROLES_FOR_PROGRESS.includes(roleName)) {
      updateData.progress = progress;
    }

    if (progressNotes !== undefined && ALLOWED_ROLES_FOR_PROGRESS_NOTES.includes(roleName)) {
      updateData.progressNotes = progressNotes;
    }

    if (status !== undefined && ALLOWED_ROLES_FOR_PROJECT_STATUS.includes(roleName)) {
      updateData.status = status;
    }

    if (categories && ALLOWED_ROLES_FOR_PROJECT_CATEGORIES.includes(roleName)) {
      updateData.categories = {
        set: categories.slice(0, 3).map((id: string) => ({ id })),
      };
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
      data: updateData,
      include: {
        categories: true,
        images: true,
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("[PROJECT_UPDATE_ERROR]", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}
