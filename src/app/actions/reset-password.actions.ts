"use server";

import prisma from "@/prisma";
import { hashPassword } from "@/utils/crypto.utils";

export const resetPassword = async (token: string, newPassword: string) => {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    return { error: "Invalid or expired reset token" };
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return { success: "Password successfully reset" };
};
