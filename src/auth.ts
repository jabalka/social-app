import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";

import authConfig from "./auth.config";
import prisma from "./lib/prisma";


export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
   },
   cookies: {
    sessionToken: {
      name: "authjs.session-token",
      options: {
        httpOnly: false, 
        sameSite: "lax", 
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },




  //  jwt: {
  //   async encode({ token }) {
  //     return JSON.stringify(token); // 🚀 Forces a **signed** JWT instead of an encrypted token
  //   },
  //   async decode({ token }) {
  //     if (!token) {
  //       console.error("[NextAuth] Attempted to decode an undefined token.");
  //       return null; // 🚀 Prevents TypeScript error and ensures proper error handling
  //     }
  //     return JSON.parse(token); // 🚀 Ensures `getToken()` can properly decode it
  //   },
  // },

  ...authConfig,
});
