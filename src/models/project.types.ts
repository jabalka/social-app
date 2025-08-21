import { ProjectCategory } from "@/lib/project-categories";
import { Like, ProjectImage, ProjectStatus } from "@prisma/client";

export interface Project {
  id: string;
  title: string;
  description: string;
  postcode: string;
  latitude: number;
  longitude: number;
  progress: number;
  status: ProjectStatus;
  progressNotes: string | null;
  author: {
    id: string;
    name: string | null;
    email: string | null;
    username: string | null;
    emailVerified: Date | null;
    image: string | null;
    roleId: string | null;
    issueReports: { id: string; title: string; status: import("@prisma/client").IssueStatus; description: string; createdAt: Date }[];
    comments: { id: string; content: string; createdAt: Date }[];
    likes: { id: string; projectId: string | null; createdAt: Date }[];
    ideas: { id: string; title: string; createdAt: Date }[];
    projects: { id: string; title: string; createdAt: Date }[];
    role: { id: string; name: string } | null;
  };
  comments: {
    id: string;
    content: string;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  likes: {
    id: string;
    userId: string;
    createdAt: Date;
  }[];
  images: {
    id: string;
    url: string;
    projectId: string;
    createdAt: Date;
  }[];
  categories: {
    id: string;
    name: string;
    icon: string;
  }[];
}

export type FullProject = Project & {
  categories: ProjectCategory[];
  images: ProjectImage[];
  comments: Comment[];
  likes: Like[];
};

export interface ProjectUpdateInput {
  title?: string;
  description?: string;
  postcode?: string;
  latitude?: number;
  longitude?: number;
  progress?: number;
  progressNotes?: string;
  status?: string;
  categories?: string[];
  newImageUrls?: string[];
  deletedImageUrls?: string[];
}

export type ProjectDraft = {
  // Form fields
  title: string;
  description: string;
  postcode: string;
  latitude: number | null;
  longitude: number | null;
  images: File[];
  categories: string[];

  // (UI) fields
  lat?: number | null;
  lng?: number | null;
  what3words?: string | null;
  addressLines?: string[];
  addressCoords?: string;
  previewUrls?: string[];
};
