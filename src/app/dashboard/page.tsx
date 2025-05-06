import type React from "react";

import { auth } from "@/auth";
import DashboardClient from "@/components/dashboard-client";
import { ProjectProvider } from "@/context/project-context";
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
      <ProjectProvider initialProjects={projects}>
        <DashboardClient user={session.user} />
      </ProjectProvider>
    </>
  );
};

export default DashboardPage;
