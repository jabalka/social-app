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
  } else {
  }

  const projects = await prisma.project.findMany({
    include: {
      categories: true,
      images: true,
      comments: true,
      likes: true,
      author: {
        include: {
          comments: {
            select: { id: true, content: true, createdAt: true }
          },
          likes: {
            select: { id: true, projectId: true, createdAt: true }
          },
          ideas: {
            select: { id: true, title: true, createdAt: true }
          },
          projects: {
            select: { id: true, title: true, createdAt: true }
          },
          role: {
            select: { id: true, name: true }
          }
        }
      }
    }
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
