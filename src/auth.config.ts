import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { MESSAGES } from "./constants";

import type { AdapterUser } from "next-auth/adapters";
import prisma from "./lib/prisma";
import { AuthUser } from "./models/auth";
import { authSchema } from "./schemas/auth.schema";
import { verifyPassword } from "./utils/crypto.utils";

const providers: NextAuthConfig["providers"] = [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    async profile({ sub: id, email, name, picture: image }) {
      return { id, email, name, image };
    },
  }),
  Credentials({
    credentials: {
      email: {},
      password: {},
      name: { type: "text", optional: true },
    },
    authorize: async (credentials) => {
      try {
        const { email, password } = await authSchema.parseAsync(credentials);

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            comments: true,
            likes: true,
            posts: true,
            projects: true,
            role: true,
          },
        });

        if (!user) {
          throw new Error(MESSAGES.USER_NOT_FOUND);
        }
        if (!user.hashedPassword) {
          throw new Error(MESSAGES.NO_HASHED_PASSWORD);
        }
        if (password) {
          const passwordsMatch = await verifyPassword(password, user.hashedPassword);

          if (!passwordsMatch) {
            throw new Error(MESSAGES.INVALID_CREDENTIALS);
          }
        }
        const { ...safeUser } = user;

        return safeUser;
      } catch (error) {
        throw error;
      }

      // const emailVerification = callbackUrl && /\/auth\?slide=verify_email&token=[a-zA-Z0-9]+$/g.test(callbackUrl);

      // if (emailVerification) {
      //   return user;
      // }
    },
  }),
];

const pages: NextAuthConfig["pages"] = {
  signIn: "/auth",
  // verifyRequest: "/auth?slide=verify_email", // For email verification
};

const callbacks: NextAuthConfig["callbacks"] = {
  async signIn({ account, profile, credentials }) {
    if (account?.provider === "google") {
      // Check if user exists in your DB
      const existingUser = await prisma.user.findUnique({
        where: { email: profile?.email ?? "" },
      });

      if (existingUser) {
        // Check if this Google account is already linked
        const existingAccount = await prisma.account.findFirst({
          where: {
            userId: existingUser.id,
            provider: "google",
            providerAccountId: account.providerAccountId,
          },
        });

        if (!existingAccount) {
          // Link the Google account to existing user
          await prisma.account.create({
            data: {
              userId: existingUser.id,
              type: "oauth",
              provider: "google",
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
            },
          });
        }

        return true;
      }

      return true;
    }

    if (credentials) {
      return true;
    }

    return false;
  },

  async jwt({ token, user }) {
    if (user) {
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
        include: {
          comments: true,
          likes: true,
          posts: true,
          projects: true,
          role: true,
        },
      });

      if (dbUser) {
        token.id = dbUser.id;
        token.name = dbUser.name;
        token.email = dbUser.email;
        token.image = dbUser.image;
        token.username = dbUser.username;
        token.emailVerified = dbUser.emailVerified;
        token.roleId = dbUser.roleId;
        token.comments = dbUser.comments;
        token.likes = dbUser.likes;
        token.posts = dbUser.posts;
        token.projects = dbUser.projects;
        token.role = dbUser.role;
      }
    }

    return token;
  },

  async session({ session, token }) {
    if (session.user && token?.id) {
      session.user = {
        id: token.id!,
        name: token.name ?? null,
        email: token.email ?? "",
        username: token.username ?? null,
        emailVerified: token.emailVerified ?? null,
        image: token.image ?? null,
        roleId: token.roleId ?? null,
        comments: token.comments ?? [],
        likes: token.likes ?? [],
        posts: token.posts ?? [],
        projects: token.projects ?? [],
        role: token.role ?? null,
      } as AdapterUser & AuthUser;
    }

    return session;
  },
};

const events: NextAuthConfig["events"] = {
  // here can be included events such as creating posts, likes etc...
  // async signIn({ user, isNewUser }) {
  //   if (isNewUser) {
  //     // Handle new user referrals (uncomment your existing logic)
  //     const referralCode = await getReferralCodeFromCookie();
  //     if (referralCode) {
  //       const referringUser = await prisma.user.findUnique({ where: { referralCode } });
  //       if (referringUser && referringUser.email !== user.email) {
  //         await prisma.referral.create({
  //           data: {
  //             userId: user.id!,
  //             referringUserId: referringUser.id,
  //             referralCodeUsed: referralCode,
  //           },
  //         });
  //       }
  //     }
  //   }
  // },
  async createUser({ user }) {
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          role: { connect: { id: "citizen" } },
        },
      });
    } catch (err) {
      console.error("Failed to assign citizen role:", err);
    }
  },
};
export default { providers, pages, callbacks, events } satisfies NextAuthConfig;
