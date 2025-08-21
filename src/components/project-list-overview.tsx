"use client";
import { useModalContext } from "@/context/modal-context";
import { useProjectContext } from "@/context/project-context";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { useSafeUser } from "@/context/user-context";
import { cn } from "@/utils/cn.utils";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
  onSelect?: (id?: string) => void; // allow clearing
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

  // Scrolling container
  const listScrollRef = useRef<HTMLDivElement | null>(null);
  const resolvingPageRef = useRef(false);

  const fetchParams = useMemo(
    () => ({
      type: showOwnedOnly ? ("user" as const) : ("all" as const),
      ownerId: showOwnedOnly && user?.id ? user.id : undefined,
      sort: sortBy,
      lat: lastSearchCoords?.[0],
      lng: lastSearchCoords?.[1],
      radius: lastSearchCoords ? radius : undefined,
      limit: pageSize,
    }),
    [showOwnedOnly, user?.id, sortBy, lastSearchCoords, radius, pageSize],
  );

  useEffect(() => {
    setLoading(true);
    refreshProjects({
      page: currentPage,
      ...fetchParams,
    }).finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [sortBy, currentPage, showOwnedOnly, pageSize, lastSearchCoords, radius]);

  const handleApplyFilters = (values: GeoSearchFiltersApplyPayload) => {
    if (values.sort && values.sort !== sortBy) setSortBy(values.sort as ProjectSort);
    setRadius(values.radius);
    setLastSearchCoords(values.coords);
    if (currentPage !== 1) setCurrentPage(1);
  };

  const scrollSelectedIntoView = () => {
    if (!selectedId) return;
    const container = listScrollRef.current || document;
    const trySelectors = [
      `[data-item-id="${selectedId}"]`,
      `[data-id="${selectedId}"]`,
      `#project-item-${selectedId}`,
      `#item-${selectedId}`,
      `#list-item-${selectedId}`,
      `[aria-selected="true"]`,
    ];
    let el: HTMLElement | null = null;
    for (const sel of trySelectors) {
      el = (container as HTMLElement).querySelector?.(sel) as HTMLElement | null;
      if (el) break;
    }
    if (!el) return;

    const scroller = listScrollRef.current;
    if (scroller && scroller.scrollHeight > scroller.clientHeight) {
      const cRect = scroller.getBoundingClientRect();
      const eRect = el.getBoundingClientRect();
      if (eRect.top < cRect.top + 4) {
        const delta = cRect.top - eRect.top + 8;
        scroller.scrollTo({ top: scroller.scrollTop - delta, behavior: "smooth" });
      } else if (eRect.bottom > cRect.bottom - 4) {
        const delta = eRect.bottom - cRect.bottom + 8;
        scroller.scrollTo({ top: scroller.scrollTop + delta, behavior: "smooth" });
      }
    } else {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (!selectedId || !projects) return;

    const onThisPage = projects.some((p) => p.id === selectedId);
    if (onThisPage) {
      requestAnimationFrame(() => scrollSelectedIntoView());
      return;
    }

    if (resolvingPageRef.current) return;
    resolvingPageRef.current = true;

    const maxPage = Math.max(1, Math.ceil((totalProjects || 0) / (pageSize || 1)));

    const probe = async () => {
      for (let p = 1; p <= maxPage; p++) {
        if (!selectedId) break;
        if (p === currentPage) continue;

        setLoading(true);
        await refreshProjects({ page: p, ...fetchParams }).catch(() => undefined);
        setLoading(false);
        setCurrentPage(p);
        await new Promise((r) => requestAnimationFrame(() => r(null)));

        const container = listScrollRef.current || document;
        const el = (container as HTMLElement).querySelector?.(
          `[data-item-id="${selectedId}"],[data-id="${selectedId}"],#project-item-${selectedId},#item-${selectedId},#list-item-${selectedId},[aria-selected="true"]`,
        ) as HTMLElement | null;

        if (el) {
          scrollSelectedIntoView();
          break;
        }
      }
      resolvingPageRef.current = false;
    };

    probe().catch(() => {
      resolvingPageRef.current = false;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, projects, totalProjects, pageSize, currentPage]);

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

        <div ref={listScrollRef} className={cn("flex-1 overflow-auto", minBodyHeightClass)}>
          <ProjectList
            projects={projects || []}
            theme={theme}
            loading={loading}
            commentModalProjectId={commentModalProjectId}
            setCommentModalProjectId={setCommentModalProjectId}
            refreshProjects={refreshProjects}
            selectedId={selectedId}
            onSelect={(id) => onSelect?.(id)} // still fine with string or undefined
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
