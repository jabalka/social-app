"use client";
import { radiusOptions } from "@/constants";
import { useProjectContext } from "@/context/project-context";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { useSafeUser } from "@/context/user-context";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { getPostcodeData } from "@/utils/postcode.utils";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import CreateProjectModal from "./create-project-modal";
import GlowingGreenButton from "./shared/glowing-green-button";
import GlowingGreyButton from "./shared/glowing-grey-button";
import GlowingVioletButton from "./shared/glowing-violet-button";
import LeafletMapModal from "./leaflet-map-modal";
import Pagination from "./pagination";
import ProjectList from "./project-list";

interface Props {
  showOwnedOnly?: boolean;
  userId?: string;
}

const ProjectListOverview: React.FC<Props> = ({ showOwnedOnly = false }) => {
  const { theme } = useSafeThemeContext();
  const { projects, refreshProjects, currentPage, setCurrentPage, totalProjects, pageSize } = useProjectContext();
  const { user } = useSafeUser();

  const [sortBy, setSortBy] = useState<"createdAt" | "likes" | "comments">("createdAt");

  const [radius, setRadius] = useState(radiusOptions[0].value);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [lastSearchCoords, setLastSearchCoords] = useState<[number, number] | null>(null);
  const [storedSearchCoords, setStoredSearchCoords] = useState<[number, number] | undefined>(undefined);
  const [commentModalProjectId, setCommentModalProjectId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pendingCoords, setPendingCoords] = useState<[number, number] | null>(lastSearchCoords);
  const [pendingSortBy, setPendingSortBy] = useState<"createdAt" | "likes" | "comments">(sortBy);
  const [pendingRadius, setPendingRadius] = useState(radius);
  const [pendingAddressInfo, setPendingAddressInfo] = useState<{
    postcode?: string;
    addressLines?: string[];
    country?: string;
  } | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

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

  useEffect(() => {
    if (!pendingCoords) {
      setPendingAddressInfo(null);
      return;
    }
    const [lat, lng] = pendingCoords;
    getPostcodeData({ lat, lng }).then((result) => {
      if (result) {
        setPendingAddressInfo({
          postcode: result.postcode,
          addressLines: result.addressLines,
          country: result.addressLines?.[2],
        });
      } else {
        setPendingAddressInfo(null);
      }
    });
  }, [pendingCoords]);

  useEffect(() => {
    if (showFilters) {
      setPendingSortBy(sortBy);
      setPendingRadius(radius);
      setPendingCoords(lastSearchCoords);
      setHasSearched(false); // Reset search flag when opening

      // Fetch address info for lastSearchCoords if present
      if (lastSearchCoords) {
        const [lat, lng] = lastSearchCoords;
        getPostcodeData({ lat, lng }).then((result) => {
          if (result) {
            setPendingAddressInfo({
              postcode: result.postcode,
              addressLines: result.addressLines,
              country: result.addressLines?.[2],
            });
          } else {
            setPendingAddressInfo(null);
          }
        });
      } else {
        setPendingAddressInfo(null);
      }
    } else {
      if (!hasSearched) {
        setPendingSortBy(sortBy);
        setPendingRadius(radius);
        setPendingCoords(lastSearchCoords);
        setPendingAddressInfo(null);
      }
      // If hasSearched, keep the pending values
    }
    // eslint-disable-next-line
  }, [showFilters]);

  const handleMapPick = (lat: number, lng: number) => {
    setShowMap(false);
    setPendingCoords([lat, lng]);
    setStoredSearchCoords([lat, lng]);
    // refreshProjects({ lat, lng, radius, page: 1, sort: sortBy });
  };

  const fetchNearbyProjects = () => {
    if (!navigator.geolocation) return alert("Location not supported");
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setLastSearchCoords([latitude, longitude]);
      setStoredSearchCoords([latitude, longitude]);
      setCurrentPage(1);
      refreshProjects({ lat: latitude, lng: longitude, radius, page: 1, sort: sortBy });
    });
  };

  const onSearch = () => {
    if (sortBy !== pendingSortBy) {
      setSortBy(pendingSortBy);
    }
    if (radius !== pendingRadius) {
      setRadius(pendingRadius);
    }
    const coordsChanged =
      lastSearchCoords?.[0] !== pendingCoords?.[0] ||
      lastSearchCoords?.[1] !== pendingCoords?.[1] ||
      (!lastSearchCoords && pendingCoords) ||
      (lastSearchCoords && !pendingCoords);
    if (coordsChanged) {
      setLastSearchCoords(pendingCoords);
    }
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    setHasSearched(true); // Mark that search was clicked
    // Only update if something actually changed
    // No need to call refreshProjects here!
  };

  return (
    <div className={cn("flex w-full flex-col justify-between")}>
      <div className="mx-auto mt-2 rounded-3xl border-2 border-zinc-400/10 bg-[#f0e3dd] px-8 py-8 shadow-2xl backdrop-blur-md dark:border-zinc-700/40 dark:bg-[#f0e3dd]/10 md:max-w-5xl">
        {/* Top controls row */}
        <div className="grid grid-cols-3 items-center mb-6">
          <div className="flex min-w-[220px] flex-col items-start pt-2">
            <GlowingGreenButton onClick={() => setShowCreateModal(true)} className="h-8 p-2">
              + Create New Project
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
          
          <div className="relative flex flex-col items-end">
            <div className="pt-2">
              <GlowingGreyButton theme={theme} className="h-8 p-2" onClick={() => setShowFilters((prev) => !prev)}>
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
                <div className="flex w-full flex-col gap-4">
                  <div className="flex w-full flex-row items-center justify-between">
                    <label className="text-sm">Sort By:</label>
                    <select
                      value={pendingSortBy}
                      onChange={(e) => setPendingSortBy(e.target.value as "createdAt" | "likes" | "comments")}
                      className={cn("w-44 rounded-lg border px-2 py-1 text-sm", {
                        "border-zinc-700 bg-[#d0c4bf] text-zinc-700": theme === Theme.LIGHT,
                        "border-zinc-200 bg-[#5e5652] text-zinc-200": theme === Theme.DARK,
                      })}
                    >
                      <option value="createdAt">Newest</option>
                      <option value="likes">Most Liked</option>
                      <option value="comments">Most Commented</option>
                    </select>
                  </div>
                  <div className="flex w-full flex-row items-center justify-between">
                    <label className="whitespace-nowrap text-sm font-normal">Search Radius:</label>
                    <select
                      value={pendingRadius}
                      onChange={(e) => setPendingRadius(Number(e.target.value))}
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
                    <button
                      onClick={fetchNearbyProjects}
                      className="whitespace-nowrap rounded bg-blue-500 px-2 py-1 text-white"
                    >
                      Near Me
                    </button>
                    <GlowingVioletButton onClick={() => setShowMap(true)} className="px-2 py-1">
                      Pick on Map
                    </GlowingVioletButton>

                    <GlowingGreenButton className="px-2 py-1" onClick={onSearch}>
                      Search
                    </GlowingGreenButton>
                  </div>
                </div>

                {pendingCoords && pendingAddressInfo && (
                  <div
                    className={cn("relative mb-3 rounded border p-2 text-xs", {
                      "bg-[#574e4b]": theme === Theme.DARK,
                      "bg-[#f5e9e4]": theme === Theme.LIGHT,
                    })}
                  >
                    <button
                      className="absolute right-2 top-0 text-lg text-red-400 hover:text-red-600"
                      onClick={() => {
                        setPendingCoords(null); // Reset to no location
                        setPendingAddressInfo(null);
                        setStoredSearchCoords(undefined); // Reset map modal default
                      }}
                      title="Reset location"
                      type="button"
                    >
                      <span className="text-3xl">×</span>
                    </button>

                    <div>
                      <span className="font-semibold">Address: </span>
                      {pendingAddressInfo.postcode}
                      {pendingAddressInfo.addressLines &&
                        pendingAddressInfo.addressLines.map((line, i) => line && <div key={i}>{line}</div>)}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Project list */}
        <ProjectList
      projects={projects || []}
      theme={theme}
      loading={loading}
      commentModalProjectId={commentModalProjectId}
      setCommentModalProjectId={setCommentModalProjectId}
      refreshProjects={refreshProjects}
        />

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
        <LeafletMapModal
          open={showMap}
          theme={theme}
          onPick={handleMapPick}
          onClose={() => setShowMap(false)}
          defaultPosition={storedSearchCoords}
        />
      </div>
    </div>
  );
};

export default ProjectListOverview;
