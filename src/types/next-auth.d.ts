import { AuthUser } from "@/models/auth";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: AuthUser;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string | null;
    email: string | null;
    username: string | null;
    emailVerified: Date | null;
    image: string | null;
    roleId: string | null;
    comments: { id: string; content: string; createdAt: Date }[];
    likes: { id: string; projectId: string | null; createdAt: Date }[];
    posts: { id: string; title: string; createdAt: Date }[];
    projects: { id: string; title: string; createdAt: Date }[];
    role: { id: string; name: string } | null;
    accessToken?: string; 
  }


}
