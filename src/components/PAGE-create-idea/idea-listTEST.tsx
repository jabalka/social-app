// components/PAGE-create-idea/idea-list.tsx
"use client";
import { radiusOptions } from "@/constants";
import { Idea } from "@/models/idea.types";
import { useEffect, useState } from "react";
import LeafletMapModal from "../leaflet-map-modal";
import IdeaCard from "./idea-card";

export interface IdeaListProps {
  open?: boolean;
  onClose?: () => void;
  onIdeaSelected?: (idea: Idea) => void;
}

type SortType = "newest" | "oldest" | "top";

const IdeaListTEST: React.FC<IdeaListProps> = ({ open = true, onClose, onIdeaSelected }) => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [sort, setSort] = useState<SortType>("newest");
  const [radius, setRadius] = useState(5000);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/ideas")
      .then((res) => res.json())
      .then((data) => setIdeas(data.data || []))
      .finally(() => setLoading(false));
  }, [open]);

  // Search nearby using geolocation
  const fetchNearby = () => {
    if (!navigator.geolocation) return alert("Location not supported");
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setLoading(true);
      fetch(`/api/ideas?near=${latitude},${longitude}&radius=${radius}`)
        .then((res) => res.json())
        .then((data) => setIdeas(data.data || []))
        .finally(() => setLoading(false));
    });
  };

  const handleMapPick = (lat: number, lng: number) => {
    setShowMap(false);
    setLoading(true);
    fetch(`/api/ideas?near=${lat},${lng}&radius=${radius}`)
      .then((res) => res.json())
      .then((data) => setIdeas(data.data || []))
      .finally(() => setLoading(false));
  };

  const sortedIdeas = [...ideas].sort((a, b) => {
    if (sort === "top") return b.likes.length - a.likes.length;
    if (sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (!open) return null;

  return (
    <>
      <div className="relative">
        <div className="mb-2 flex items-center gap-2">
          <label className="font-medium">Search Radius:</label>
          <select value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="rounded border p-1">
            {radiusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-600">(miles)</span>
          <button onClick={fetchNearby} className="rounded bg-blue-500 px-2 py-1 text-white">
            Near Me
          </button>
          <button onClick={() => setShowMap(true)} className="rounded bg-purple-600 px-2 py-1 text-white">
            Pick Location
          </button>
        </div>
        <div className="mb-4 flex items-center gap-2">
          <label className="font-medium">Sort:</label>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortType)} className="rounded border p-1">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="top">Top Rated</option>
          </select>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="ml-auto rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
            >
              Close
            </button>
          )}
        </div>
        {loading ? (
          <div className="py-6 text-center text-gray-400">Loading ideas...</div>
        ) : (
          <div className="space-y-6">
            {sortedIdeas.length === 0 ? (
              <div className="text-center text-gray-400">No ideas found.</div>
            ) : (
              sortedIdeas.map((idea) => (
                <div key={idea.id} onClick={() => onIdeaSelected?.(idea)}>
                  <IdeaCard idea={idea} />
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <LeafletMapModal open={showMap} onPick={handleMapPick} onClose={() => setShowMap(false)} />
    </>
  );
};

export default IdeaListTEST;
