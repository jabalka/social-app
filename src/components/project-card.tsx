"use client";

import { useProjectModal } from "@/context/project-modal-context";
import { useSafeUser } from "@/context/user-context";
import { AuthUser } from "@/models/auth.types";
import { Project } from "@/models/project.types";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import Image from "next/image";
import React from "react";
import DefaultProjectImage from "../../public/images/project-image-dedfault.png";
import CommentCreation from "./create-comment";
import CategorySelector from "./project-category-selector";
import GlowingProgressBar from "./shared/glowing-progress-bar";
import { Button } from "./ui/button";

interface ProjectCardProps {
  project: Project;
  theme: string;
  user: AuthUser;
  commentModalProjectId: string | null;
  setCommentModalProjectId: (id: string | null) => void;
  refreshProjects: () => void;
  selected?: boolean;
  onSelect?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  theme,
  commentModalProjectId,
  setCommentModalProjectId,
  selected,
  onSelect,
}) => {
  const { openProjectModal } = useProjectModal();
  const { user: currentUser } = useSafeUser();

  const showCommentModal = commentModalProjectId === project.id;

  const handleViewDetails = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await openProjectModal(project.id);
  };

  const rootClass = cn(
    "flex w-full min-h-[300px] cursor-pointer flex-col justify-between rounded border p-4 shadow transition",
    "hover:border-violet-400/60 hover:shadow-md",
    selected ? "ring-2 ring-violet-500/70" : "ring-0",
    theme === Theme.DARK ? "bg-zinc-900/60" : "bg-white",
  );

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect?.()}
        className={rootClass}
      >
        <div className="flex flex-col gap-3 md:flex-row">
          {/* LEFT COLUMN */}
          <div className="flex-1">
            <h2 className="mb-1 text-sm font-bold">{project.title}</h2>
            <p className="line-clamp-3 text-xs">{project.description}</p>

            <div className="mt-2 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
              <CategorySelector
                mode="view"
                displayCategories={project.categories}
                theme={theme}
                watchedCategories={project.categories.map((cat) => cat.id)}
              />
            </div>

            <GlowingProgressBar project={project} className="mt-3 h-3 w-full border border-gray-400 bg-gray-200" />
            <p className="mt-1 text-xs text-gray-500">{project.progress}% completed</p>

            <div className="group relative mt-2 inline-flex w-44 overflow-hidden rounded-full p-[1px]">
              <Button
                className={cn(
                  "relative w-full rounded-full py-2 font-bold outline-4 outline-gray-200 hover:outline-8",
                  {
                    "bg-gradient-to-br from-[#f3cdbd] via-[#d3a18c] to-[#bcaca5] text-zinc-700 hover:bg-gradient-to-br hover:from-[#b79789] hover:via-[#ddbeb1] hover:to-[#92817a] hover:text-zinc-50 hover:outline-gray-200":
                      theme === Theme.LIGHT,
                    "bg-gradient-to-br from-[#bda69c] via-[#72645f] to-[#bda69c] text-zinc-100 hover:bg-gradient-to-br hover:from-[#ff6913]/50 hover:via-white/20 hover:to-[#ff6913]/60 hover:text-gray-600 hover:outline-gray-700":
                      theme === Theme.DARK,
                  },
                )}
                onClick={handleViewDetails}
              >
                View Details
                <span
                  className={cn("pointer-events-none absolute -inset-[1px] overflow-hidden rounded-full", {
                    "group-hover:animate-snakeBorderHoverLight": theme === Theme.LIGHT,
                    "group-hover:animate-snakeBorderHoverDark": theme === Theme.DARK,
                  })}
                />
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN (Image) */}
          <div
            className="h-32 overflow-hidden rounded-2xl md:ml-6 md:h-auto md:w-1/3"
            onClick={(e) => e.stopPropagation()}
          >
            {project.images[0]?.url ? (
              <Image
                src={project.images[0].url}
                alt={`${project.title} preview`}
                width={240}
                height={240}
                className="h-full w-full object-cover"
              />
            ) : (
              <Image
                src={DefaultProjectImage}
                alt={`${project.title} preview`}
                width={240}
                height={240}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Bottom row: Likes & Comments */}
        <div className="mt-4 flex justify-between text-sm" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col items-center">
            <span>❤️ {project.likes.length}</span>
            <span className="text-xs">Likes</span>
          </div>
          <div className="flex flex-col items-center">
            <span>💬 {project.comments.length}</span>
            <span className="text-xs">Comments</span>
          </div>
        </div>
      </div>

      {showCommentModal && currentUser && (
        <CommentCreation
          user={currentUser}
          projectId={project.id}
          onClose={() => setCommentModalProjectId(project.id)}
          theme={theme}
        />
      )}
    </>
  );
};

export default ProjectCard;
