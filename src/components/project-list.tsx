"use client";
// import { AuthUser } from "@/models/auth";
import { useModalContext } from "@/context/modal-context";
import { Project } from "@/models/project.types";
import { cn } from "@/utils/cn.utils";
import React from "react";
import ProjectCard from "./project-card";
import ProjectCardSkeleton from "./project-card-skeleton";

interface ProjectListProps {
  projects: Project[];
  theme: string;
  commentModalProjectId: string | null;
  setCommentModalProjectId: (id: string | null) => void;
  refreshProjects: () => void;
  loading: boolean;

  selectedId?: string;
  onSelect?: (id: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  theme,
  loading,
  commentModalProjectId,
  setCommentModalProjectId,
  refreshProjects,
  selectedId,
  onSelect,
}) => {
  const { isInModal } = useModalContext();

  return (
    <div
      className={cn("space-y-6 nf-scrollbar overflow-y-auto px-2", {
        "max-h-[600px]": !isInModal,
        "max-h-[calc(70vh-150px)]": isInModal,
      })}
    >
      {loading ? (
        Array.from({ length: 3 }).map((_, i) => <ProjectCardSkeleton key={i} theme={theme} />)
      ) : projects && projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            theme={theme}
            user={project.author}
            commentModalProjectId={commentModalProjectId}
            setCommentModalProjectId={setCommentModalProjectId}
            refreshProjects={refreshProjects}
            selected={selectedId === project.id}
            onSelect={() => onSelect?.(project.id)}
          />
        ))
      )}
    </div>
  );
};

export default ProjectList;
