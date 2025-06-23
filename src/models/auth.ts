export interface AuthUser {
  id: string;
  name: string | null;
  email: string | null;
  username: string | null;
  emailVerified: Date | null;
  image: string | null;
  roleId: string | null;
  comments: { id: string; content: string; createdAt: Date }[];
  likes: { id: string; projectId: string | null; createdAt: Date }[];
  ideas: { id: string; title: string; createdAt: Date }[];
  projects: { id: string; title: string; createdAt: Date }[];
  role: { id: string; name: string } | null;
}

