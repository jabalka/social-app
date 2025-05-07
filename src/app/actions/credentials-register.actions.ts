"use server";

import { MESSAGES } from "@/constants";
import prisma from "@/lib/prisma";
import { bytesToHex, randomBytes, hashPassword  } from "@/utils/crypto.utils";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

export interface RegisterUserPayload {
  email: string;
  password: string;
  confirmPassword: string;
}

export async function registerUser(email: string, password: string, name: string) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: MESSAGES.USER_ALREADY_EXISTS };
  }

  try {
    const hashedPassword = await hashPassword (password);
    const verificationToken = bytesToHex(randomBytes(32));

    await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
        verificationToken,
        role: { connect: { id: "citizen" } },
        // emailVerified: new Date(),
      },
    });

    // try {
    //   await sendVerificationEmail(email, verificationToken);
    // } catch (emailErr) {
    //   console.warn("Email failed:", emailErr);
    //   // Still allow success — just log the warning
    // }

    return { success: MESSAGES.REGISTRATION_SUCCESSFUL };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: MESSAGES.SOMETHING_WENT_WRONG };
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const client = new SESv2Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const verificationUrl =
    process.env.NODE_ENV === "development"
      ? `http://localhost:${process.env.PORT ?? 3000}/api/auth/verify?token=${token}`
      : `https://yourdomain.com/api/auth/verify?token=${token}`;

      console.log("📤 Sending email to:", email);
      console.log("📤 From:", process.env.EMAIL_FROM);
      console.log("📤 Region:", process.env.AWS_REGION);
      console.log("📤 Full verification link:", verificationUrl);

  await client.send(
    new SendEmailCommand({
      FromEmailAddress: process.env.EMAIL_FROM!,
      Destination: {
        ToAddresses: [email],
      },
      Content: {
        Simple: {
          Subject: { Data: "Verify your email", Charset: "UTF-8" },
          Body: {
            Html: {
              Charset: "UTF-8",
              // this can be done to show nice UI designed email
              Data: `
              <p>Click the link below to verify your email:</p>
              <a href="${verificationUrl}">Verify email</a>
              <p>If you didn't request this email, you can safely ignore it.</p>
            `,
            },
          },
        },
      },
    }),
  );
}
