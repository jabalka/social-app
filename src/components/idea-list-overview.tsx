"use client";

import { radiusOptions } from "@/constants";
import { useModalContext } from "@/context/modal-context";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import LeafletMapModal from "@/components/leaflet-map-modal";
import Pagination from "@/components/pagination";
import GlowingGreenButton from "@/components/shared/glowing-green-button";
import GlowingGreyButton from "@/components/shared/glowing-grey-button";
import GlowingVioletButton from "@/components/shared/glowing-violet-button";
import IdeaList from "@/components/idea-list";
import Link from "next/link";
import { useIdeaContext } from "@/context/idea-context";
import { useSafeUser } from "@/context/user-context";

type SortType = "newest" | "oldest" | "top";

interface Props {
  showOwnedOnly?: boolean;
  userId?: string;
}

const IdeaListOverview: React.FC<Props> = ({ showOwnedOnly = false, userId }) => {
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
  const [sort, setSort] = useState<SortType>("newest");
  const [radius, setRadius] = useState(radiusOptions[0].value);
  const [showMap, setShowMap] = useState(false);
  const [lastSearchCoords, setLastSearchCoords] = useState<[number, number] | null>(null);
  const [showFilters, setShowFilters] = useState(false);

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

  const handleMapPick = (lat: number, lng: number) => {
    setShowMap(false);
    setLastSearchCoords([lat, lng]);
    setCurrentPage(1);
  };

  const fetchNearby = () => {
    if (!navigator.geolocation) return alert("Location not supported");
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setLastSearchCoords([latitude, longitude]);
      setCurrentPage(1);
    });
  };

  return (
    <div className={cn("flex w-full flex-col", { "h-full": isInModal })}>
      <div
        className={cn(
          "mx-auto mt-2 flex h-full w-full flex-col rounded-3xl border-2 px-8 py-8 shadow-2xl backdrop-blur-md",
          {
            "border-zinc-400/10 bg-[#f0e3dd] dark:border-zinc-700/40 dark:bg-[#f0e3dd]/10 md:max-w-5xl": !isInModal,
            "border-transparent bg-transparent": isInModal,
          }
        )}
      >
        {/* Header / Controls (shrink-0) */}
        <div className="mb-6 grid grid-cols-3 items-center shrink-0">
          <div className="flex min-w-[220px] flex-col items-start pt-2">
            <Link href="/share-idea">
              <GlowingGreenButton className="h-8 p-2">+ Share New</GlowingGreenButton>
            </Link>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-3">
              <span className="text-xs">Sort By:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortType)}
                className={cn("rounded-lg border px-2 py-1 text-xs", {
                  "border-zinc-700 bg-[#d0c4bf] text-zinc-700": theme === Theme.LIGHT,
                  "border-zinc-200 bg-[#5e5652] text-zinc-200": theme === Theme.DARK,
                })}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="top">Top Rated</option>
              </select>
            </div>
            <div className="relative bottom-0 mt-2">
              <Pagination
                currentPage={currentPage}
                totalCount={totalIdeas}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                theme={theme}
              />
            </div>
          </div>

          <div className="relative flex flex-col items-end">
            <div className="pt-2">
              <GlowingGreyButton theme={theme} className="h-8 p-2" onClick={() => setShowFilters((p) => !p)}>
                {showFilters ? "Hide Filters" : "Search Filters"}
              </GlowingGreyButton>
            </div>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute right-0 z-20 mx-auto mt-12 w-full max-w-xs overflow-hidden rounded-xl border border-zinc-300 bg-white p-4 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
                style={{ minWidth: 320 }}
              >
                <div className="flex w-full flex-col gap-3">
                  <div className="flex w-full flex-row items-center justify-between">
                    <label className="whitespace-nowrap text-sm font-normal">Search Radius:</label>
                    <select
                      value={radius}
                      onChange={(e) => setRadius(Number(e.target.value))}
                      className={cn("w-44 rounded-lg border px-2 py-1 text-sm", {
                        "border-zinc-700 bg-[#d0c4bf] text-zinc-700": theme === Theme.LIGHT,
                        "border-zinc-200 bg-[#5e5652] text-zinc-200": theme === Theme.DARK,
                      })}
                    >
                      {radiusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex w-full flex-row items-center justify-end gap-2">
                    <button onClick={fetchNearby} className="whitespace-nowrap rounded bg-blue-500 px-2 py-1 text-white">
                      Near Me
                    </button>
                    <GlowingVioletButton onClick={() => setShowMap(true)} className="px-2 py-1">
                      Pick on Map
                    </GlowingVioletButton>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* List (flex-1) */}
        <div className="flex-1">
          <IdeaList ideas={ideas} loading={loading} />
        </div>

        <LeafletMapModal open={showMap} theme={theme} onPick={handleMapPick} onClose={() => setShowMap(false)} />
      </div>
    </div>
  );
};

export default IdeaListOverview;