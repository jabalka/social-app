import type { NextAuthOptions } from "next-auth";
import { randomBytes } from "crypto";
import { bytesToHex } from "viem";

import prisma from "./prisma";
import { MESSAGES } from "./constants";
import { authSchema } from "./schemas/auth.schema";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "./lib/auth";

const providers: NextAuthOptions["providers"] = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    async profile({ sub: id, email, name, picture: image }) {
      const referralCode = bytesToHex(randomBytes(16));
      return { id, email, name, image, referralCode };
    },
  }),
  CredentialsProvider({
    credentials: {
      email: {},
      password: {},
    },
    authorize: async (credentials) => {
      const { email, password, callbackUrl } = await authSchema.parseAsync(credentials);

      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        throw new Error(MESSAGES.USER_NOT_FOUND);
      }

      if (!user.hashedPassword) {
        throw new Error(MESSAGES.NO_HASHED_PASSWORD);
      }

      const emailVerification = callbackUrl && /\/auth\?slide=verify_email&token=[a-zA-Z0-9]+$/g.test(callbackUrl);

      if (emailVerification) {
        return user;
      }

      if (!user.emailVerified) {
        throw new Error(MESSAGES.EMAIL_NOT_VERIFIED);
      }

      const passwordsMatch = await verifyPassword(user.hashedPassword, password!);

      if (!passwordsMatch) {
        throw new Error(MESSAGES.INVALID_CREDENTIALS);
      }

      if (!user.twoFactorEnabled) {
        return user;
      } 

      return user;
    },
  }),
];

const pages: NextAuthConfig["pages"] = {
  signIn: "/auth",
};

const callbacks: NextAuthConfig["callbacks"] = {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;
      token.roles = user.roles;
    }

    return token;
  },

  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.id as string;
      session.user.roles = token.roles;
    }

    return session;
  },
};

const events: NextAuthConfig["events"] = {
  async signIn({ user }) {
    const referralCode = await getReferralCodeFromCookie();

    if (!referralCode) {
      return;
    }

    const referringUser = await prisma.user.findUnique({
      where: { referralCode },
    });

    if (!referringUser) {
      return;
    }

    if (referringUser.email === user.email) {
      return;
    }

    const existingReferral = await prisma.referral.findUnique({
      where: { userId: user.id },
    });

    if (existingReferral) {
      return;
    }

    await prisma.referral.create({
      data: {
        userId: user.id!,
        referringUserId: referringUser.id,
        referralCodeUsed: referralCode,
      },
    });
  },
};

export default { providers, pages, callbacks, events } satisfies NextAuthOptions;
