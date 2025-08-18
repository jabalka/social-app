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

export interface Props {
  user: AuthUser;
  projects: Project[];
  refreshProjects: () => void;
  selectedProjectId?: string;
  onSelectProject?: (id: string) => void;
  selectable?: boolean;
  // enable or disable anchored popups
  enablePopup?: boolean; // default true
}

type MarkerEntry = { marker: L.Marker; status: ProjectStatus };

const getMarkerIcon = (status: ProjectStatus): L.Icon => {
  let iconUrl = "/images/project-proposed.png";
  switch (status) {
    case "IN_PROGRESS": iconUrl = "/images/project-in-progress.png"; break;
    case "COMPLETED": iconUrl = "/images/project-completed.png"; break;
    case "REJECTED": iconUrl = "/images/marker-icon.png"; break;
    case "PROPOSED":
    default: iconUrl = "/images/project-proposed.png"; break;
  }
  return L.icon({
    iconUrl,
    iconSize: [60, 60],
    iconAnchor: [30, 60],
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

  // Popup management for React root
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
      />
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

    const ro = new ResizeObserver(() => setTimeout(() => map.invalidateSize(), 0));
    ro.observe(container);

    return () => {
      try { ro.disconnect(); } catch {}

      markerMapRef.current.forEach(({ marker }) => { try { marker.remove(); } catch {} });
      markerMapRef.current.clear();

      if (highlightRef.current) { try { highlightRef.current.remove(); } catch {} highlightRef.current = null; }

      closePopup();

      if (mapRef.current) { try { mapRef.current.remove(); } catch {} mapRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId]);

  // Sync markers without recreating the map
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getPane("markerPane")) return;

    const markerMap = markerMapRef.current;
    const nextIds = new Set(projects.map((p) => p.id));

    // Remove markers that no longer exist
    for (const [id, entry] of markerMap.entries()) {
      if (!nextIds.has(id)) {
        try { entry.marker.remove(); } catch {}
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
          // If no selection wiring OR selectable is false -> open popup immediately
          if (!selectable || !hasSelectionHandler) {
            if (enablePopup) openPopupAt(project, (markerMap.get(project.id) as MarkerEntry).marker);
            return;
          }
          // Select-first behavior when selection wiring exists
          if (selectedProjectId !== project.id) {
            onSelectProject?.(project.id);
          } else {
            if (enablePopup) openPopupAt(project, (markerMap.get(project.id) as MarkerEntry).marker);
          }
        };

        if (!existing) {
          const marker = L.marker([project.latitude as number, project.longitude as number], { icon }).addTo(map);
          marker.on("click", handleClick);
          markerMap.set(project.id, { marker, status: project.status });
        } else {
          if (existing.status !== project.status) {
            existing.marker.setIcon(icon);
            existing.status = project.status;
          }
          existing.marker.off("click");
          existing.marker.on("click", handleClick);
        }
      });
  }, [projects, selectable, selectedProjectId, onSelectProject, enablePopup]);

  // Selection pan/highlight (no popup here)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getPane("markerPane")) return;

    if (highlightRef.current) {
      try { highlightRef.current.remove(); } catch {}
      highlightRef.current = null;
    }

    if (!selectedProjectId) return;

    const entry = markerMapRef.current.get(selectedProjectId);
    if (!entry) return;

    const latlng = entry.marker.getLatLng();
    map.panTo(latlng, { animate: true });

    const circle = L.circleMarker(latlng, {
      radius: 14,
      color: "#7C3AED",
      weight: 3,
      opacity: 0.9,
      fillColor: "#C4B5FD",
      fillOpacity: 0.3,
    }).addTo(map);
    highlightRef.current = circle;
  }, [selectedProjectId]);

  return (
    <div className="relative z-10 h-full w-full">
      <div id={containerId} className="h-full w-full" />
      <ProjectMapLegend />
    </div>
  );
};

export default ProjectMapViewer;