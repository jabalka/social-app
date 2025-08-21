"use client";

import { useSafeThemeContext } from "@/context/safe-theme-context";
import { Idea } from "@/models/idea.types";
import L from "leaflet";
import { useEffect, useId, useRef } from "react";
import IdeaPopupCard from "./idea-popup-card";
import { createRoot, Root } from "react-dom/client";

// Leaflet.markercluster plugin + CSS (ensure: npm i leaflet.markercluster @types/leaflet.markercluster)
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

export interface IdeaMapViewerProps {
  ideas: Idea[];
  refreshIdeas: () => void;
  selectedIdeaId?: string;
  // Allow clearing via undefined, and an explicit clear handler for map blank clicks
  onSelectIdea?: (id?: string) => void;
  onClearIdeaSelection?: () => void;
  selectable?: boolean;
  enablePopup?: boolean; // default true
}

type MarkerEntry = { marker: L.Marker };

const IDEA_ICON_URL = "/images/idea-bulb.png";

const ideaIcon = L.icon({
  iconUrl: IDEA_ICON_URL,
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -36],
});

// Dim level for non-selected markers
const NON_SELECTED_OPACITY = 0.6;

// Cluster icon: shows the idea bulb + count badge
const buildIdeaClusterIcon = (cluster: L.MarkerCluster): L.DivIcon => {
  const total = cluster.getAllChildMarkers().length;

  const countBadge = `
    <div style="
      position:absolute;right:-4px;bottom:-4px;
      min-width:22px;height:22px;padding:0 6px;
      display:flex;align-items:center;justify-content:center;
      background:#111827;color:#fff;border-radius:9999px;
      font-size:12px;font-weight:700;border:2px solid #fff;
      box-shadow:0 2px 5px rgba(0,0,0,0.3);
    ">${total}</div>
  `;

  const html = `
    <div style="
      position:relative;
      display:flex;align-items:center;justify-content:center;
      width:52px;height:52px;border-radius:50%;
      background:#fff;border:3px solid #0284C7; /* sky-600 */
      box-shadow:0 2px 8px rgba(0,0,0,0.25);
    ">
      <img src="${IDEA_ICON_URL}" alt="idea" style="width:32px;height:32px;object-fit:contain;" />
      ${countBadge}
    </div>
  `;

  return L.divIcon({
    className: "idea-cluster-icon",
    html,
    iconSize: [52, 52],
    iconAnchor: [26, 50],
    popupAnchor: [0, -40],
  });
};

