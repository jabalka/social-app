"use server";

import { auth } from "@/auth";
import { ALLOWED_ROLES_FOR_PROGRESS, ALLOWED_ROLES_FOR_PROGRESS_NOTES, ALLOWED_ROLES_FOR_PROJECT_CATEGORIES, ALLOWED_ROLES_FOR_PROJECT_STATUS } from "@/constants";
import { prisma } from "@/lib/prisma";
import { Prisma, ProjectStatus } from "@prisma/client";


// Create a new project
const createProject = async (data: {
  title: string;
  description: string;
  postcode: string;
  latitude: number;
  longitude: number;
  authorId: string;
  categoryIds?: string[];
}) => {
  return await prisma.project.create({
    data: {
      ...data,
      categories: {
        connect: (data.categoryIds || []).slice(0, 3).map((id) => ({ id })),
      },
    },
  });
};

// Get all projects
const getAllProjects = async () => {
  return await prisma.project.findMany({
    include: {
      author: true,
      comments: true,
      likes: true,
      images: true,
      categories: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

// Get project by ID
const getProjectById = async (id: string) => {
  return await prisma.project.findUnique({
    where: { id },
    include: {
      author: true,
      comments: true,
      likes: true,
      images: true,
      categories: true,
    },
  });
};

// Update project
const updateProject = async (
  id: string,
  updates: {
    title?: string;
    description?: string;
    postcode?: string;
    latitude?: number;
    longitude?: number;
    progress?: number;
    progressNotes?: string;
    status?: ProjectStatus;
    categoryIds?: string[];
    newImageUrls?: string[];
    deletedImageUrls?: string[];
  }
) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const roleName = session.user.roleId || "";
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw new Error("Project not found");

  const updateData: Prisma.ProjectUpdateInput = {
    title: updates.title,
    description: updates.description,
    postcode: updates.postcode,
    latitude: updates.latitude,
    longitude: updates.longitude,
  };

  if (updates.progress !== undefined && ALLOWED_ROLES_FOR_PROGRESS.includes(roleName)) {
    updateData.progress = updates.progress;
  }

  if (updates.progressNotes !== undefined && ALLOWED_ROLES_FOR_PROGRESS_NOTES.includes(roleName)) {
    updateData.progressNotes = updates.progressNotes;
  }

  if (updates.status !== undefined && ALLOWED_ROLES_FOR_PROJECT_STATUS.includes(roleName)) {
    updateData.status = updates.status;
  }

  if (updates.categoryIds && ALLOWED_ROLES_FOR_PROJECT_CATEGORIES.includes(roleName)) {
    updateData.categories = {
      set: updates.categoryIds.slice(0, 3).map((id) => ({ id })),
    };
  }

  if (updates.deletedImageUrls?.length) {
    await prisma.projectImage.deleteMany({
      where: {
        projectId: id,
        url: { in: updates.deletedImageUrls },
      },
    });
  }

  if (updates.newImageUrls?.length) {
    await prisma.projectImage.createMany({
      data: updates.newImageUrls.map((url) => ({ projectId: id, url })),
    });
  }

  return await prisma.project.update({
    where: { id },
    data: updateData,
    include: {
      categories: true,
      images: true,
    },
  });
};

// Delete project
const deleteProject = async (id: string) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || project.authorId !== session.user.id) {
    throw new Error("Forbidden");
  }

  return await prisma.project.delete({
    where: { id },
  });
};

export const projectActions = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
