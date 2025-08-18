"use client";

import { useIdeaContext } from "@/context/idea-context";
import { useProjectContext } from "@/context/project-context";
import { useSafeUser } from "@/context/user-context";
import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useMemo } from "react";

const ProjectMapViewer = dynamic(() => import("@/components/project-map-viewer"), { ssr: false });
const IdeaMapViewer = dynamic(() => import("@/components/idea-map-viewer"), { ssr: false });

interface Props {
  activeTab: "projects" | "ideas" | "issues";
  showOwnedOnly?: boolean;
  ownerId?: string;
  selectedProjectId?: string;
  selectedIdeaId?: string;
  onSelectProject?: (id: string) => void;
  onSelectIdea?: (id: string) => void;
}

const ProfileMap: React.FC<Props> = ({
  activeTab,
  showOwnedOnly = false,
  ownerId,
  selectedProjectId,
  selectedIdeaId,
  onSelectProject,
  onSelectIdea,
}) => {
  const { user } = useSafeUser();
  const { projects, refreshProjects } = useProjectContext();
  const { ideas, refreshIdeas } = useIdeaContext();

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

  useEffect(() => {
    if (activeTab === "projects") refetchProjects().catch(() => undefined);
    if (activeTab === "ideas") refetchIdeas().catch(() => undefined);
  }, [activeTab, refetchProjects, refetchIdeas]);

  const projectsToShow = useMemo(() => {
    if (!showOwnedOnly || !effectiveOwnerId) return projects;
    return projects.filter((p) => p.author?.id === effectiveOwnerId);
  }, [projects, showOwnedOnly, effectiveOwnerId]);

  const ideasToShow = useMemo(() => {
    if (!showOwnedOnly || !effectiveOwnerId) return ideas;
    return ideas.filter((i) => i.author?.id === effectiveOwnerId);
  }, [ideas, showOwnedOnly, effectiveOwnerId]);

  return (
    <div className="h-full w-full rounded">
      {activeTab === "projects" && user && (
        <ProjectMapViewer
          user={user}
          projects={projectsToShow}
          refreshProjects={refetchProjects}
          selectable={true}
          selectedProjectId={selectedProjectId}
          onSelectProject={onSelectProject}
        />
      )}
      {activeTab === "ideas" && (
        <IdeaMapViewer
          ideas={ideasToShow}
          refreshIdeas={refetchIdeas}
          selectable={true}
          selectedIdeaId={selectedIdeaId}
          onSelectIdea={onSelectIdea}
        />
      )}
      {activeTab === "issues" && (
        <div className="flex h-full items-center justify-center text-sm opacity-70">
          Map for Reported Issues coming soon…
        </div>
      )}
    </div>
  );
};

export default ProfileMap;
