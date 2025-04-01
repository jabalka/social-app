import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { MESSAGES } from "./constants";
import prisma from "./prisma";
import { authSchema } from "./schemas/auth.schema";
import { verifyPassword } from "./utils/crypto.utils";

const providers: NextAuthConfig["providers"] = [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    async profile({ sub: id, email, name, picture: image }) {
      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (!existingUser) {
        return await prisma.user.create({
          data: {
            id,
            email,
            name,
            image,

            emailVerified: new Date(), // Mark Google users as verified
          },
        });
      }
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
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            hashedPassword: true,
            emailVerified: true,
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

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
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
  verifyRequest: "/auth?slide=verify_email", // For email verification
};

const callbacks: NextAuthConfig["callbacks"] = {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;
      token.email = user.email;
      token.name = user.name;
      token.picture = user.image;
    }
    return token;
  },

  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.id as string;
      session.user.email = token.email as string;
      session.user.image = token.picture as string;
      session.user.name = token.name as string;
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
};
export default { providers, pages, callbacks, events } satisfies NextAuthConfig;
