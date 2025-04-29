import ResetPasswordClient from "@/components/reset-password-client";
import prisma from "@/lib/prisma";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Reset Password | CivilDev",
  description: "Reset your CivilDev account password using a secure link.",
};

interface ResetPasswordPageProps {
  searchParams: { token?: string };
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = async ({ searchParams }) => {
  const token = searchParams.token;

  if (!token) {
    redirect("/");
  }

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    redirect("/");
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60">
      <ResetPasswordClient token={token} />
    </div>
  );
};

export default ResetPasswordPage;
