"use client";

import { useModalContext } from "@/context/modal-context";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { cn } from "@/utils/cn.utils";
import React, { useEffect, useState } from "react";
import Pagination from "@/components/pagination";
import GlowingGreenButton from "@/components/shared/glowing-green-button";
import IdeaList from "@/components/idea-list";
import Link from "next/link";
import { useIdeaContext } from "@/context/idea-context";
import { useSafeUser } from "@/context/user-context";
import SearchFilterDropdown, { GeoSearchFiltersApplyPayload } from "./search-filter-dropdown";

type IdeaSort = "newest" | "oldest" | "likes" | "comments";

interface Props {
  showOwnedOnly?: boolean;
  userId?: string;

  selectedId?: string;
  onSelect?: (id: string) => void;

  minBodyHeightClass?: string;
}

const IdeaListOverview: React.FC<Props> = ({ showOwnedOnly = false, userId, selectedId, onSelect, minBodyHeightClass }) => {
  const { theme } = useSafeThemeContext();
  const { isInModal } = useModalContext();
  const { user } = useSafeUser();

  const {
    ideas,
    refreshIdeas,
    currentPage,
    setCurrentPage,
    totalIdeas,
    pageSize,
  } = useIdeaContext();

  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<IdeaSort>("newest");
  const [radius, setRadius] = useState<number>(0);
  const [lastSearchCoords, setLastSearchCoords] = useState<[number, number] | null>(null);

  const ownerId = showOwnedOnly ? (userId || user?.id) : undefined;
  
  useEffect(() => {
    setLoading(true);
    refreshIdeas({
      page: currentPage,
      limit: pageSize,
      sort,
      type: showOwnedOnly ? "user" : "all",
      ownerId,
      lat: lastSearchCoords?.[0],
      lng: lastSearchCoords?.[1],
      radius: lastSearchCoords ? radius : undefined,
    }).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, currentPage, pageSize, lastSearchCoords, radius, showOwnedOnly, ownerId]);

  const handleApplyFilters = (values: GeoSearchFiltersApplyPayload) => {
    if (values.sort && values.sort !== sort) {
      setSort(values.sort as IdeaSort);
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
        }
      )}
    >
      {/* Header / Controls (shrink-0) */}
      <div className="mb-4 grid shrink-0 grid-cols-3 items-center">
        <div className="flex min-w-[220px] flex-col items-start pt-2">
          <Link href="/share-idea">
            <GlowingGreenButton className="h-8 p-2">+ Create New</GlowingGreenButton>
          </Link>
        </div>

        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalCount={totalIdeas}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            theme={theme}
          />
        </div>

        <SearchFilterDropdown
          theme={theme}
          enableSort
          sortValue={sort}
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

      {/* List (stabilize height) */}
      <div className={cn("flex-1", minBodyHeightClass)}>
        <IdeaList ideas={ideas} loading={loading} selectedId={selectedId} onSelect={onSelect} />
      </div>
    </div>
  </div>
  );
};

export default IdeaListOverview;