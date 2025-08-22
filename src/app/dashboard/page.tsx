import { auth } from "@/auth";
import DashboardClient from "@/components/dashboard-client";
import { IdeaProvider } from "@/context/idea-context";
import { ProjectProvider } from "@/context/project-context";
import { ReportIssueProvider } from "@/context/report-issue-context";
import { prisma } from "@/lib/prisma";
import type { AuthUser } from "@/models/auth.types";
import type { Project } from "@/models/project.types";
import { redirect } from "next/navigation";
import type React from "react";

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
      author: {
        include: {
          comments: { select: { id: true, content: true, createdAt: true } },
          likes: { select: { id: true, projectId: true, createdAt: true } },
          ideas: { select: { id: true, title: true, createdAt: true } },
          projects: { select: { id: true, title: true, createdAt: true } },
          role: { select: { id: true, name: true } },
          issueReports: {
            select: {
              id: true,
              title: true,
              status: true,
              description: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  // If your Project interface perfectly matches the above include, this cast is safe.
  const initialProjects = projects as unknown as Project[];
  const user = session.user as AuthUser;

  return (
    <ProjectProvider initialProjects={initialProjects}>
      <IdeaProvider>
        <ReportIssueProvider>
          <DashboardClient user={user} />
        </ReportIssueProvider>
      </IdeaProvider>
    </ProjectProvider>
  );
};

export default DashboardPage;
