"use client";

import { useSafeThemeContext } from "@/context/safe-theme-context";
import { AuthUser } from "@/models/auth.types";
import { Project } from "@/models/project.types";
import { ProjectStatus } from "@prisma/client";
import L from "leaflet";
import { useEffect, useId, useRef } from "react";
import { createRoot, Root } from "react-dom/client";
import ProjectMapLegend from "./map-legend";
import ProjectPopupContent from "./map-viewer-project-pop-up";

// Leaflet.markercluster plugin + CSS
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

export interface Props {
  user: AuthUser;
  projects: Project[];
  refreshProjects: () => void;
  selectedProjectId?: string;
  onSelectProject?: (id: string) => void;
  selectable?: boolean;
  enablePopup?: boolean; // default true
}

type MarkerEntry = { marker: L.Marker; status: ProjectStatus };
type ProjectMarker = L.Marker & { __projectStatus?: ProjectStatus };

const getProjectIconUrl = (status: ProjectStatus): string => {
  switch (status) {
    case "IN_PROGRESS": return "/images/project-in-progress.png";
    case "COMPLETED": return "/images/project-completed.png";
    case "REJECTED": return "/images/marker-icon.png";
    case "PROPOSED":
    default: return "/images/project-proposed.png";
  }
};

const getMarkerIcon = (status: ProjectStatus): L.Icon =>
  L.icon({
    iconUrl: getProjectIconUrl(status),
    iconSize: [60, 60],
    iconAnchor: [30, 60],
    popupAnchor: [0, -40],
  });

const STATUS_RING: Record<ProjectStatus, string> = {
  PROPOSED: "#6366F1",
  IN_PROGRESS: "#F59E0B",
  COMPLETED: "#10B981",
  REJECTED: "#EF4444",
};

const buildProjectClusterIcon = (cluster: L.MarkerCluster): L.DivIcon => {
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
    return L.divIcon({
      className: "project-cluster-icon",
      html,
      iconSize: [56, 56],
      iconAnchor: [28, 54],
      popupAnchor: [0, -40],
    });
  }

  const distinct = statuses.slice(0, 4);
  const tiles = distinct
    .map((s) => `<div style="
        display:flex;align-items:center;justify-content:center;
        background:#fff;border-radius:6px;border:2px solid ${ring};
      ">
        <img src="${getProjectIconUrl(s)}" alt="${s}" style="width:20px;height:20px;object-fit:contain;" />
      </div>`)
    .join("");

  const grid = `
    <div style="
      display:grid;grid-template-columns:repeat(2, 1fr);
      gap:2px;width:50px;height:50px;padding:2px;
    ">
      ${tiles}
    </div>
  `;
  const html = `
    <div style="
      position:relative;display:flex;align-items:center;justify-content:center;
      width:56px;height:56px;border-radius:12px;
      background:transparent;box-shadow:0 2px 8px rgba(0,0,0,0.25);
      border:0;
    ">
      ${grid}
      ${countBadge}
    </div>
  `;
  return L.divIcon({
    className: "project-cluster-icon",
    html,
    iconSize: [56, 56],
    iconAnchor: [28, 54],
    popupAnchor: [0, -40],
  });
};

