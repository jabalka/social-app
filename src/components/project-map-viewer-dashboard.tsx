"use client";

import { useSafeThemeContext } from "@/context/safe-theme-context";
import { Project } from "@/models/project.types";
import { ProjectStatus } from "@prisma/client";
import L from "leaflet";
import { useEffect, useId, useRef, useState } from "react";
import ProjectMapLegend from "./map-legend";
import ProjectPopupContent from "./map-viewer-project-pop-up";
import type { ProjectMapViewerProps } from "./map-wrapper-viewer";

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

const ProjectMapViewerDashboard: React.FC<ProjectMapViewerProps> = ({
  user,
  projects,
  refreshProjects,
}) => {
  const containerId = useId();
  const mapRef = useRef<L.Map | null>(null);
  const markerMapRef = useRef<Map<string, MarkerEntry>>(new Map());
  const { theme } = useSafeThemeContext();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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

      if (mapRef.current) { try { mapRef.current.remove(); } catch {} mapRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId]);

  useEffect(() => {
    const map = mapRef.current as L.Map | null;
    if (!map || !map.getPane("markerPane")) return;

    const markerMap = markerMapRef.current;
    const nextIds = new Set(projects.map((p) => p.id));

    for (const [id, entry] of markerMap.entries()) {
      if (!nextIds.has(id)) {
        try { entry.marker.remove(); } catch {}
        markerMap.delete(id);
      }
    }

    // Add/update markers
    projects
      .filter((p) => typeof p.latitude === "number" && typeof p.longitude === "number")
      .forEach((project) => {
        const existing = markerMap.get(project.id);
        const icon = getMarkerIcon(project.status);

        const handleClick = () => {
          setSelectedProject(project); // open or update modal
          try {
            const m = (markerMap.get(project.id) as MarkerEntry).marker;
            map.panTo(m.getLatLng(), { animate: true });
          } catch {}
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
  }, [projects]);

  return (
    <div className="relative z-10 h-full w-full">
      <div id={containerId} className="h-full w-full" />
      <ProjectMapLegend />

      {selectedProject && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <ProjectPopupContent
            user={user}
            project={selectedProject}
            refreshProjects={refreshProjects}
            theme={theme}
            onClose={() => setSelectedProject(null)}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectMapViewerDashboard;