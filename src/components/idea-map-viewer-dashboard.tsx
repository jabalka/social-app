"use client";

import { useSafeThemeContext } from "@/context/safe-theme-context";
import { Idea } from "@/models/idea.types";
import { useEffect, useId, useRef, useState } from "react";
import IdeaPopupCard from "./idea-popup-card";
import { loadLeafletWithMarkerCluster, type LeafletModule } from "@/utils/leaflet-loader";
import { isMarkerDisplayed, nearlySameView } from "@/utils/map-helpers";
import { openReactPopup } from "@/utils/leaflet-react-popup";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import type * as L from "leaflet";

type MarkerEntry = { marker: L.Marker };

const NON_SELECTED_OPACITY = 0.5;

const IDEA_ICON_URL = "/images/idea-bulb.png";

const buildIdeaIcon = (Lmod: LeafletModule) =>
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
  const highlightRef = useRef<L.CircleMarker | null>(null);

  const { theme } = useSafeThemeContext();

  const LRef = useRef<LeafletModule | null>(null);
  const [leafletReady, setLeafletReady] = useState(false);
  const [hasCluster, setHasCluster] = useState(false);

  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const selectedIdRef = useRef<string | undefined>(selectedId);
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

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

    const map = Lmod.map(container, {
      zoomAnimation: true,
      markerZoomAnimation: true,
      fadeAnimation: true,
      inertia: true,
      wheelDebounceTime: 30,
      wheelPxPerZoomLevel: 96,
    }).setView([51.505, -0.09], 6);
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
          map.flyToBounds(bounds, { padding: [40, 40], animate: true, duration: 0.45, easeLinearity: 0.25 });
        } else {
          e.layer.spiderfy();
        }
      });
    }

    group.addTo(map);
    groupRef.current = group;

    const handleMapClick = () => {
      if (!selectedIdRef.current) return;
      selectedIdRef.current = undefined;
      setSelectedId(undefined);
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
      try {
        map.closePopup();
      } catch {}
    };
    map.on("click", handleMapClick);

    const ro = new ResizeObserver(() => setTimeout(() => map.invalidateSize(), 0));
    ro.observe(container);

    return () => {
      try {
        ro.disconnect();
      } catch {}
      map.off("click", handleMapClick);

      markerMapRef.current.forEach(({ marker }) => {
        try {
          groupRef.current?.removeLayer(marker);
        } catch {}
      });
      markerMapRef.current.clear();

      if (highlightRef.current) {
        try {
          highlightRef.current.remove();
        } catch {}
      }
      highlightRef.current = null;

      if (groupRef.current && mapRef.current) {
        try {
          (groupRef.current as L.LayerGroup).removeFrom(mapRef.current);
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

    const icon = buildIdeaIcon(Lmod);
    ideas
      .filter((i) => typeof i.latitude === "number" && typeof i.longitude === "number")
      .forEach((idea) => {
        const existing = markerMap.get(idea.id);

        const handleClick = () => {
          if (selectedIdRef.current !== idea.id) {
            selectedIdRef.current = idea.id;
            setSelectedId(idea.id);
            return;
          }
          const m = (markerMap.get(idea.id) as MarkerEntry).marker;
          openReactPopup(
            Lmod,
            m,
            <IdeaPopupCard idea={idea} theme={theme} onClose={() => m.closePopup()} />,
            { offset: [0, -36] },
          );
        };

        if (!existing) {
          const marker = Lmod.marker([idea.latitude as number, idea.longitude as number], { icon });
          marker.on("click", handleClick);
          (group as L.LayerGroup).addLayer(marker);
          markerMap.set(idea.id, { marker });
        } else {
          existing.marker.off("click");
          existing.marker.on("click", handleClick);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideas, leafletReady, hasCluster, theme]);

  useEffect(() => {
    const Lmod = LRef.current;
    const map = mapRef.current;
    const group = groupRef.current;
    if (!Lmod || !map || !map.getPane("markerPane")) return;

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
    }
    highlightRef.current = null;

    if (!selectedId) return;
    const entry = markerMapRef.current.get(selectedId);
    if (!entry) return;

    const latlng = entry.marker.getLatLng();
    const targetZoom = Math.max(map.getZoom(), 14);

    const focus = () => {
      if (!nearlySameView(map, latlng, targetZoom)) {
        map.flyTo(latlng, targetZoom, { animate: true, duration: 0.45, easeLinearity: 0.25 });
      }
      try {
        entry.marker.setZIndexOffset(1000);
      } catch {}
      markerMapRef.current.forEach((e, id) => {
        try {
          e.marker.setOpacity(id === selectedId ? 1 : NON_SELECTED_OPACITY);
        } catch {}
      });

      const circle = Lmod.circleMarker(latlng, {
        radius: 12,
        color: "#0EA5E9",
        weight: 3,
        opacity: 0.9,
        fillColor: "#93C5FD",
        fillOpacity: 0.3,
        interactive: false,
      }).addTo(map);
      highlightRef.current = circle;
    };

    if (group && "zoomToShowLayer" in group && !isMarkerDisplayed(entry.marker)) {
      (group as L.MarkerClusterGroup).zoomToShowLayer(entry.marker, focus);
    } else {
      focus();
    }
  }, [selectedId]);

  return (
    <div className="relative z-10 h-full w-full">
      <div id={containerId} className="h-full w-full" />
    </div>
  );
};

export default IdeaMapViewerDashboard;