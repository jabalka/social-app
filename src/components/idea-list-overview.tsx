"use client";

import IdeaList from "@/components/idea-list";
import Pagination from "@/components/pagination";
import GlowingGreenButton from "@/components/shared/glowing-green-button";
import { useIdeaContext } from "@/context/idea-context";
import { useModalContext } from "@/context/modal-context";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { useSafeUser } from "@/context/user-context";
import { cn } from "@/utils/cn.utils";
import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import SearchFilterDropdown, { GeoSearchFiltersApplyPayload } from "./search-filter-dropdown";

type IdeaSort = "newest" | "oldest" | "likes" | "comments";

interface Props {
  showOwnedOnly?: boolean;
  userId?: string;

  selectedId?: string;
  onSelect?: (id: string) => void;

  minBodyHeightClass?: string;
}

const IdeaListOverview: React.FC<Props> = ({
  showOwnedOnly = false,
  userId,
  selectedId,
  onSelect,
  minBodyHeightClass,
}) => {
  const { theme } = useSafeThemeContext();
  const { isInModal } = useModalContext();
  const { user } = useSafeUser();

  const { ideas, refreshIdeas, currentPage, setCurrentPage, totalIdeas, pageSize } = useIdeaContext();

  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<IdeaSort>("newest");
  const [radius, setRadius] = useState<number>(0);
  const [lastSearchCoords, setLastSearchCoords] = useState<[number, number] | null>(null);

  const ownerId = showOwnedOnly ? userId || user?.id : undefined;

  // Scrolling container
  const listScrollRef = useRef<HTMLDivElement | null>(null);
  const resolvingPageRef = useRef(false);

  const fetchParams = useMemo(
    () => ({
      sort,
      type: showOwnedOnly ? ("user" as const) : ("all" as const),
      ownerId,
      lat: lastSearchCoords?.[0],
      lng: lastSearchCoords?.[1],
      radius: lastSearchCoords ? radius : undefined,
      limit: pageSize,
    }),
    [sort, showOwnedOnly, ownerId, lastSearchCoords, radius, pageSize],
  );

  useEffect(() => {
    setLoading(true);
    refreshIdeas({
      page: currentPage,
      ...fetchParams,
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

  const scrollSelectedIntoView = () => {
    if (!selectedId) return;
    const container = listScrollRef.current || document;
    const trySelectors = [
      `[data-item-id="${selectedId}"]`,
      `[data-id="${selectedId}"]`,
      `#idea-item-${selectedId}`,
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
    if (!selectedId || !ideas) return;

    const onThisPage = ideas.some((i) => i.id === selectedId);
    if (onThisPage) {
      requestAnimationFrame(() => scrollSelectedIntoView());
      return;
    }

    if (resolvingPageRef.current) return;
    resolvingPageRef.current = true;

    const maxPage = Math.max(1, Math.ceil((totalIdeas || 0) / (pageSize || 1)));

    const probe = async () => {
      for (let p = 1; p <= maxPage; p++) {
        if (!selectedId) break;
        if (p === currentPage) continue;

        setLoading(true);
        await refreshIdeas({ page: p, ...fetchParams }).catch(() => undefined);
        setLoading(false);
        setCurrentPage(p);
        await new Promise((r) => requestAnimationFrame(() => r(null)));

        const container = listScrollRef.current || document;
        const el = (container as HTMLElement).querySelector?.(
          `[data-item-id="${selectedId}"],[data-id="${selectedId}"],#idea-item-${selectedId},#item-${selectedId},#list-item-${selectedId},[aria-selected="true"]`,
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
  }, [selectedId, ideas, totalIdeas, pageSize, currentPage]);

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
        <div ref={listScrollRef} className={cn("flex-1 overflow-auto", minBodyHeightClass)}>
          <IdeaList ideas={ideas} loading={loading} selectedId={selectedId} onSelect={onSelect} />
        </div>
      </div>
    </div>
  );
};

export default IdeaListOverview;
