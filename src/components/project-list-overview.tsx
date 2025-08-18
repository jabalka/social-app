"use client";
import { useModalContext } from "@/context/modal-context";
import { useProjectContext } from "@/context/project-context";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { useSafeUser } from "@/context/user-context";
import { cn } from "@/utils/cn.utils";
import React, { useEffect, useState } from "react";
import CreateProjectModal from "./create-project-modal";
import Pagination from "./pagination";
import ProjectList from "./project-list";
import SearchFilterDropdown, { GeoSearchFiltersApplyPayload } from "./search-filter-dropdown";
import GlowingGreenButton from "./shared/glowing-green-button";

type ProjectSort = "newest" | "oldest" | "likes" | "comments";

interface Props {
  showOwnedOnly?: boolean;
  userId?: string;

  selectedId?: string;
  onSelect?: (id: string) => void;

  minBodyHeightClass?: string;
}

const ProjectListOverview: React.FC<Props> = ({ showOwnedOnly = false, selectedId, onSelect, minBodyHeightClass }) => {
  const { theme } = useSafeThemeContext();
  const { projects, refreshProjects, currentPage, setCurrentPage, totalProjects, pageSize } = useProjectContext();
  const { user } = useSafeUser();
  const { isInModal } = useModalContext();

  const [sortBy, setSortBy] = useState<ProjectSort>("newest");

  const [radius, setRadius] = useState<number>(0);
  const [lastSearchCoords, setLastSearchCoords] = useState<[number, number] | null>(null);

  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [commentModalProjectId, setCommentModalProjectId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    refreshProjects({
      page: currentPage,
      limit: pageSize,
      type: showOwnedOnly ? "user" : "all",
      ownerId: showOwnedOnly && user?.id ? user?.id : undefined,
      sort: sortBy,
      lat: lastSearchCoords?.[0],
      lng: lastSearchCoords?.[1],
      radius: lastSearchCoords ? radius : undefined,
    }).finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [sortBy, currentPage, showOwnedOnly, pageSize, lastSearchCoords, radius]);

  const handleApplyFilters = (values: GeoSearchFiltersApplyPayload) => {
    if (values.sort && values.sort !== sortBy) {
      setSortBy(values.sort as ProjectSort);
    }
    setRadius(values.radius);
    setLastSearchCoords(values.coords);
    if (currentPage !== 1) setCurrentPage(1);
  };

  return (
    <div className={cn("flex w-full flex-col", { "h-full": isInModal })}>
      <div
        className={cn(
          "mx-auto mt-2 flex h-full w-full flex-col rounded border-2 px-8 py-8 shadow-2xl backdrop-blur-md",
          {
            "border-zinc-400/10 bg-[#f0e3dd] dark:border-zinc-700/40 dark:bg-[#f0e3dd]/10": !isInModal,
            "border-transparent bg-transparent": isInModal,
          },
        )}
      >
        {/* Top controls row */}
        <div className="mb-4 grid shrink-0 grid-cols-3 items-center">
          <div className="flex min-w-[220px] flex-col items-start pt-2">
            <GlowingGreenButton onClick={() => setShowCreateModal(true)} className="h-8 p-2">
              + Create New
            </GlowingGreenButton>
          </div>

          <div className="flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalCount={totalProjects}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              theme={theme}
            />
          </div>

          <SearchFilterDropdown
            theme={theme}
            enableSort
            sortValue={sortBy}
            sortOptions={[
              { value: "newest", label: "Newest" },
              { value: "oldest", label: "Oldest" },
              { value: "likes", label: "Most Liked" },
              { value: "comments", label: "Most Commented" },
            ]}
            radiusValue={radius}
            coords={lastSearchCoords}
            onApply={handleApplyFilters}
          />
        </div>

        {/* Project list (stabilize layout with min height) */}
        <div className={cn("flex-1", minBodyHeightClass)}>
          <ProjectList
            projects={projects || []}
            theme={theme}
            loading={loading}
            commentModalProjectId={commentModalProjectId}
            setCommentModalProjectId={setCommentModalProjectId}
            refreshProjects={refreshProjects}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        </div>

        {showCreateModal && (
          <CreateProjectModal
            open={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onProjectCreated={() =>
              refreshProjects({
                page: currentPage,
                limit: pageSize,
                type: "user",
                ownerId: user?.id,
                sort: sortBy,
              })
            }
          />
        )}
      </div>
    </div>
  );
};

export default ProjectListOverview;
