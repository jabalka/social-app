"use client";

import { radiusOptions } from "@/constants";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { getPostcodeData } from "@/utils/postcode.utils";
import { motion } from "framer-motion";
import React, { useEffect, useMemo, useRef, useState } from "react";
import LeafletMapModal from "./leaflet-map-modal";
import GlowingGreenButton from "./shared/glowing-green-button";
import GlowingGreyButton from "./shared/glowing-grey-button";
import GlowingVioletButton from "./shared/glowing-violet-button";

type SortValue = string; // let parent define the exact union

export interface GeoSearchFiltersApplyPayload {
  sort?: SortValue;
  radius: number;
  coords: [number, number] | null;
  addressInfo?: {
    postcode?: string;
    addressLines?: string[];
    country?: string;
  } | null;
}

interface SortOption {
  value: SortValue;
  label: string;
}

interface Props {
  theme: string;
  enableSort?: boolean;
  sortValue?: SortValue;
  sortOptions?: SortOption[];
  radiusValue?: number;
  coords?: [number, number] | null;
  onApply: (values: GeoSearchFiltersApplyPayload) => void;
  onOpenChange?: (open: boolean) => void;
  applyLabel?: string;
  nearMeLabel?: string;
  pickOnMapLabel?: string;
  toggleLabelClosed?: string;
  toggleLabelOpen?: string;
}

const SearchFilterDropdown: React.FC<Props> = ({
  theme,
  enableSort = false,
  sortValue,
  sortOptions,
  radiusValue,
  coords = null,
  onApply,
  onOpenChange,
  applyLabel = "Search",
  nearMeLabel = "Near Me",
  pickOnMapLabel = "Pick on Map",
  toggleLabelClosed = "Search Filters",
  toggleLabelOpen = "Hide Filters",
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const [pendingSort, setPendingSort] = useState<SortValue | undefined>(sortValue);
  const [pendingRadius, setPendingRadius] = useState<number>(radiusValue ?? radiusOptions[0].value);
  const [pendingCoords, setPendingCoords] = useState<[number, number] | null>(coords ?? null);
  const [pendingAddressInfo, setPendingAddressInfo] = useState<{
    postcode?: string;
    addressLines?: string[];
    country?: string;
  } | null>(null);

  const normalizedSortOptions: SortOption[] = useMemo(() => {
    if (sortOptions && sortOptions.length) return sortOptions;
    return [
      { value: "newest", label: "Newest" },
      { value: "oldest", label: "Oldest" },
      { value: "likes", label: "Most Liked" },
      { value: "comments", label: "Most Commented" },
    ];
  }, [sortOptions]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (!rootRef.current) return;
      const target = e.target as Node | null;
      if (target && !rootRef.current.contains(target)) {
        setOpen(false);
        onOpenChange?.(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        onOpenChange?.(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [open, onOpenChange]);

  useEffect(() => {
    setPendingSort(sortValue);
  }, [sortValue]);

  useEffect(() => {
    setPendingRadius(radiusValue ?? radiusOptions[0].value);
  }, [radiusValue]);

  useEffect(() => {
    setPendingCoords(coords ?? null);
  }, [coords]);

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

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    onOpenChange?.(next);
  };

  const handleApply = () => {
    onApply({
      sort: enableSort ? pendingSort : undefined,
      radius: pendingRadius,
      coords: pendingCoords,
      addressInfo: pendingAddressInfo,
    });
    setOpen(false);
    onOpenChange?.(false);
  };

  const handleNearMe = () => {
    if (!navigator.geolocation) return alert("Location not supported");
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setPendingCoords([latitude, longitude]);
    });
  };

  const handleMapPick = (lat: number, lng: number) => {
    setShowMap(false);
    setPendingCoords([lat, lng]);
  };

  const resetAddress = () => {
    setPendingCoords(null);
    setPendingAddressInfo(null);
  };

  return (
    <div ref={rootRef} className="relative flex flex-col items-end">
      <div className="pt-2">
        <GlowingGreyButton theme={theme} className="h-8 p-2" onClick={toggleOpen}>
          {open ? toggleLabelOpen : toggleLabelClosed}
        </GlowingGreyButton>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute right-0 z-20 mx-auto mt-12 w-full max-w-xs overflow-hidden rounded-xl border border-zinc-300 bg-white p-4 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
          style={{ minWidth: 320 }}
        >
          <div className="flex w-full flex-col gap-4">
            {enableSort && (
              <div className="flex w-full flex-row items-center justify-between">
                <label className="text-sm">Sort By:</label>
                <select
                  value={pendingSort}
                  onChange={(e) => setPendingSort(e.target.value)}
                  className={cn("w-44 rounded-lg border px-2 py-1 text-sm", {
                    "border-zinc-700 bg-[#d0c4bf] text-zinc-700": theme === Theme.LIGHT,
                    "border-zinc-200 bg-[#5e5652] text-zinc-200": theme === Theme.DARK,
                  })}
                >
                  {normalizedSortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
              <button onClick={handleNearMe} className="whitespace-nowrap rounded bg-blue-500 px-2 py-1 text-white">
                {nearMeLabel}
              </button>
              <GlowingVioletButton onClick={() => setShowMap(true)} className="px-2 py-1">
                {pickOnMapLabel}
              </GlowingVioletButton>
              <GlowingGreenButton className="px-2 py-1" onClick={handleApply}>
                {applyLabel}
              </GlowingGreenButton>
            </div>

            {pendingCoords && pendingAddressInfo && (
              <div
                className={cn("relative mb-1 rounded border p-2 text-xs", {
                  "bg-[#574e4b]": theme === Theme.DARK,
                  "bg-[#f5e9e4]": theme === Theme.LIGHT,
                })}
              >
                <button
                  className="absolute right-2 top-0 text-lg text-red-400 hover:text-red-600"
                  onClick={resetAddress}
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
          </div>

          <LeafletMapModal
            open={showMap}
            theme={theme}
            onPick={handleMapPick}
            onClose={() => setShowMap(false)}
            defaultPosition={pendingCoords ?? undefined}
          />
        </motion.div>
      )}
    </div>
  );
};

export default SearchFilterDropdown;
