"use client";

import { useSafeThemeContext } from "@/context/safe-theme-context";
import L from "leaflet";
import { useEffect, useId, useRef, useState } from "react";
import { Idea } from "@/models/idea.types";
import IdeaPopupCard from "./idea-popup-card";

export interface IdeaMapViewerProps {
  ideas: Idea[];
  refreshIdeas: () => void;
}

const ideaIcon = L.icon({
  iconUrl: "/images/idea-bulb.png", 
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -36],
});

const IdeaMapViewer: React.FC<IdeaMapViewerProps> = ({ ideas }) => {
  const { theme } = useSafeThemeContext();
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const containerId = useId();
  const mapRef = useRef<L.Map | null>(null);
  const markerRefs = useRef<L.Marker[]>([]);

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";
    const map = L.map(container).setView([51.505, -0.09], 6);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { zIndex: 10 }).addTo(map);

    markerRefs.current = [];

    ideas
      .filter((i) => typeof i.latitude === "number" && typeof i.longitude === "number")
      .forEach((idea) => {
        const marker = L.marker([idea.latitude as number, idea.longitude as number], { icon: ideaIcon }).addTo(map);
        marker.on("click", () => setSelectedIdea(idea));
        markerRefs.current.push(marker);
      });

    return () => {
      map.remove();
    };
  }, [ideas, containerId, theme]);

  return (
    <div className="relative z-10 h-full w-full">
      <div id={containerId} className="h-full w-full" />
      {selectedIdea && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <IdeaPopupCard idea={selectedIdea} onClose={() => setSelectedIdea(null)} theme={theme} />
        </div>
      )}
    </div>
  );
};

export default IdeaMapViewer;