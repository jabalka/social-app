"use client";

import { UserDialogProvider } from "@/context/user-dialog-context";
import { PROJECT_CATEGORIES } from "@/lib/project-categories";
import { AuthUser } from "@/models/auth";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import Image from "next/image";
import { useEffect, useState } from "react";
import CommentCreation from "./create-comment";
import GlowingProgressBar from "./glowing-progress-bar";
import ProjectDetailsDialog from "./project-details";
import { Button } from "./ui/button";
import { Project } from "@/models/project";

interface ProjectPopupContentProps {
  user: AuthUser;
  project: Project;
  refreshProjects(): void;
  theme: string;
}

const ProjectPopupContent: React.FC<ProjectPopupContentProps> = ({ user, project, refreshProjects, theme }) => {
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [animationKey, setAnimationKey] = useState<number>(0);

  useEffect(() => {
    if (animationKey === 0) return;

    const timeout = setTimeout(() => {
      setAnimationKey(0);
    }, 1500); // match style animation duration (in ms)

    return () => clearTimeout(timeout);
  }, [animationKey]);

  return (
    <UserDialogProvider>
          <div
        className={cn("flex h-[360px] w-48 flex-col justify-between rounded border p-4 shadow", {
          "bg-[#f0e3dd] text-zinc-700": theme === Theme.LIGHT,
          "bg-[#332f2d] text-zinc-200": theme === Theme.DARK,
        })}
        style={
          {
            "--popup-bg": theme === Theme.LIGHT ? "#f0e3dd" : "#332f2d",
            backgroundColor: "var(--popup-bg)",
          } as React.CSSProperties & Record<string, string>
        }
      >
        <h2 className="mb-1 text-sm font-bold">{project.title}</h2>

        {project.images.length > 0 && (
          <div className="mb-3 h-24 w-full overflow-hidden rounded">
            <Image
              src={project.images[0].url}
              alt={`${project.title} preview`}
              width={240}
              height={240}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Category Icons */}
        <div className="mt-2 flex gap-2">
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

        <GlowingProgressBar project={project} className="mt-3 h-3 w-full border-[1px] border-gray-400 bg-gray-200" />
        <p
          className={cn("mt-1 text-xs text-gray-500", {
            "bg-[#f0e3dd] text-zinc-700": theme === Theme.LIGHT,
            "bg-[#332f2d] text-zinc-200": theme === Theme.DARK,
          })}
        >
          {project.progress}% completed
        </p>
        <div className="group relative inline-flex overflow-hidden rounded-full p-[1px]">
          <Button
            className={cn(
              "relative z-10 w-full rounded-full py-3 font-bold transition duration-300 hover:outline hover:outline-2",
              {
                "bg-gradient-to-br from-[#f3cdbd] via-[#d3a18c] to-[#bcaca5] text-zinc-700 hover:bg-gradient-to-br hover:from-[#b79789] hover:via-[#ddbeb1] hover:to-[#92817a] hover:text-zinc-50 hover:outline-gray-200":
                  theme === Theme.LIGHT,
                "bg-gradient-to-br from-[#bda69c] via-[#72645f] to-[#bda69c] text-zinc-100 hover:bg-gradient-to-br hover:from-[#ff6913]/50 hover:via-white/20 hover:to-[#ff6913]/60 hover:text-gray-600 hover:outline-gray-700":
                  theme === Theme.DARK,
              },
            )}
            onClick={() => setShowDetailsModal(true)}
          >
            View Details
            {/* Animated border layer */}
            <span
              key={animationKey}
              className={cn("pointer-events-none absolute inset-0 rounded-full", {
                "group-hover:animate-snakeBorderHoverLight": theme === Theme.LIGHT,
                "group-hover:animate-snakeBorderHoverDark": theme === Theme.DARK,
              })}
            />
          </Button>
        </div>
        <div
          className={cn("flex justify-between text-sm", {
            "text-zinc-700": theme === Theme.LIGHT,
            "text-zinc-200": theme === Theme.DARK,
          })}
        >
          <div className="flex flex-col items-center">
            <span>❤️ {project.likes.length}</span>
            <span className="text-xs">Likes</span>
          </div>
          <div className="flex flex-col items-center">
            <span>💬 {project.comments.length}</span>
            <span className="text-xs">Comments</span>
          </div>
        </div>

        {/* Comment Modal */}
        {showCommentModal && (
          <CommentCreation
            user={user}
            projectId={project.id}
            onClose={() => setShowCommentModal(false)}
            theme={theme}
          />
        )}
        {showDetailsModal && (
          <ProjectDetailsDialog
            user={user}
            project={project}
            open={true}
            onClose={() => setShowDetailsModal(false)}
            refreshProjects={refreshProjects}
            theme={theme}
          />
        )}
      </div>
    </UserDialogProvider>
  );
};

export default ProjectPopupContent;
