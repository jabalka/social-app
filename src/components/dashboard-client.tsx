"use client";

import { Button } from "@/components/ui/button";
import { useIdeaContext } from "@/context/idea-context";
import { useProjectContext } from "@/context/project-context";
import { useReportIssueContext } from "@/context/report-issue-context";
import type { AuthUser } from "@/models/auth.types";
import Link from "next/link";
import React from "react";
import DashboardMapTabs from "./top-tabs-dashboard";
import UserInteractionDialog from "./user-interaction-dialog";

interface DashboardClientProps {
  user: AuthUser;
}

const DashboardClient: React.FC<DashboardClientProps> = ({ user }) => {
  const { projects, refreshProjects } = useProjectContext();
  const { ideas, refreshIdeas } = useIdeaContext();
  const { reportIssues, refreshReportIssues } = useReportIssueContext();

  const refreshProjectsZeroArg = () => refreshProjects({ page: 1, sort: "newest", type: "all" }).catch(() => undefined);

  const refreshIdeasZeroArg = () => refreshIdeas({ page: 1, sort: "newest", type: "all" }).catch(() => undefined);

  const refreshIssuesZeroArg = () =>
    refreshReportIssues({ page: 1, limit: 50, sort: "newest", type: "all" }).catch(() => undefined);

  return (
    <div className="text-center sm:w-96 md:w-[768px]">
      <h1 className="mb-6 text-3xl font-bold">Welcome {user.name ?? "User"}</h1>
      <p className="mb-8">You have successfully logged in!</p>

      <Link href="/">
        <Button className="bg-blue-500 text-white hover:bg-blue-600">Back to Home</Button>
      </Link>

      <div className="mt-6 w-full">
        <DashboardMapTabs
          user={user}
          projects={projects}
          refreshProjects={refreshProjectsZeroArg}
          ideas={ideas}
          refreshIdeas={refreshIdeasZeroArg}
          issues={reportIssues ?? []}
          refreshIssues={refreshIssuesZeroArg}
        />
      </div>

      <UserInteractionDialog currentUser={user} />
    </div>
  );
};

export default DashboardClient;
