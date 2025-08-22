"use client";

import { useSafeThemeContext } from "@/context/safe-theme-context";
import { AuthUser } from "@/models/auth.types";
import { Project } from "@/models/project.types";
import { ProjectStatus } from "@prisma/client";
// import L from "leaflet";
import { useEffect, useId, useRef, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import ProjectMapLegend from "./map-legend";
import ProjectPopupContent from "./map-viewer-project-pop-up";

// Only CSS at module-level
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import type * as LeafletNS from "leaflet";

type LeafletModule = typeof import("leaflet");

export interface Props {
  user: AuthUser;
  projects: Project[];
  refreshProjects: () => void;
  selectedProjectId?: string;
  onSelectProject?: (id?: string) => void;
  onClearProjectSelection?: () => void;
  selectable?: boolean;
  enablePopup?: boolean;
}

type MarkerEntry = { marker: LeafletNS.Marker; status: ProjectStatus };

type ProjectMarker = LeafletNS.Marker & { __projectStatus?: ProjectStatus };

// Minimal markercluster types
interface MarkerCluster extends LeafletNS.Marker {
  getAllChildMarkers(): LeafletNS.Marker[];
  getBounds(): LeafletNS.LatLngBounds;
  spiderfy(): void;
}

type MarkerClusterGroup = LeafletNS.LayerGroup & {
  addLayer(layer: LeafletNS.Layer): MarkerClusterGroup;
  removeLayer(layer: LeafletNS.Layer): MarkerClusterGroup;
  on(type: "clusterclick", fn: (e: { layer: MarkerCluster }) => void): MarkerClusterGroup;
  addTo(map: LeafletNS.Map): MarkerClusterGroup;
  removeFrom(map: LeafletNS.Map): MarkerClusterGroup;
  zoomToShowLayer(layer: LeafletNS.Layer, cb?: () => void): void;
};

interface MarkerClusterGroupOptions {
  showCoverageOnHover?: boolean;
  maxClusterRadius?: number;
  spiderfyOnMaxZoom?: boolean;
  iconCreateFunction?: (cluster: MarkerCluster) => LeafletNS.DivIcon;
}

type LWithMarkerCluster = LeafletModule & {
  markerClusterGroup: (opts: MarkerClusterGroupOptions) => MarkerClusterGroup;
};

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

const getMarkerIcon = (L: LeafletModule, status: ProjectStatus): LeafletNS.Icon =>
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

const buildProjectClusterIcon = (L: LeafletModule, cluster: MarkerCluster): LeafletNS.DivIcon => {
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
    .map(
      (s) => `<div style="
        display:flex;align-items:center;justify-content:center;
        background:#fff;border-radius:6px;border:2px solid ${ring};
      ">
        <img src="${getProjectIconUrl(s)}" alt="${s}" style="width:20px;height:20px;object-fit:contain;" />
      </div>`,
    )
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

const NON_SELECTED_OPACITY = 0.5;

const ProjectMapViewer: React.FC<Props> = ({
  user,
  projects,
  refreshProjects,
  selectedProjectId,
  onSelectProject,
  onClearProjectSelection,
  selectable = true,
  enablePopup = true,
}) => {
  const containerId = useId();
  const mapRef = useRef<LeafletNS.Map | null>(null);
  const markerMapRef = useRef<Map<string, MarkerEntry>>(new Map());
  const highlightRef = useRef<LeafletNS.CircleMarker | null>(null);
  const clusterGroupRef = useRef<MarkerClusterGroup | null>(null);

  const popupRootRef = useRef<Root | null>(null);
  const { theme } = useSafeThemeContext();

  const LRef = useRef<LeafletModule | null>(null);
  const [leafletReady, setLeafletReady] = useState(false);
  const hasAutoFittedRef = useRef(false);

  // Refs with latest values to avoid stale closures in event handlers
  const selectedIdRef = useRef<string | undefined>(selectedProjectId);
  useEffect(() => {
    selectedIdRef.current = selectedProjectId;
  }, [selectedProjectId]);

  const onSelectProjectRef = useRef<Props["onSelectProject"]>(onSelectProject);
  useEffect(() => {
    onSelectProjectRef.current = onSelectProject;
  }, [onSelectProject]);

  const clearSelectionRef = useRef<Props["onClearProjectSelection"]>(onClearProjectSelection);
  useEffect(() => {
    clearSelectionRef.current = onClearProjectSelection;
  }, [onClearProjectSelection]);

  const closePopup = () => {
    try {
      popupRootRef.current?.unmount();
    } catch {}
    popupRootRef.current = null;
    try {
      mapRef.current?.closePopup();
    } catch {}
  };

  const openPopupAt = (project: Project, marker: LeafletNS.Marker) => {
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
      try {
        root.unmount();
      } catch {}
      if (popupRootRef.current === root) popupRootRef.current = null;
    });

    marker.openPopup();
  };

  // Load Leaflet + plugin on client only
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (typeof window === "undefined") return;
      try {
        const Lmod = (await import("leaflet")) as unknown as LeafletModule;
        (window as unknown as { L?: LeafletModule }).L = Lmod;
        await import("leaflet.markercluster");
        if (mounted) {
          LRef.current = Lmod;
          setLeafletReady(true);
        }
      } catch (e) {
        console.error("Failed to load Leaflet/markercluster for Projects", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Initialize map ONCE
  useEffect(() => {
    const L = LRef.current as LWithMarkerCluster | null;
    if (!leafletReady || !L) return;

    const container = document.getElementById(containerId);
    if (!container || mapRef.current) return;

    const map = L.map(container).setView([51.505, -0.09], 6);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { zIndex: 10 }).addTo(map);

    // Clustering
    const clusterGroup = (L as LWithMarkerCluster).markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      iconCreateFunction: (cluster) => buildProjectClusterIcon(L, cluster as MarkerCluster),
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

      if (clearSelectionRef.current) {
        clearSelectionRef.current();
      } else if (onSelectProjectRef.current) {
        onSelectProjectRef.current(undefined);
      }

      // Local visual cleanup (safe even if parent also clears)
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

    // Snapshot for cleanup
    const localMarkerMap = markerMapRef.current;
    const localClusterGroup = clusterGroupRef.current;
    const localMap = mapRef.current;

    return () => {
      try {
        ro.disconnect();
      } catch {}
      map.off("click", handleMapClick);

      localMarkerMap.forEach(({ marker }) => {
        try {
          localClusterGroup?.removeLayer(marker);
        } catch {}
      });
      localMarkerMap.clear();

      if (highlightRef.current) {
        try {
          highlightRef.current.remove();
        } catch {}
      }
      highlightRef.current = null;

      // restore any marker opacity/z-index (safety)
      localMarkerMap.forEach(({ marker }) => {
        try {
          marker.setOpacity(1);
          marker.setZIndexOffset(0);
        } catch {}
      });

      closePopup();

      if (localClusterGroup && localMap) {
        try {
          localClusterGroup.removeFrom(localMap);
        } catch {}
      }
      clusterGroupRef.current = null;

      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {}
      }
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId, leafletReady]);

  // Sync markers without recreating the map
  useEffect(() => {
    const L = LRef.current as LeafletModule | null;
    const map = mapRef.current;
    const clusterGroup = clusterGroupRef.current;
    if (!leafletReady || !L || !map || !map.getPane("markerPane") || !clusterGroup) return;

    const markerMap = markerMapRef.current;
    const nextIds = new Set(projects.map((p) => p.id));

    // Remove markers that no longer exist
    for (const [id, entry] of markerMap.entries()) {
      if (!nextIds.has(id)) {
        try {
          clusterGroup.removeLayer(entry.marker);
        } catch {}
        markerMap.delete(id);
      }
    }

    const hasSelectionHandler = typeof onSelectProjectRef.current === "function";

    // Add/update markers
    projects
      .filter((p) => typeof p.latitude === "number" && typeof p.longitude === "number")
      .forEach((project) => {
        const existing = markerMap.get(project.id);
        const icon = getMarkerIcon(L, project.status);

        const handleClick = () => {
          if (!selectable || !hasSelectionHandler) {
            if (enablePopup) openPopupAt(project, (markerMap.get(project.id) as MarkerEntry).marker);
            return;
          }

          if (selectedIdRef.current !== project.id) {
            onSelectProjectRef.current?.(project.id);
          } else {
            if (enablePopup) {
              openPopupAt(project, (markerMap.get(project.id) as MarkerEntry).marker);
            } else {
              onSelectProjectRef.current?.(project.id);
            }
          }
        };

        if (!existing) {
          const marker = (L as LeafletModule).marker([project.latitude as number, project.longitude as number], {
            icon,
          }) as ProjectMarker;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, selectable, enablePopup, leafletReady]);

  // Auto-fit to markers when there is no selection
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getPane("markerPane")) return;
    if (selectedProjectId) return; // selection effect handles view

    const markers = Array.from(markerMapRef.current.values()).map((e) => e.marker);
    if (markers.length === 0) return;

    if (markers.length === 1) {
      try {
        const ll = markers[0].getLatLng();
        map.setView(ll, Math.max(map.getZoom(), 13), { animate: true });
        hasAutoFittedRef.current = true;
      } catch {}
      return;
    }

    // Only auto-fit once initially or when new markers appear after none.
    if (hasAutoFittedRef.current && markers.length > 1) return;

    try {
      const bounds = markers.reduce((b, m) => b.extend(m.getLatLng()), markers[0].getLatLng().toBounds(100));
      map.fitBounds(bounds as unknown as LeafletNS.LatLngBoundsExpression, { padding: [40, 40] });
      hasAutoFittedRef.current = true;
    } catch {}
  }, [projects, selectedProjectId]);

  // Selection pan/highlight and zoom to show selected marker even if clustered
  useEffect(() => {
    const map = mapRef.current;
    const clusterGroup = clusterGroupRef.current;
    if (!map || !map.getPane("markerPane")) return;

    // Clear old highlight
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

    if (!selectedProjectId) return;

    const entry = markerMapRef.current.get(selectedProjectId);
    if (!entry) return;

    const showSelected = () => {
      const latlng = entry.marker.getLatLng();

      // Bring selection into view and emphasize it
      map.panTo(latlng, { animate: true });
      try {
        entry.marker.setZIndexOffset(1000);
      } catch {}

      // Dim non-selected markers (lighter dimming for visibility)
      markerMapRef.current.forEach((e, id) => {
        try {
          e.marker.setOpacity(id === selectedProjectId ? 1 : NON_SELECTED_OPACITY);
        } catch {}
      });

      // Add highlight ring
      const circle = (LRef.current as LeafletModule).circleMarker(latlng, {
        radius: 14,
        color: "#7C3AED",
        weight: 3,
        opacity: 0.9,
        fillColor: "#C4B5FD",
        fillOpacity: 0.3,
      }).addTo(map);
      highlightRef.current = circle as unknown as LeafletNS.CircleMarker;
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
