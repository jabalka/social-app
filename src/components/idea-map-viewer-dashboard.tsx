"use client";

import { useSafeThemeContext } from "@/context/safe-theme-context";
import { Idea } from "@/models/idea.types";
import { useEffect, useId, useRef, useState } from "react";
import IdeaPopupCard from "./idea-popup-card";

// CSS is safe at module level
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet/dist/leaflet.css";

import { LeafletModule, loadLeafletWithMarkerCluster } from "@/utils/leaflet-loade";
import type * as L from "leaflet";

type MarkerEntry = { marker: L.Marker };

const IDEA_ICON_URL = "/images/idea-bulb.png";

const getIdeaIcon = (Lmod: LeafletModule): L.Icon =>
  Lmod.icon({
    iconUrl: IDEA_ICON_URL,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -36],
  });

const buildIdeaClusterIcon = (Lmod: LeafletModule, cluster: L.MarkerCluster): L.DivIcon => {
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
      background:#fff;border:3px solid #0284C7;
      box-shadow:0 2px 8px rgba(0,0,0,0.25);
    ">
      <img src="${IDEA_ICON_URL}" alt="idea" style="width:32px;height:32px;object-fit:contain;" />
      ${countBadge}
    </div>
  `;

  return Lmod.divIcon({
    className: "idea-cluster-icon",
    html,
    iconSize: [52, 52],
    iconAnchor: [26, 50],
    popupAnchor: [0, -40],
  });
};

interface IdeaMapViewerDashboardProps {
  ideas: Idea[];
  refreshIdeas: () => void;
}

const IdeaMapViewerDashboard: React.FC<IdeaMapViewerDashboardProps> = ({ ideas }) => {
  const containerId = useId();
  const mapRef = useRef<L.Map | null>(null);
  const groupRef = useRef<L.MarkerClusterGroup | L.LayerGroup | null>(null);
  const markerMapRef = useRef<Map<string, MarkerEntry>>(new Map());
  const { theme } = useSafeThemeContext();

  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);

  const LRef = useRef<LeafletModule | null>(null);
  const [leafletReady, setLeafletReady] = useState(false);
  const [hasCluster, setHasCluster] = useState(false);

  // Load Leaflet and plugin in browser only (shared loader, correct order)
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (typeof window === "undefined") return;
      const { L, hasCluster } = await loadLeafletWithMarkerCluster();
      if (!mounted) return;
      LRef.current = L;
      setHasCluster(hasCluster);
      setLeafletReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const Lmod = LRef.current;
    if (!leafletReady || !Lmod) return;

    const container = document.getElementById(containerId);
    if (!container || mapRef.current) return;

    const map = Lmod.map(container).setView([51.505, -0.09], 6);
    mapRef.current = map;

    Lmod.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { zIndex: 10 }).addTo(map);

    const group: L.MarkerClusterGroup | L.LayerGroup = hasCluster
      ? Lmod.markerClusterGroup({
          showCoverageOnHover: false,
          zoomToBoundsOnClick: false,
          maxClusterRadius: 60,
          spiderfyOnMaxZoom: true,
          disableClusteringAtZoom: 18,
          iconCreateFunction: (cluster) => buildIdeaClusterIcon(Lmod, cluster),
        })
      : Lmod.layerGroup();

    if (hasCluster) {
      (group as L.MarkerClusterGroup).on("clusterclick", (e) => {
        const bounds = e.layer.getBounds();
        if (map.getZoom() < map.getMaxZoom()) {
          map.fitBounds(bounds, { padding: [40, 40] });
        } else {
          e.layer.spiderfy();
        }
      });
    }

    group.addTo(map);
    groupRef.current = group;

    const ro = new ResizeObserver(() => setTimeout(() => map.invalidateSize(), 0));
    ro.observe(container);

    // snapshot
    const localMarkerMap = markerMapRef.current;
    const localGroup = groupRef.current;
    const localMap = mapRef.current;

    return () => {
      try {
        ro.disconnect();
      } catch {}

      localMarkerMap.forEach(({ marker }) => {
        try {
          localGroup?.removeLayer(marker);
        } catch {}
      });
      localMarkerMap.clear();

      if (localGroup && localMap) {
        try {
          (localGroup as L.LayerGroup).removeFrom(localMap);
        } catch {}
      }
      groupRef.current = null;

      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {}
      }
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId, leafletReady, hasCluster]);

  useEffect(() => {
    const Lmod = LRef.current;
    const map = mapRef.current;
    const group = groupRef.current;
    if (!leafletReady || !Lmod || !map || !map.getPane("markerPane") || !group) return;

    const markerMap = markerMapRef.current;
    const nextIds = new Set(ideas.map((i) => i.id));

    for (const [id, entry] of markerMap.entries()) {
      if (!nextIds.has(id)) {
        try {
          group.removeLayer(entry.marker);
        } catch {}
        markerMap.delete(id);
      }
    }

    const ideaIcon = getIdeaIcon(Lmod);

    ideas
      .filter((i) => typeof i.latitude === "number" && typeof i.longitude === "number")
      .forEach((idea) => {
        const existing = markerMap.get(idea.id);

        const handleClick = () => {
          setSelectedIdea(idea);
          try {
            const m = (markerMap.get(idea.id) as MarkerEntry).marker;
            map.panTo(m.getLatLng(), { animate: true });
          } catch {}
        };

        if (!existing) {
          const marker = Lmod.marker([idea.latitude as number, idea.longitude as number], { icon: ideaIcon });
          marker.on("click", handleClick);
          (group as L.LayerGroup).addLayer(marker);
          markerMap.set(idea.id, { marker });
        } else {
          existing.marker.off("click");
          existing.marker.on("click", handleClick);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideas, leafletReady, hasCluster]);

  return (
    <div className="relative z-10 h-full w-full">
      <div id={containerId} className="h-full w-full" />

      {selectedIdea && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg px-4">
            <div className="overflow-hidden rounded-xl shadow-2xl">
              <IdeaPopupCard idea={selectedIdea} onClose={() => setSelectedIdea(null)} theme={theme} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdeaMapViewerDashboard;
