"use client";

import { useSafeThemeContext } from "@/context/safe-theme-context";
import { ProjectStatus } from "@prisma/client";
import { useEffect, useId, useRef, useState } from "react";
import ProjectMapLegend from "./map-legend";
import ProjectPopupContent from "./map-viewer-project-pop-up";
import type { ProjectMapViewerProps } from "./map-wrapper-viewer";
import { loadLeafletWithMarkerCluster, type LeafletModule } from "@/utils/leaflet-loader";
import { isMarkerDisplayed, nearlySameView } from "@/utils/map-helpers";
import { openReactPopup } from "@/utils/leaflet-react-popup";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import type * as L from "leaflet";

type MarkerEntry = { marker: L.Marker; status: ProjectStatus };
type ProjectMarker = L.Marker & { __projectStatus?: ProjectStatus };

export interface ProjectMapViewerDashboardProps extends ProjectMapViewerProps {
  showLegend?: boolean;
}

const STATUS_RING: Record<ProjectStatus, string> = {
  PROPOSED: "#6366F1",
  IN_PROGRESS: "#F59E0B",
  COMPLETED: "#10B981",
  REJECTED: "#EF4444",
};

const NON_SELECTED_OPACITY = 0.5;

const getProjectIconUrl = (status: ProjectStatus): string => {
  switch (status) {
    case "IN_PROGRESS":
      return "/images/project-in-progress.png";
    case "COMPLETED":
      return "/images/project-completed.png";
    case "REJECTED":
      return "/images/marker-icon.png";
    case "PROPOSED":
    default:
      return "/images/project-proposed.png";
  }
};

const buildMarkerIcon = (Lmod: LeafletModule, status: ProjectStatus): L.Icon =>
  Lmod.icon({
    iconUrl: getProjectIconUrl(status),
    iconSize: [60, 60],
    iconAnchor: [30, 60], // bottom center
    popupAnchor: [0, -40],
  });

const buildProjectClusterIcon = (Lmod: LeafletModule, cluster: L.MarkerCluster): L.DivIcon => {
  const markers = cluster.getAllChildMarkers();
  const statusCount = new Map<ProjectStatus, number>();
  const total = markers.length;

  markers.forEach((m) => {
    const mm = m as ProjectMarker;
    const s = mm.__projectStatus || "PROPOSED";
    statusCount.set(s, (statusCount.get(s) || 0) + 1);
  });

  let ring = "#6B7280";
  let best: { status: ProjectStatus | null; count: number } = { status: null, count: 0 };
  statusCount.forEach((c, s) => {
    if (c > best.count) best = { status: s, count: c };
  });
  if (best.status) ring = STATUS_RING[best.status] || ring;

  const statuses = Array.from(statusCount.keys());

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

  if (statuses.length <= 1) {
    const url = getProjectIconUrl(statuses[0] || "PROPOSED");
    const html = `
      <div style="
        position:relative;
        display:flex;align-items:center;justify-content:center;
        width:56px;height:56px;border-radius:50%;
        background:#fff;border:3px solid ${ring};
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
      ">
        <img src="${url}" alt="project" style="width:36px;height:36px;object-fit:contain;" />
        ${countBadge}
      </div>
    `;
    return Lmod.divIcon({
      className: "project-cluster-icon",
      html,
      iconSize: [56, 56],
      iconAnchor: [28, 54],
      popupAnchor: [0, -40],
    });
  }

  const distinct = statuses.slice(0, 4);
  const tiles = distinct
    .map(
      (s) => `<div style="display:flex;align-items:center;justify-content:center;background:#fff;border-radius:6px;border:2px solid ${ring};">
        <img src="${getProjectIconUrl(s)}" alt="${s}" style="width:20px;height:20px;object-fit:contain;" />
      </div>`,
    )
    .join("");

  const grid = `
    <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:2px;width:50px;height:50px;padding:2px;">
      ${tiles}
    </div>
  `;
  const html = `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:12px;background:transparent;box-shadow:0 2px 8px rgba(0,0,0,0.25);border:0;">
      ${grid}
      ${countBadge}
    </div>
  `;
  return Lmod.divIcon({
    className: "project-cluster-icon",
    html,
    iconSize: [56, 56],
    iconAnchor: [28, 54],
    popupAnchor: [0, -40],
  });
};

const ProjectMapViewerDashboard: React.FC<ProjectMapViewerDashboardProps> = ({
  user,
  projects,
  refreshProjects,
  showLegend = true,
}) => {
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
          maxClusterRadius: 60,
          spiderfyOnMaxZoom: true,
          iconCreateFunction: (cluster) => buildProjectClusterIcon(Lmod, cluster),
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
    const nextIds = new Set(projects.map((p) => p.id));
    for (const [id, entry] of markerMap.entries()) {
      if (!nextIds.has(id)) {
        try {
          group.removeLayer(entry.marker);
        } catch {}
        markerMap.delete(id);
      }
    }

    projects
      .filter((p) => typeof p.latitude === "number" && typeof p.longitude === "number")
      .forEach((project) => {
        const existing = markerMap.get(project.id);
        const icon = buildMarkerIcon(Lmod, project.status);

        const handleClick = () => {
          if (selectedIdRef.current !== project.id) {
            selectedIdRef.current = project.id;
            setSelectedId(project.id);
            return;
          }
          const m = (markerMap.get(project.id) as MarkerEntry).marker;
          openReactPopup(
            Lmod,
            m,
            <ProjectPopupContent
              user={user}
              project={project}
              refreshProjects={refreshProjects}
              theme={theme}
              onClose={() => m.closePopup()}
            />,
            { offset: [0, -40] },
          );
        };

        if (!existing) {
          const marker = Lmod.marker([project.latitude as number, project.longitude as number], { icon }) as ProjectMarker;
          marker.__projectStatus = project.status;
          marker.on("click", handleClick);
          (group as L.LayerGroup).addLayer(marker);
          markerMap.set(project.id, { marker, status: project.status });
        } else {
          const marker = existing.marker as ProjectMarker;
          marker.__projectStatus = project.status;
          if (existing.status !== project.status) {
            existing.marker.setIcon(icon);
            existing.status = project.status;
          }
          existing.marker.off("click");
          existing.marker.on("click", handleClick);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, leafletReady, hasCluster, user, theme, refreshProjects]);

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
        radius: 14,
        color: "#7C3AED",
        weight: 3,
        opacity: 0.9,
        fillColor: "#C4B5FD",
        fillOpacity: 0.3,
        interactive: false, // do not intercept clicks
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
      {showLegend && <ProjectMapLegend size="small" />}
    </div>
  );
};

export default ProjectMapViewerDashboard;