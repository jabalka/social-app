import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

import {
  ALLOWED_ROLES_FOR_PROGRESS,
  ALLOWED_ROLES_FOR_PROGRESS_NOTES,
  ALLOWED_ROLES_FOR_PROJECT_CATEGORIES,
  ALLOWED_ROLES_FOR_PROJECT_STATUS,
} from "@/constants";
import { ProjectUpdateInput } from "@/models/project";
import { Prisma, ProjectStatus } from "@prisma/client";
import { hasPermission } from "../role-permissions";

export const createProject = async (req: NextRequest) => {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const body = await req.json();
    const { title, description, postcode, latitude, longitude, imageUrls, categories = [] } = body;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        postcode,
        latitude,
        longitude,
        authorId: session.user.id,
        categories: {
          connect: categories.slice(0, 3).map((id: string) => ({ id })),
        },
        images: {
          create: imageUrls?.map((url: string) => ({ url })) || [],
        },
      },
      include: {
        images: true,
        categories: true,
      },
    });

    return { data: { projectId: project.id, project }, status: 201 };
  } catch (err) {
    console.error("[PROJECT_CREATE_ERROR]", err);
    return { error: "Failed to create project", status: 500 };
  }
};

export const updateProject = async (
  id: string,
  {
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
  }: ProjectUpdateInput,
) => {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }
  const roleName = session.user.role?.name || null;

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { author: { select: { id: true } } },
    });

    if (!project) {
      return { error: "Project not found", status: 404 };
    }

    const isAuthor = project.author.id === session.user.id;
    const isAdmin = hasPermission(roleName, ["admin", "council", "mayor"]);

    const updateData: Prisma.ProjectUpdateInput = {};

    if (isAuthor || isAdmin) {
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (postcode !== undefined) updateData.postcode = postcode;
      if (latitude !== undefined) updateData.latitude = latitude;
      if (longitude !== undefined) updateData.longitude = longitude;
    }

    if (progress !== undefined && hasPermission(roleName, ALLOWED_ROLES_FOR_PROGRESS)) {
      updateData.progress = progress;
    }
    if (progressNotes !== undefined && hasPermission(roleName, ALLOWED_ROLES_FOR_PROGRESS_NOTES)) {
      updateData.progressNotes = progressNotes;
    }
    if (status !== undefined && hasPermission(roleName, ALLOWED_ROLES_FOR_PROJECT_STATUS)) {
      updateData.status = status as ProjectStatus;
    }
    if (categories && (isAuthor || hasPermission(roleName, ALLOWED_ROLES_FOR_PROJECT_CATEGORIES))) {
      updateData.categories = {
        set: categories.slice(0, 3).map((id) => ({ id })),
      };
    }

    if (deletedImageUrls.length > 0 && (isAuthor || isAdmin)) {
      await prisma.projectImage.deleteMany({
        where: { projectId: id, url: { in: deletedImageUrls } },
      });
    }
    if (newImageUrls.length > 0 && (isAuthor || isAdmin)) {
      await prisma.projectImage.createMany({
        data: newImageUrls.map((url: string) => ({ projectId: id, url })),
      });
    }

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
              role: { select: { id: true, name: true, icon: true } },
            },
          },
        },
      });
    } else {
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
              role: { select: { id: true, name: true, icon: true } },
            },
          },
        },
      });
    }

    return { data: updatedProject, status: 200 };
  } catch (error) {
    console.error("[PROJECT_UPDATE_ERROR]", error);
    return { error: "Failed to update project", status: 500 };
  }
};

export const getProject = async (id: string) => {
  try {
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
            role: { select: { id: true, name: true, icon: true } },
          },
        },
      },
    });

    if (!project) {
      return { error: "Project not found", status: 404 };
    }

    return { data: project, status: 200 };
  } catch (error) {
    console.error("[PROJECT_GET_ERROR]", error);
    return { error: "Failed to fetch project", status: 500 };
  }
};

export const deleteProject = async (id: string) => {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const roleName = session.user.role?.name || null;
    const project = await prisma.project.findUnique({
      where: { id },
      include: { author: { select: { id: true } } },
    });

    if (!project) {
      return { error: "Project not found", status: 404 };
    }

    const isAuthor = project.author.id === session.user.id;
    const isAdmin = hasPermission(roleName, ["admin", "council", "mayor"]);

    if (!isAuthor && !isAdmin) {
      return { error: "Forbidden: You can only delete your own projects", status: 403 };
    }

    await prisma.project.delete({ where: { id } });

    return { data: { message: "Project deleted successfully" }, status: 200 };
  } catch (error) {
    console.error("[PROJECT_DELETE_ERROR]", error);
    return { error: "Failed to delete project", status: 500 };
  }
};

export const getProjects = async (req: Request) => {
  const url = new URL(req.url);
  const near = url.searchParams.get("near");
  const radius = parseInt(url.searchParams.get("radius") || "5000", 10);
  const sort = url.searchParams.get("sort") || "createdAt";
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;

  let orderBy: Prisma.ProjectOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "likes") {
    orderBy = { likes: { _count: "desc" } };
  } else if (sort === "comments") {
    orderBy = { comments: { _count: "desc" } };
  }

  try {
    if (near) {
      const [lat, lng] = near.split(",").map(Number);
      if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
        throw new Error("Invalid coordinates or radius");
      }

      // Use raw SQL query to calculate distances
      const raw = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id
        FROM "Project"
        WHERE (
          6371000 * acos(
            cos(radians(${lat})) * cos(radians("latitude"))
            * cos(radians("longitude") - radians(${lng}))
            + sin(radians(${lat})) * sin(radians("latitude"))
          )
        ) < ${radius}
      `;

      const projectIds = raw.map((r) => r.id);

      // If no projects found, return empty array
      if (!projectIds.length) return { data: { projects: [], totalCount: 0 }, status: 200 };

      const [projects, totalCount] = await Promise.all([
        prisma.project.findMany({
          where: { id: { in: projectIds } },
          include: {
            categories: true,
            images: true,
            comments: true,
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
          orderBy,
          skip,
          take: limit,
        }),
        prisma.project.count({
          where: { id: { in: projectIds } },
        }),
      ]);

      return { data: { projects, totalCount }, status: 200 };
    }

    // Default behavior: fetch all projects
    const [projects, totalCount] = await Promise.all([
      prisma.project.findMany({
        include: {
          categories: true,
          images: true,
          comments: true,
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
        orderBy,
        skip,
        take: limit,
      }),
      prisma.project.count(),
    ]);

    return { data: { projects, totalCount }, status: 200 };
  } catch (error) {
    console.error("[PROJECT_GET_ERROR]", error);
    return { error: "Failed to fetch projects", status: 500 };
  }
};

export const toggleProjectLike = async (projectId: string) => {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }

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
      return { data: { liked: false }, status: 200 };
    } else {
      const newLike = await prisma.like.create({
        data: {
          projectId,
          userId: session.user.id,
        },
      });
      return { data: { liked: true, like: newLike }, status: 201 };
    }
  } catch (error) {
    console.error("[LIKE_ERROR]", error);
    return { error: "Failed to toggle like", status: 500 };
  }
};

export const getProjectLikes = async (projectId: string) => {
  try {
    const likes = await prisma.like.findMany({
      where: { projectId },
      select: {
        id: true,
        userId: true,
        createdAt: true,
      },
    });
    return { data: likes, status: 200 };
  } catch (error) {
    console.error("[LIKE_FETCH_ERROR]", error);
    return { error: "Failed to fetch likes", status: 500 };
  }
};