const ProjectMapViewer: React.FC<Props> = ({
  user,
  projects,
  refreshProjects,
  selectedProjectId,
  onSelectProject,
  selectable = true,
  enablePopup = true,
}) => {
  const containerId = useId();
  const mapRef = useRef<L.Map | null>(null);
  const markerMapRef = useRef<Map<string, MarkerEntry>>(new Map());
  const highlightRef = useRef<L.CircleMarker | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  const popupRootRef = useRef<Root | null>(null);
  const { theme } = useSafeThemeContext();

  const closePopup = () => {
    try { popupRootRef.current?.unmount(); } catch {}
    popupRootRef.current = null;
    try { mapRef.current?.closePopup(); } catch {}
  };

  const openPopupAt = (project: Project, marker: L.Marker) => {
    if (!enablePopup) return;
    const map = mapRef.current;
    if (!map || !map.getPane("markerPane")) return;

    closePopup();

    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(
      <ProjectPopupContent
        user={user}
        project={project}
        refreshProjects={refreshProjects}
        theme={theme}
        onClose={closePopup}
      />,
    );
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
      try { root.unmount(); } catch {}
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

    // Clustering
    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      iconCreateFunction: (cluster) => buildProjectClusterIcon(cluster),
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

    const ro = new ResizeObserver(() => setTimeout(() => map.invalidateSize(), 0));
    ro.observe(container);

    return () => {
      try { ro.disconnect(); } catch {}

      markerMapRef.current.forEach(({ marker }) => {
        try { clusterGroupRef.current?.removeLayer(marker); } catch {}
      });
      markerMapRef.current.clear();

      if (highlightRef.current) {
        try { highlightRef.current.remove(); } catch {}
      }
      highlightRef.current = null;

      // restore any marker opacity (safety)
      markerMapRef.current.forEach(({ marker }) => { try { marker.setOpacity(1); } catch {} });

      closePopup();

      if (clusterGroupRef.current && mapRef.current) {
        try { clusterGroupRef.current.removeFrom(mapRef.current); } catch {}
      }
      clusterGroupRef.current = null;

      if (mapRef.current) {
        try { mapRef.current.remove(); } catch {}
      }
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId]);

  // Sync markers without recreating the map
  useEffect(() => {
    const map = mapRef.current;
    const clusterGroup = clusterGroupRef.current;
    if (!map || !map.getPane("markerPane") || !clusterGroup) return;

    const markerMap = markerMapRef.current;
    const nextIds = new Set(projects.map((p) => p.id));

    // Remove markers that no longer exist
    for (const [id, entry] of markerMap.entries()) {
      if (!nextIds.has(id)) {
        try { clusterGroup.removeLayer(entry.marker); } catch {}
        markerMap.delete(id);
      }
    }

    const hasSelectionHandler = typeof onSelectProject === "function";

    // Add/update markers
    projects
      .filter((p) => typeof p.latitude === "number" && typeof p.longitude === "number")
      .forEach((project) => {
        const existing = markerMap.get(project.id);
        const icon = getMarkerIcon(project.status);

        const handleClick = () => {
          if (!selectable || !hasSelectionHandler) {
            if (enablePopup) openPopupAt(project, (markerMap.get(project.id) as MarkerEntry).marker);
            return;
          }
          if (selectedProjectId !== project.id) onSelectProject?.(project.id);
          else if (enablePopup) openPopupAt(project, (markerMap.get(project.id) as MarkerEntry).marker);
        };

        if (!existing) {
          const marker = L.marker([project.latitude as number, project.longitude as number], { icon }) as ProjectMarker;
          marker.__projectStatus = project.status;
          marker.on("click", handleClick);

          clusterGroup.addLayer(marker);
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
  }, [projects, selectable, selectedProjectId, onSelectProject, enablePopup]);

  // Selection pan/highlight and zoom to show selected marker even if clustered
  useEffect(() => {
    const map = mapRef.current;
    const clusterGroup = clusterGroupRef.current;
    if (!map || !map.getPane("markerPane")) return;

    // Clear old highlight
    if (highlightRef.current) {
      try { highlightRef.current.remove(); } catch {}
      highlightRef.current = null;
    }

    // Reset all marker opacities by default
    markerMapRef.current.forEach(({ marker }) => {
      try { marker.setOpacity(1); } catch {}
    });

    if (!selectedProjectId) return;

    const entry = markerMapRef.current.get(selectedProjectId);
    if (!entry) return;

    const showSelected = () => {
      const latlng = entry.marker.getLatLng();

      // Bring selection into view and emphasize it
      map.panTo(latlng, { animate: true });
      try { entry.marker.setZIndexOffset(1000); } catch {}

      // Dim non-selected markers
      markerMapRef.current.forEach((e, id) => {
        try { e.marker.setOpacity(id === selectedProjectId ? 1 : 0.35); } catch {}
      });

      // Add highlight ring
      const circle = L.circleMarker(latlng, {
        radius: 14,
        color: "#7C3AED",
        weight: 3,
        opacity: 0.9,
        fillColor: "#C4B5FD",
        fillOpacity: 0.3,
      }).addTo(map);
      highlightRef.current = circle;
    };

    // If clustered, zoom in until this marker is shown, then run showSelected
    if (clusterGroup) {
      clusterGroup.zoomToShowLayer(entry.marker, showSelected);
    } else {
      showSelected();
    }
  }, [selectedProjectId]);

  return (
    <div className="relative z-10 h-full w-full">
      <div id={containerId} className="h-full w-full" />
      <ProjectMapLegend size="small" />
    </div>
  );
};

export default ProjectMapViewer;