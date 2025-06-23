import { Category } from "@prisma/client";
import { Collaborator } from "./collaboration";
import { Like } from "./comment";

export type Idea = {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  likes: Like[];
  comments: Comment[];
  collaborators: Collaborator[];
  createdAt: string;
  allowCollab: boolean;
  isConverted: boolean;
  projectId?: string | null;
  updatedAt?: string;
  postcode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  what3words?: string | null;
  categories?: Category[];
  // ...may need more fields to be added
};
