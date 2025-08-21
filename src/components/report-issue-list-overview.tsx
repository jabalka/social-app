"use client";
import { useModalContext } from "@/context/modal-context";
import { useReportIssueContext } from "@/context/report-issue-context";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { useSafeUser } from "@/context/user-context";
import { cn } from "@/utils/cn.utils";
import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    setLoading(true);
    refreshIssues({
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
    if (values.sort && values.sort !== sortBy) setSortBy(values.sort as IssueSort);
    setRadius(values.radius);
    setLastSearchCoords(values.coords);
    if (currentPage !== 1) setCurrentPage(1);
  };

  const handleCreate = () => {
    // open your "Report Issue" flow/modal here
    // e.g. router.push("/issues/new") or open modal
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

        {/* Issue list (stabilize layout with min height) */}
        <div className={cn("flex-1", minBodyHeightClass)}>
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
