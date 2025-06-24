"use client";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { Idea } from "@/models/idea";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import React, { useEffect, useState } from "react";

import { radiusOptions } from "@/constants";
import Link from "next/link";
import IdeaCard from "./PAGE-create-idea/idea-card";
import GlowingGreenButton from "./glowing-green-button";
import LeafletMapModal from "./leaflet-map-modal";
import Pagination from "./pagination";

type SortType = "newest" | "oldest" | "top";

const pageSize = 5;

const BrowseIdeas: React.FC = () => {
  const { theme } = useSafeThemeContext();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [totalIdeas, setTotalIdeas] = useState(0);

  const [sort, setSort] = useState<SortType>("newest");
  const [radius, setRadius] = useState(radiusOptions[0].value);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  // Advanced: store last search coords if user used the map
  const [lastSearchCoords, setLastSearchCoords] = useState<[number, number] | null>(null);

  // Fetch ideas with optional location filter
  const fetchIdeas = async ({
    lat,
    lng,
    radius,
    page,
    sort,
  }: {
    lat?: number;
    lng?: number;
    radius?: number;
    page?: number;
    sort?: SortType;
  } = {}) => {
    setLoading(true);
    let url = `/api/ideas?sort=${sort || "newest"}&page=${page || 1}&limit=${pageSize}`;
    if (lat !== undefined && lng !== undefined && radius) {
      url += `&near=${lat},${lng}&radius=${radius}`;
    }
    try {
      const res = await fetch(url);
      const data = await res.json();
      setIdeas(data.data || []);
      setTotalIdeas(data.totalCount ?? data.data?.length ?? 0);
    } catch (e) {
      console.log("Error fetching ideas:", e);
      setIdeas([]);
      setTotalIdeas(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Default fetch, no geofilter
    fetchIdeas({ page: currentPage, sort });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, currentPage]);

  // Use this to handle map pick
  const handleMapPick = (lat: number, lng: number) => {
    setShowMap(false);
    setLastSearchCoords([lat, lng]);
    setCurrentPage(1);
    fetchIdeas({ lat, lng, radius, page: 1, sort });
  };

  // Use this to search near user
  const fetchNearby = () => {
    if (!navigator.geolocation) return alert("Location not supported");
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setLastSearchCoords([latitude, longitude]);
      setCurrentPage(1);
      fetchIdeas({ lat: latitude, lng: longitude, radius, page: 1, sort });
    });
  };

  // On changing radius, redo last geo search if set, otherwise no-op
  useEffect(() => {
    if (lastSearchCoords) {
      fetchIdeas({
        lat: lastSearchCoords[0],
        lng: lastSearchCoords[1],
        radius,
        page: currentPage,
        sort,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radius]);

  return (
    <div className="mx-auto mt-2 rounded-3xl border-2 border-zinc-400/10 bg-[#f0e3dd] px-8 py-8 shadow-2xl backdrop-blur-md dark:border-zinc-700/40 dark:bg-[#f0e3dd]/10 md:max-w-5xl">
      <div className="relative text-center">
        <h1 className="text-2xl font-bold">Browse Ideas</h1>
        <div className="flex items-start justify-between">
          <div className="pt-2">
            <Link href="/share-idea">
              <GlowingGreenButton className="h-8 p-2">+ Share New Idea</GlowingGreenButton>
            </Link>
          </div>
          <div className="flex flex-col items-end text-right">
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
        </div>

        {/* Radius/location controls */}
        <div className="mb-2 mt-3 flex items-center justify-center gap-2">
          <label className="font-medium">Search Radius:</label>
          <select value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="rounded border p-1">
            {radiusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button onClick={fetchNearby} className="rounded bg-blue-500 px-2 py-1 text-white">
            Near Me
          </button>
          <button onClick={() => setShowMap(true)} className="rounded bg-purple-600 px-2 py-1 text-white">
            Pick Location
          </button>
        </div>

        {/* Pagination */}
        <div className="relative bottom-6">
          <Pagination
            currentPage={currentPage}
            totalCount={totalIdeas}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            theme={theme}
          />
        </div>
      </div>
      {loading ? (
        <p className="text-center">Loading ideas...</p>
      ) : ideas.length === 0 ? (
        <p className="text-center">No ideas found.</p>
      ) : (
        <div className="max-h-[600px] space-y-6 overflow-y-auto px-2">
          {ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              // Add additional props if needed
            />
          ))}
        </div>
      )}
      <LeafletMapModal open={showMap} theme={theme} onPick={handleMapPick} onClose={() => setShowMap(false)} />
    </div>
  );
};

export default BrowseIdeas;
