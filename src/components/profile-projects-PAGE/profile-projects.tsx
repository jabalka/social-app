"use client";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { useSafeUser } from "@/context/user-context";
import { Like, ProjectImage } from "@prisma/client";

import { ProjectCategory } from "@/lib/project-categories";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";

import React, { useEffect, useState } from "react";

import CreateProjectModal from "../create-project-modal";
import GlowingGreenButton from "../glow-green-button";

import { Project } from "../map-wrapper-viewer";

import Pagination from "../pagination";
import ProjectCard from "../project-card";

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

  const [sortBy, setSortBy] = useState<"createdAt" | "likes" | "comments">("createdAt");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [commentModalProjectId, setCommentModalProjectId] = useState<string | null>(null);
  const [detailsModalProjectId, setDetailsModalProjectId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const pageSize = 5;

  const fetchUserProjects = async () => {
    try {
      const res = await fetch(`/api/user/projects?sort=${sortBy}&page=${currentPage}&limit=${pageSize}`);
      const data = await res.json();
      if (res.ok) {
        setProjects(data.projects);
        setTotalProjects(data.totalCount);
      } else console.error("Error fetching projects:", data.error);
    } catch (err) {
      console.error("Network error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProjects();
  }, [sortBy, currentPage]);

  return (
    <>
      <div className="mx-auto mt-2 rounded-3xl border-2 border-zinc-400/10 bg-[#f0e3dd] px-8 py-8 shadow-2xl backdrop-blur-md dark:border-zinc-700/40 dark:bg-[#f0e3dd]/10 md:max-w-5xl">
        <div className="relative text-center">
          <h1 className="text-2xl font-bold">My Projects</h1>

          <div className="flex items-start justify-between">
            <div className="pt-2">
              <GlowingGreenButton onClick={() => setShowCreateModal(true)} className="h-8 p-2">
                + Create New Project
              </GlowingGreenButton>
            </div>

            <div className="flex flex-col items-end text-right">
              <span className="text-xs">Sort By:</span>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "createdAt" | "likes" | "comments")}
                className={cn("rounded-lg border px-2 py-1 text-xs", {
                  "border-zinc-700 bg-[#d0c4bf] text-zinc-700": theme === Theme.LIGHT,
                  "border-zinc-200 bg-[#5e5652] text-zinc-200": theme === Theme.DARK,
                })}
              >
                <option value="createdAt">Newest</option>
                <option value="likes">Most Liked</option>
                <option value="comments">Most Commented</option>
              </select>
            </div>
          </div>

          {showCreateModal && (
            <CreateProjectModal
              open={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              onProjectCreated={fetchUserProjects}
            />
          )}
          <div className="relative bottom-6">
            <Pagination
              currentPage={currentPage}
              totalCount={totalProjects}
              pageSize={pageSize}
              onPageChange={(page) => setCurrentPage(page)}
              theme={theme}
            />
          </div>
        </div>

        {loading ? (
          <p className="text-center">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-center">You have not created any projects yet.</p>
        ) : (
          <div className="max-h-[600px] space-y-6 overflow-y-auto px-2">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                theme={theme}
                user={user!}
                commentModalProjectId={commentModalProjectId}
                setCommentModalProjectId={setCommentModalProjectId}
                detailsModalProjectId={detailsModalProjectId}
                setDetailsModalProjectId={setDetailsModalProjectId}
                refreshProjects={fetchUserProjects}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileProjects;
