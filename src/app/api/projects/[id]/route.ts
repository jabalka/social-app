import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ROLES_FOR_PROGRESS_NOTES = ["admin", "council", "mayor", "planner", "inspector"];
const ALLOWED_ROLES_FOR_PROGRESS = ["admin", "council", "mayor", "inspector"];
const ALLOWED_ROLES_FOR_PROJECT_STATUS = ["admin", "council", "mayor"];
const ALLOWED_ROLES_FOR_PROJECT_CATEGORIES = ["admin", "council", "mayor", "planner", "inspector"];

function hasPermission(userRole: string | null | undefined, allowedRoles: string[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const roleName = session.user.role?.name || null;

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
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if user is the author or has admin privileges
    const isAuthor = project.author.id === session.user.id;
    const isAdmin = hasPermission(roleName, ["admin", "council", "mayor"]);

    // Basic fields that authors can always update
    const updateData: Prisma.ProjectUpdateInput = {};

    // Authors can always update basic project info
    if (isAuthor || isAdmin) {
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (postcode !== undefined) updateData.postcode = postcode;
      if (latitude !== undefined) updateData.latitude = latitude;
      if (longitude !== undefined) updateData.longitude = longitude;
    }

    // Role-based permissions for advanced fields
    if (progress !== undefined && hasPermission(roleName, ALLOWED_ROLES_FOR_PROGRESS)) {
      updateData.progress = progress;
    }

    if (progressNotes !== undefined && hasPermission(roleName, ALLOWED_ROLES_FOR_PROGRESS_NOTES)) {
      updateData.progressNotes = progressNotes;
    }

    if (status !== undefined && hasPermission(roleName, ALLOWED_ROLES_FOR_PROJECT_STATUS)) {
      updateData.status = status;
    }

    if (categories && (isAuthor || hasPermission(roleName, ALLOWED_ROLES_FOR_PROJECT_CATEGORIES))) {
      updateData.categories = {
        set: categories.slice(0, 3).map((id: string) => ({ id })),
      };
    }

    // Handle image deletions (authors and admins can manage images)
    if (deletedImageUrls.length > 0 && (isAuthor || isAdmin)) {
      await prisma.projectImage.deleteMany({
        where: { projectId: id, url: { in: deletedImageUrls } },
      });
    }

    // Handle new image additions (authors and admins can manage images)
    if (newImageUrls.length > 0 && (isAuthor || isAdmin)) {
      await prisma.projectImage.createMany({
        data: newImageUrls.map((url: string) => ({ projectId: id, url })),
      });
    }

    // Only update if there are changes to make
    let updatedProject;
    if (Object.keys(updateData).length > 0) {
      updatedProject = await prisma.project.update({
        where: { id },
        data: updateData,
        include: {
          categories: true,
          images: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: {
                select: {
                  id: true,
                  name: true,
                  icon: true,
                },
              },
            },
          },
        },
      });
    } else {
      // If no updates to the project itself, just fetch the current state
      updatedProject = await prisma.project.findUnique({
        where: { id },
        include: {
          categories: true,
          images: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: {
                select: {
                  id: true,
                  name: true,
                  icon: true,
                },
              },
            },
          },
        },
      });
    }

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("[PROJECT_UPDATE_ERROR]", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        categories: true,
        images: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        likes: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: {
              select: {
                id: true,
                name: true,
                icon: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECT_GET_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const roleName = session.user.role?.name || null;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if user is the author or has admin privileges
    const isAuthor = project.author.id === session.user.id;
    const isAdmin = hasPermission(roleName, ["admin", "council", "mayor"]);

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: You can only delete your own projects" }, { status: 403 });
    }

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("[PROJECT_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
