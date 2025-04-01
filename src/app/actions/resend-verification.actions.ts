"use server";

import prisma from "@/prisma";
import { bytesToHex, randomBytes } from "@/utils/crypto.utils";
import { sendVerificationEmail } from "./credentials-register.actions";

export async function resendVerificationEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { error: "User not found" };
  }

  if (user.emailVerified) {
    return { error: "Email is already verified" };
  }

  const verificationToken = bytesToHex(randomBytes(32));

  await prisma.user.update({
    where: { id: user.id },
    data: { verificationToken },
  });

  await sendVerificationEmail(email, verificationToken);

  return { success: "Verification email has been resent. Please check your inbox." };
}
