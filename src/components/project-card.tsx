"use client";

import { useProjectModal } from "@/context/project-modal-context";
import { useSafeUser } from "@/context/user-context";
import { PROJECT_CATEGORIES } from "@/lib/project-categories";
import { AuthUser } from "@/models/auth.types";
import { Project } from "@/models/project.types";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import Image from "next/image";
import React from "react";
import DefaultProjectImage from "../../public/images/project-image-dedfault.png";
import CommentCreation from "./create-comment";
import GlowingProgressBar from "./glowing-progress-bar";
import { Button } from "./ui/button";

interface ProjectCardProps {
  project: Project;
  theme: string;
  user: AuthUser;
  commentModalProjectId: string | null;
  setCommentModalProjectId: (id: string | null) => void;
  refreshProjects: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  theme,
  commentModalProjectId,
  setCommentModalProjectId,
  // refreshProjects,
}) => {
  const { openProjectModal } = useProjectModal();
  const { user: currentUser } = useSafeUser();

  const showCommentModal = commentModalProjectId === project.id;

  const handleViewDetails = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await openProjectModal(project.id);
  };

  return (
    <>
      <div className="flex h-[360px] w-full flex-col justify-between rounded border p-4 shadow">
        <div className="flex flex-col gap-3 md:flex-row">
          {/* LEFT COLUMN */}
          <div className="flex-1">
            <h2 className="mb-1 text-sm font-bold">{project.title}</h2>
            <p className="line-clamp-3 text-xs">{project.description}</p>

            {/* Categories */}
            <div className="mt-2 flex flex-wrap gap-2">
              {project.categories.map(({ id, name }) => {
                const matched = PROJECT_CATEGORIES.find((cat) => cat.id === id);
                const Icon = matched?.icon;
                return (
                  Icon && (
                    <div key={id} className="group relative flex items-center justify-center">
                      <Icon
                        className={cn("h-5 w-5", {
                          "text-gray-700 group-hover:text-orange-700": theme === Theme.LIGHT,
                          "text-zinc-200 group-hover:text-orange-700": theme === Theme.DARK,
                        })}
                      />
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 scale-0 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white transition-all group-hover:scale-100">
                        {name}
                      </div>
                    </div>
                  )
                );
              })}
            </div>

            {/* Progress */}
            <GlowingProgressBar project={project} className="mt-3 h-3 w-full border border-gray-400 bg-gray-200" />
            <p className="mt-1 text-xs text-gray-500">{project.progress}% completed</p>

            {/* View Details Button */}
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
          {project.images[0]?.url ? (
            <div className="h-32 overflow-hidden rounded-2xl md:ml-6 md:h-auto md:w-1/3">
              <Image
                src={project.images[0].url}
                alt={`${project.title} preview`}
                width={240}
                height={240}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-32 overflow-hidden rounded-2xl md:ml-6 md:h-auto md:w-1/3">
              <Image
                src={DefaultProjectImage}
                alt={`${project.title} preview`}
                width={240}
                height={240}
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Bottom row: Likes & Comments */}
        <div className="mt-4 flex justify-between text-sm">
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
      {/* Modals */}
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
