import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";

import authConfig from "./auth.config";
import prisma from "./prisma";
// import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { 
    strategy: "jwt",
    updateAge: 0, // Forces session update on every request
    maxAge: 30 * 24 * 60 * 60, // 30 days
   },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true, // Add this for development
  ...authConfig,
  debug: process.env.NODE_ENV === "development",
});
