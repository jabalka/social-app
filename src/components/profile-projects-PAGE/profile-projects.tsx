"use client";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { useSafeUser } from "@/context/user-context";
import { Like, ProjectImage } from "@prisma/client";

import { PROJECT_CATEGORIES, ProjectCategory } from "@/lib/project-categories";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import CommentCreation from "../create-comment";
import GlowingProgressBar from "../glowing-progress-bar";
import { Project } from "../map-wrapper-viewer";
import ProjectDetailsDialog from "../project-details";
import { Button } from "../ui/button";

type FullProject = Project & {
  categories: ProjectCategory[];
  images: ProjectImage[];
  comments: Comment[];
  likes: Like[];
};

const ProfileProjects: React.FC = () => {
  const { theme } = useSafeThemeContext();
  const { user } = useSafeUser();
  const [projects, setProjects] = useState<FullProject[]>([]);
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState<"createdAt" | "likes" | "comments">("createdAt");

  const [commentModalProjectId, setCommentModalProjectId] = useState<string | null>(null);
  const [detailsModalProjectId, setDetailsModalProjectId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProjects = async () => {
      try {
        const res = await fetch(`/api/user/projects?sort=${sortBy}`);
        const data = await res.json();
        if (res.ok) setProjects(data);
        else console.error("Error fetching projects:", data.error);
      } catch (err) {
        console.error("Network error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProjects();
  }, [sortBy]);

  return (
    <>
      <div className="mx-auto mt-8 rounded-3xl border-2 border-zinc-400/10 bg-[#f0e3dd] px-8 py-8 shadow-2xl backdrop-blur-md dark:border-zinc-700/40 dark:bg-[#f0e3dd]/10 md:max-w-5xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">My Projects</h1>
        </div>
        <div className="mb-4 flex justify-end">
          <span>Sort By</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "createdAt" | "likes" | "comments")}
            className="rounded border px-2 py-1 text-sm dark:bg-zinc-800 dark:text-white"
          >
            <option value="createdAt">Newest</option>
            <option value="likes">Most Liked</option>
            <option value="comments">Most Commented</option>
          </select>
        </div>

        {loading ? (
          <p className="text-center">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-center">You have not created any projects yet.</p>
        ) : (
          <div className="max-h-[600px] space-y-6 overflow-y-auto pr-2">
            {projects.map((project) => {
              const showCommentModal = commentModalProjectId === project.id;
              const showDetailsModal = detailsModalProjectId === project.id;

              return (
                <div
                  key={project.id}
                  className={cn("flex h-[360px] w-full flex-col justify-between rounded border p-4 shadow", {
                    "bg-[#f0e3dd] text-zinc-700": theme === Theme.LIGHT,
                    "bg-[#332f2d] text-zinc-200": theme === Theme.DARK,
                  })}
                >
                  <h2 className="mb-1 text-sm font-bold">{project.title}</h2>

                  {project.images[0]?.url && (
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

                  <p className="line-clamp-2 text-xs">{project.description}</p>

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

                  <GlowingProgressBar
                    project={project}
                    className="mt-3 h-3 w-full border border-gray-400 bg-gray-200"
                  />

                  <p className="mt-1 text-xs text-gray-500">{project.progress}% completed</p>

                  <div className="group relative inline-flex overflow-hidden rounded-full p-[1px]">
                    <Button
                      className={cn(
                        "relative z-10 w-full rounded-full py-2 font-bold transition duration-300 hover:outline hover:outline-2",
                        {
                          "bg-gradient-to-br from-[#f3cdbd] via-[#d3a18c] to-[#bcaca5] text-zinc-700 hover:outline-gray-200":
                            theme === Theme.LIGHT,
                          "bg-gradient-to-br from-[#bda69c] via-[#72645f] to-[#bda69c] text-zinc-100 hover:outline-gray-700":
                            theme === Theme.DARK,
                        },
                      )}
                      onClick={() => setDetailsModalProjectId(project.id)}
                    >
                      View Details
                      <span className="pointer-events-none absolute inset-0 rounded-full group-hover:animate-snakeBorderHover" />
                    </Button>
                  </div>

                  <div className="mt-2 flex justify-between text-sm">
                    <div className="flex flex-col items-center">
                      <span>❤️ {project.likes.length}</span>
                      <span className="text-xs">Likes</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span>💬 {project.comments.length}</span>
                      <span className="text-xs">Comments</span>
                    </div>
                  </div>

                  {showCommentModal && (
                    <CommentCreation
                      user={user!}
                      projectId={project.id}
                      onClose={() => setCommentModalProjectId(project.id)}
                      theme={theme}
                    />
                  )}
                  {showDetailsModal && (
                    <ProjectDetailsDialog
                      user={user!}
                      project={project}
                      open={true}
                      onClose={() => setDetailsModalProjectId(null)}
                      refreshProjects={() => {}} // optionally implement
                      theme={theme}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileProjects;