const IdeaMapViewer: React.FC<IdeaMapViewerProps> = ({
  ideas,
  selectedIdeaId,
  onSelectIdea,
  onClearIdeaSelection,
  selectable = true,
  enablePopup = true,
}) => {
  const { theme } = useSafeThemeContext();
  const containerId = useId();
  const mapRef = useRef<L.Map | null>(null);
  const markerMapRef = useRef<Map<string, MarkerEntry>>(new Map());
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const highlightRef = useRef<L.CircleMarker | null>(null);
  const popupRootRef = useRef<Root | null>(null);

  // Refs for latest values to avoid stale closures
  const selectedIdRef = useRef<string | undefined>(selectedIdeaId);
  useEffect(() => {
    selectedIdRef.current = selectedIdeaId;
  }, [selectedIdeaId]);

  const onSelectIdeaRef = useRef<IdeaMapViewerProps["onSelectIdea"]>(onSelectIdea);
  useEffect(() => {
    onSelectIdeaRef.current = onSelectIdea;
  }, [onSelectIdea]);

  const onClearRef = useRef<IdeaMapViewerProps["onClearIdeaSelection"]>(onClearIdeaSelection);
  useEffect(() => {
    onClearRef.current = onClearIdeaSelection;
  }, [onClearIdeaSelection]);

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
    if (!enablePopup) return;
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

    // Clustering: combine overlapping ideas
    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: false,
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 18,
      iconCreateFunction: (cluster) => buildIdeaClusterIcon(cluster),
    });

    clusterGroup.on("clusterclick", (e) => {
      const bounds = e.layer.getBounds();
      if (map.getZoom() < map.getMaxZoom()) {
        map.fitBounds(bounds, { padding: [40, 40] });
      } else {
        e.layer.spiderfy();
      }
    });

    clusterGroup.addTo(map);
    clusterGroupRef.current = clusterGroup;

    // Clicking empty map area clears selection in parent (so list also clears)
    const handleMapClick = () => {
      if (!selectedIdRef.current) return;

      if (onClearRef.current) {
        onClearRef.current();
      } else if (onSelectIdeaRef.current) {
        onSelectIdeaRef.current(undefined); // fallback: clear via onSelect(undefined)
      }

      // Local visual cleanup
      markerMapRef.current.forEach(({ marker }) => {
        try {
          marker.setOpacity(1);
          marker.setZIndexOffset(0);
        } catch {}
      });
      if (highlightRef.current) {
        try {
          highlightRef.current.remove();
        } catch {}
        highlightRef.current = null;
      }
    };
    map.on("click", handleMapClick);

    const ro = new ResizeObserver(() => setTimeout(() => map.invalidateSize(), 0));
    ro.observe(container);

    return () => {
      try {
        ro.disconnect();
      } catch {}
      map.off("click", handleMapClick);

      // Remove markers from the cluster group
      markerMapRef.current.forEach(({ marker }) => {
        try {
          clusterGroupRef.current?.removeLayer(marker);
        } catch {}
      });
      markerMapRef.current.clear();

      if (highlightRef.current) {
        try {
          highlightRef.current.remove();
        } catch {}
      }
      highlightRef.current = null;

      // restore opacity/z-index
      markerMapRef.current.forEach(({ marker }) => {
        try {
          marker.setOpacity(1);
          marker.setZIndexOffset(0);
        } catch {}
      });

      closePopup();

      // Remove cluster group from the map
      if (clusterGroupRef.current && mapRef.current) {
        try {
          clusterGroupRef.current.removeFrom(mapRef.current);
        } catch {}
      }
      clusterGroupRef.current = null;

      // Remove the map
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {}
      }
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId]);

  // Sync markers
  useEffect(() => {
    const map = mapRef.current;
    const clusterGroup = clusterGroupRef.current;
    if (!map || !map.getPane("markerPane") || !clusterGroup) return;

    const markerMap = markerMapRef.current;
    const nextIds = new Set(ideas.map((i) => i.id));

    // Remove destroyed markers
    for (const [id, entry] of markerMap.entries()) {
      if (!nextIds.has(id)) {
        try {
          clusterGroup.removeLayer(entry.marker);
        } catch {}
        markerMap.delete(id);
      }
    }

    const hasSelectionHandler = typeof onSelectIdeaRef.current === "function";

    // Add/update markers
    ideas
      .filter((i) => typeof i.latitude === "number" && typeof i.longitude === "number")
      .forEach((idea) => {
        const existing = markerMap.get(idea.id);

        const handleClick = () => {
          // If not selectable or no selection handler, open popup (if enabled)
          if (!selectable || !hasSelectionHandler) {
            if (enablePopup) openPopupAt(idea, (markerMap.get(idea.id) as MarkerEntry).marker);
            return;
          }
          // Select-first behavior, using latest selected id
          if (selectedIdRef.current !== idea.id) {
            onSelectIdeaRef.current?.(idea.id);
          } else if (enablePopup) {
            openPopupAt(idea, (markerMap.get(idea.id) as MarkerEntry).marker);
          } else {
            // re-affirm selection if no popup
            onSelectIdeaRef.current?.(idea.id);
          }
        };

        if (!existing) {
          const marker = L.marker([idea.latitude as number, idea.longitude as number], { icon: ideaIcon });
          marker.on("click", handleClick);

          clusterGroup.addLayer(marker);
          markerMap.set(idea.id, { marker });
        } else {
          existing.marker.off("click");
          existing.marker.on("click", handleClick);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideas, selectable, enablePopup]);

  // Selection pan/highlight + zoomToShowLayer + dim non-selected
  useEffect(() => {
    const map = mapRef.current;
    const clusterGroup = clusterGroupRef.current;
    if (!map || !map.getPane("markerPane")) return;

    if (highlightRef.current) {
      try {
        highlightRef.current.remove();
      } catch {}
      highlightRef.current = null;
    }

    // Reset all marker opacities and z-index by default
    markerMapRef.current.forEach(({ marker }) => {
      try {
        marker.setOpacity(1);
        marker.setZIndexOffset(0);
      } catch {}
    });

    if (!selectedIdeaId) return;

    const entry = markerMapRef.current.get(selectedIdeaId);
    if (!entry) return;

    const showSelected = () => {
      const latlng = entry.marker.getLatLng();

      map.panTo(latlng, { animate: true });
      try {
        entry.marker.setZIndexOffset(1000);
      } catch {}

      markerMapRef.current.forEach((e, id) => {
        try {
          e.marker.setOpacity(id === selectedIdeaId ? 1 : NON_SELECTED_OPACITY);
        } catch {}
      });

      const circle = L.circleMarker(latlng, {
        radius: 12,
        color: "#0EA5E9",
        weight: 3,
        opacity: 0.9,
        fillColor: "#93C5FD",
        fillOpacity: 0.3,
      }).addTo(map);
      highlightRef.current = circle;
    };

    if (clusterGroup) {
      clusterGroup.zoomToShowLayer(entry.marker, showSelected);
    } else {
      showSelected();
    }
  }, [selectedIdeaId]);

  return (
    <div className="relative z-10 h-full w-full">
      <div id={containerId} className="h-full w-full" />
    </div>
  );
};

export default IdeaMapViewer;