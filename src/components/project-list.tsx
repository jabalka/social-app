"use client";
// import { AuthUser } from "@/models/auth";
import { Project } from "@/models/project.types";
import React from "react";
import ProjectCard from "./project-card";
import ProjectCardSkeleton from "./project-card-skeleton";
import { useModalContext } from "@/context/modal-context";
import { cn } from "@/utils/cn.utils";

interface ProjectListProps {
  projects: Project[];
  theme: string;
  commentModalProjectId: string | null;
  setCommentModalProjectId: (id: string | null) => void;
  refreshProjects: () => void;
  loading: boolean;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  theme,
  loading,
  commentModalProjectId,
  setCommentModalProjectId,
  refreshProjects,
}) => {
  const { isInModal } = useModalContext();

  return (
    <div className={cn(
      "space-y-6 overflow-y-auto px-2",
      {
        "max-h-[600px]": !isInModal,
        "max-h-[calc(70vh-150px)]": isInModal
      }
    )}>
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
          />
        ))
      )}
    </div>
  );
};

export default ProjectList;
