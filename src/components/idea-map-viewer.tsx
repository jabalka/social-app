"use client";

import { useSafeThemeContext } from "@/context/safe-theme-context";
import { Idea } from "@/models/idea.types";
import L from "leaflet";
import { useEffect, useId, useRef } from "react";
import IdeaPopupCard from "./idea-popup-card";
import { createRoot, Root } from "react-dom/client";

export interface IdeaMapViewerProps {
  ideas: Idea[];
  refreshIdeas: () => void;
  selectedIdeaId?: string;
  onSelectIdea?: (id: string) => void;
  selectable?: boolean;

  // allow disabling popups (used by Profile > Lists map)
  enablePopup?: boolean; // default true
}

type MarkerEntry = { marker: L.Marker };

const ideaIcon = L.icon({
  iconUrl: "/images/idea-bulb.png",
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -36],
});

const IdeaMapViewer: React.FC<IdeaMapViewerProps> = ({
  ideas,
  selectedIdeaId,
  onSelectIdea,
  selectable = true,
  enablePopup = true,
}) => {
  const { theme } = useSafeThemeContext();
  const containerId = useId();
  const mapRef = useRef<L.Map | null>(null);
  const markerMapRef = useRef<Map<string, MarkerEntry>>(new Map());
  const highlightRef = useRef<L.CircleMarker | null>(null);

  // Popup management for React root
  const popupRootRef = useRef<Root | null>(null);

  const closePopup = () => {
    try {
      popupRootRef.current?.unmount();
    } catch {}
    popupRootRef.current = null;
    try {
      mapRef.current?.closePopup();
    } catch {}
  };

  const openPopupAt = (idea: Idea, marker: L.Marker) => {
    if (!enablePopup) return; // guard
    const map = mapRef.current;
    if (!map || !map.getPane("markerPane")) return;

    closePopup();

    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(<IdeaPopupCard idea={idea} onClose={closePopup} theme={theme} />);
    popupRootRef.current = root;

    marker.bindPopup(container, {
      autoPan: true,
      keepInView: true,
      closeButton: false,
      className: "react-leaflet-card-popup",
      autoClose: true,
      closeOnClick: true,
    });

    marker.on("popupclose", () => {
      try {
        root.unmount();
      } catch {}
      if (popupRootRef.current === root) popupRootRef.current = null;
    });

    marker.openPopup();
  };

  // Initialize map ONCE
  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container || mapRef.current) return;

    const map = L.map(container).setView([51.505, -0.09], 6);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { zIndex: 10 }).addTo(map);

    const ro = new ResizeObserver(() => setTimeout(() => map.invalidateSize(), 0));
    ro.observe(container);

    return () => {
      try {
        ro.disconnect();
      } catch {}

      markerMapRef.current.forEach(({ marker }) => {
        try {
          marker.remove();
        } catch {}
      });
      markerMapRef.current.clear();

      if (highlightRef.current) {
        try {
          highlightRef.current.remove();
        } catch {}
        highlightRef.current = null;
      }

      closePopup();

      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {}
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId]);

  // Sync markers without recreating map
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getPane("markerPane")) return;

    const markerMap = markerMapRef.current;
    const nextIds = new Set(ideas.map((i) => i.id));

    // Remove destroyed markers
    for (const [id, entry] of markerMap.entries()) {
      if (!nextIds.has(id)) {
        try {
          entry.marker.remove();
        } catch {}
        markerMap.delete(id);
      }
    }

    const hasSelectionHandler = typeof onSelectIdea === "function";

    // Add/update markers
    ideas
      .filter((i) => typeof i.latitude === "number" && typeof i.longitude === "number")
      .forEach((idea) => {
        const existing = markerMap.get(idea.id);

        const handleClick = () => {
          // If no selection wiring OR selectable is false -> open popup immediately
          if (!selectable || !hasSelectionHandler) {
            if (enablePopup) openPopupAt(idea, (markerMap.get(idea.id) as MarkerEntry).marker);
            return;
          }

          // Select-first behavior when selection wiring exists
          if (selectedIdeaId !== idea.id) {
            onSelectIdea?.(idea.id);
          } else {
            if (enablePopup) openPopupAt(idea, (markerMap.get(idea.id) as MarkerEntry).marker);
          }
        };

        if (!existing) {
          const marker = L.marker([idea.latitude as number, idea.longitude as number], { icon: ideaIcon }).addTo(map);
          marker.on("click", handleClick);
          markerMap.set(idea.id, { marker });
        } else {
          existing.marker.off("click");
          existing.marker.on("click", handleClick);
        }
      });
  }, [ideas, selectable, selectedIdeaId, onSelectIdea, enablePopup]);

  // Selection pan/highlight (no popup here)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getPane("markerPane")) return;

    if (highlightRef.current) {
      try {
        highlightRef.current.remove();
      } catch {}
      highlightRef.current = null;
    }

    if (!selectedIdeaId) return;

    const entry = markerMapRef.current.get(selectedIdeaId);
    if (!entry) return;

    const latlng = entry.marker.getLatLng();
    map.panTo(latlng, { animate: true });

    const circle = L.circleMarker(latlng, {
      radius: 12,
      color: "#0EA5E9",
      weight: 3,
      opacity: 0.9,
      fillColor: "#93C5FD",
      fillOpacity: 0.3,
    }).addTo(map);
    highlightRef.current = circle;
  }, [selectedIdeaId]);

  return (
    <div className="relative z-10 h-full w-full">
      <div id={containerId} className="h-full w-full" />
    </div>
  );
};

export default IdeaMapViewer;