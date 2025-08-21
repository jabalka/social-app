"use client";
import { useModalContext } from "@/context/modal-context";
import { useReportIssueContext } from "@/context/report-issue-context";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { useSafeUser } from "@/context/user-context";
import { cn } from "@/utils/cn.utils";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Pagination from "./pagination";
import ReportIssueList from "./report-issue-list";
import SearchFilterDropdown, { GeoSearchFiltersApplyPayload } from "./search-filter-dropdown";
import GlowingGreenButton from "./shared/glowing-green-button";

type IssueSort = "newest" | "oldest" | "priority" | "status";

interface ReportIssueListOverviewProps {
  showOwnedOnly?: boolean;
  selectedId?: string;
  onSelect?: (id: string) => void;
  minBodyHeightClass?: string;
}

const ReportIssueListOverview: React.FC<ReportIssueListOverviewProps> = ({
  showOwnedOnly = false,
  selectedId,
  onSelect,
  minBodyHeightClass,
}) => {
  const { theme } = useSafeThemeContext();
  const { user } = useSafeUser();
  const {
    reportIssues: issues,
    refreshReportIssues: refreshIssues,
    currentPage,
    setCurrentPage,
    totalReportIssues,
    pageSize,
  } = useReportIssueContext();
  const { isInModal } = useModalContext();

  const [sortBy, setSortBy] = useState<IssueSort>("newest");
  const [radius, setRadius] = useState<number>(0);
  const [lastSearchCoords, setLastSearchCoords] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);

  // Container that scrolls the list area
  const listScrollRef = useRef<HTMLDivElement | null>(null);
  const resolvingPageRef = useRef(false);

  const fetchParams = useMemo(
    () => ({
      type: showOwnedOnly ? "user" as const : "all" as const,
      ownerId: showOwnedOnly && user?.id ? user.id : undefined,
      sort: sortBy,
      lat: lastSearchCoords?.[0],
      lng: lastSearchCoords?.[1],
      radius: lastSearchCoords ? radius : undefined,
      limit: pageSize,
    }),
    [showOwnedOnly, user?.id, sortBy, lastSearchCoords, radius, pageSize]
  );

  useEffect(() => {
    setLoading(true);
    refreshIssues({
      page: currentPage,
      ...fetchParams,
    }).finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [sortBy, currentPage, showOwnedOnly, pageSize, lastSearchCoords, radius]);

  const handleApplyFilters = (values: GeoSearchFiltersApplyPayload) => {
    if (values.sort && values.sort !== sortBy) setSortBy(values.sort as IssueSort);
    setRadius(values.radius);
    setLastSearchCoords(values.coords);
    if (currentPage !== 1) setCurrentPage(1);
  };

  const handleCreate = () => {
    // open your "Report Issue" flow/modal here
    // e.g. router.push("/issues/new") or open modal
  };

  // Helper: try to find the selected item element and ensure fully visible
  const scrollSelectedIntoView = () => {
    if (!selectedId) return;
    const container = listScrollRef.current || document;
    const trySelectors = [
      `[data-item-id="${selectedId}"]`,
      `[data-id="${selectedId}"]`,
      `#issue-item-${selectedId}`,
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

    // If container is scrollable, adjust its scrollTop; else fallback to native scrollIntoView
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

  // When selectedId changes or issues change, ensure the item is on screen
  useEffect(() => {
    if (!selectedId || !issues) return;

    // If item is on current page, just scroll to it
    const onThisPage = issues.some((i) => i.id === selectedId);
    if (onThisPage) {
      // Wait for DOM to render list rows
      requestAnimationFrame(() => scrollSelectedIntoView());
      return;
    }

    // Otherwise, try to navigate to the page that contains it
    if (resolvingPageRef.current) return;
    resolvingPageRef.current = true;

    const maxPage = Math.max(1, Math.ceil((totalReportIssues || 0) / (pageSize || 1)));

    const probe = async () => {
      for (let p = 1; p <= maxPage; p++) {
        if (!selectedId) break;
        if (p === currentPage) continue;

        setLoading(true);
        await refreshIssues({ page: p, ...fetchParams }).catch(() => undefined);
        setLoading(false);

        // We rely on context to update 'issues' after refresh; check synchronously on next frame
        // Using a small delay to allow state propagation
        // eslint-disable-next-line no-loop-func
        await new Promise((r) => setTimeout(r, 0));
        const now = (document.activeElement, p); // no-op to avoid TS unused complaint
        // After context update, read latest issues via closure
        // We can't access fresh value here directly; instead, set the page so UI re-renders to that page.
        setCurrentPage(p);

        // Give a frame for the list to render, then attempt to find the element and exit
        await new Promise((r) => requestAnimationFrame(() => r(null)));
        const container = listScrollRef.current || document;
        const el = (container as HTMLElement).querySelector?.(
          `[data-item-id="${selectedId}"],[data-id="${selectedId}"],#issue-item-${selectedId},#item-${selectedId},#list-item-${selectedId},[aria-selected="true"]`
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
  }, [selectedId, issues, totalReportIssues, pageSize, currentPage]);

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
            <GlowingGreenButton onClick={handleCreate} className="h-8 p-2">
              + Report Issue
            </GlowingGreenButton>
          </div>

          <div className="flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalCount={totalReportIssues}
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
              { value: "priority", label: "Priority" },
              { value: "status", label: "Status" },
            ]}
            radiusValue={radius}
            coords={lastSearchCoords}
            onApply={handleApplyFilters}
          />
        </div>

        {/* Issue list (stabilize layout with min height). We attach a scroll ref here. */}
        <div ref={listScrollRef} className={cn("flex-1 overflow-auto", minBodyHeightClass)}>
          <ReportIssueList
            issues={issues || []}
            theme={theme}
            loading={loading}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default ReportIssueListOverview;