import type React from "react";

import { auth } from "@/auth";
import DashboardClient from "@/components/dashboard-client";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const DashboardPage: React.FC = async () => {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const projects = await prisma.project.findMany({
    include: {
      categories: true,
      images: true,
      comments: true,
      likes: true,
      author: true,
    },
  });

  return (
    <>
      <DashboardClient user={session.user} projects={projects} />
    </>
  );
};

export default DashboardPage;
