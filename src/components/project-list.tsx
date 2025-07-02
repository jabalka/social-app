"use client";
// import { AuthUser } from "@/models/auth";
import { Project } from "@/models/project";
import React from "react";
import ProjectCard from "./project-card";
import ProjectCardSkeleton from "./project-card-skeleton";


interface ProjectListProps {
  projects: Project[];
  theme: string;
  // user: AuthUser;
  commentModalProjectId: string | null;
  setCommentModalProjectId: (id: string | null) => void;
  detailsModalProjectId: string | null;
  setDetailsModalProjectId: (id: string | null) => void;
  refreshProjects: () => void;
  loading: boolean;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  theme,
  loading,
  // user,
  commentModalProjectId,
  setCommentModalProjectId,
  detailsModalProjectId,
  setDetailsModalProjectId,
  refreshProjects,
}) => (
  <div className="max-h-[600px] space-y-6 overflow-y-auto px-2">
    {loading ? (
      Array.from({ length: 3 }).map((_, i) => (
        <ProjectCardSkeleton key={i} theme={theme} />
      ))
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
          detailsModalProjectId={detailsModalProjectId}
          setDetailsModalProjectId={setDetailsModalProjectId}
          refreshProjects={refreshProjects}
        />
      ))
    )}
  </div>
);

export default ProjectList;
