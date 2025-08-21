"use client";

import { useIdeaContext } from "@/context/idea-context";
import { useProjectContext } from "@/context/project-context";
import { useReportIssueContext } from "@/context/report-issue-context";
import { useSafeUser } from "@/context/user-context";
import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useMemo } from "react";

const ProjectMapViewer = dynamic(() => import("@/components/project-map-viewer"), { ssr: false });
const IdeaMapViewer = dynamic(() => import("@/components/idea-map-viewer"), { ssr: false });
const ReportIssueMapViewer = dynamic(() => import("@/components/report-issue-map-viewer"), { ssr: false });

interface Props {
  activeTab: "projects" | "ideas" | "issues";
  showOwnedOnly?: boolean;
  ownerId?: string;
  selectedProjectId?: string;
  selectedIdeaId?: string;
  selectedIssueId?: string;
  onSelectProject?: (id: string) => void;
  onSelectIdea?: (id: string) => void;
  onSelectIssue?: (id: string) => void;
}

const ProfileMap: React.FC<Props> = ({
  activeTab,
  showOwnedOnly = false,
  ownerId,
  selectedProjectId,
  selectedIdeaId,
  selectedIssueId,
  onSelectProject,
  onSelectIdea,
  onSelectIssue,
}) => {
  const { user } = useSafeUser();
  const { projects, refreshProjects } = useProjectContext();
  const { ideas, refreshIdeas } = useIdeaContext();
  const { reportIssues, refreshReportIssues } = useReportIssueContext();

  const effectiveOwnerId = useMemo(() => {
    if (!showOwnedOnly) return undefined;
    return ownerId || user?.id || undefined;
  }, [showOwnedOnly, ownerId, user?.id]);

  const refetchProjects = useCallback(() => {
    const type = showOwnedOnly && effectiveOwnerId ? "user" : "all";
    return refreshProjects({ page: 1, sort: "newest", type, ownerId: effectiveOwnerId });
  }, [refreshProjects, showOwnedOnly, effectiveOwnerId]);

  const refetchIdeas = useCallback(() => {
    const type = showOwnedOnly && effectiveOwnerId ? "user" : "all";
    return refreshIdeas({ page: 1, sort: "newest", type, ownerId: effectiveOwnerId });
  }, [refreshIdeas, showOwnedOnly, effectiveOwnerId]);

  const refetchReportIssues = useCallback(() => {
    const type = showOwnedOnly && effectiveOwnerId ? "user" : "all";
    return refreshReportIssues({ page: 1, limit: 10, sort: "newest", type, ownerId: effectiveOwnerId });
  }, [refreshReportIssues, showOwnedOnly, effectiveOwnerId]);

  useEffect(() => {
    if (activeTab === "projects") refetchProjects().catch(() => undefined);
    if (activeTab === "ideas") refetchIdeas().catch(() => undefined);
    if (activeTab === "issues") refetchReportIssues().catch(() => undefined);
  }, [activeTab, refetchProjects, refetchIdeas, refetchReportIssues]);

  const projectsToShow = useMemo(() => {
    if (!showOwnedOnly || !effectiveOwnerId) return projects;
    return projects.filter((p) => p.author?.id === effectiveOwnerId);
  }, [projects, showOwnedOnly, effectiveOwnerId]);

  const ideasToShow = useMemo(() => {
    if (!showOwnedOnly || !effectiveOwnerId) return ideas;
    return ideas.filter((i) => i.author?.id === effectiveOwnerId);
  }, [ideas, showOwnedOnly, effectiveOwnerId]);

  const reportIssuesToShow = useMemo(() => {
    if (!showOwnedOnly || !effectiveOwnerId) return reportIssues;
    return reportIssues ? reportIssues.filter((i) => i.reporter?.id === effectiveOwnerId) : [];
  }, [reportIssues, showOwnedOnly, effectiveOwnerId]);

  return (
    <div className="h-full w-full rounded">
      {activeTab === "projects" && user && (
        <ProjectMapViewer
          user={user}
          projects={projectsToShow}
          refreshProjects={refetchProjects}
          selectable
          selectedProjectId={selectedProjectId}
          onSelectProject={onSelectProject}
          enablePopup={false}
        />
      )}
      {activeTab === "ideas" && (
        <IdeaMapViewer
          ideas={ideasToShow}
          refreshIdeas={refetchIdeas}
          selectable
          selectedIdeaId={selectedIdeaId}
          onSelectIdea={onSelectIdea}
          enablePopup={false}
        />
      )}
      {activeTab === "issues" && user && reportIssues && (
        <ReportIssueMapViewer
          user={user}
          reportIssues={reportIssuesToShow || []}
          refreshReportIssues={refetchReportIssues}
          selectedIssueId={selectedIssueId}
          onSelectIssue={onSelectIssue}
          selectable
          enablePopup={false}
        />
      )}
    </div>
  );
};

export default ProfileMap;
