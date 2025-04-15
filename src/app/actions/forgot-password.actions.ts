"use server";

import prisma from "@/prisma";
// import { AuthSlide } from "@/types/auth-slide.enum";
import { getResetPasswordEmailComponent } from "@/components/render-reset-password-email";
import { bytesToHex, randomBytes } from "@/utils/crypto.utils";
import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";
import { Resend } from "resend";

// Depending on the needs, later in production the Resend can be replaced with SES from AWS
const resend = new Resend(process.env.RESEND_API_KEY);
const sesClient = new SESv2Client();

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { error: "User not found" };
  }

  const resetToken = bytesToHex(randomBytes(32));
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

  await prisma.user.update({
    where: { email },
    data: {
      resetToken,
      resetTokenExpiry,
    },
  });

  const resetUrl =
    process.env.NODE_ENV === "development"
      ? `http://localhost:${process.env.PORT ?? 3000}/reset-password?token=${resetToken}`
      : `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

  await sendPasswordResetEmail(email, resetUrl);

  return { success: "Reset password link sent to your email" };
}

async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const provider = process.env.EMAIL_PROVIDER || "resend";

  if (provider === "ses") {
    await sesClient.send(
      new SendEmailCommand({
        FromEmailAddress: process.env.EMAIL_FROM!,
        Destination: {
          ToAddresses: [email],
        },
        Content: {
          Simple: {
            Subject: { Data: "Reset your password", Charset: "UTF-8" },
            Body: {
              Html: {
                Charset: "UTF-8",
                Data: `
                <p>Click the link below to reset your password:</p>
                <a href="${resetUrl}">Reset password</a>
                <p>If you didn't request this email, you can safely ignore it.</p>
              `,
              },
            },
          },
        },
      }),
    );
  } else if (provider === "resend") {
    await resend.emails.send({
      from: "CivilDev <onboarding@resend.dev>",
      to: email,
      subject: "Reset your password",
      react: getResetPasswordEmailComponent(resetUrl),
    });
  } else {
    throw new Error(`Unsupported email provider: ${provider}`);
  }
}
