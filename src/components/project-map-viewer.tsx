"use client";

import { useSafeThemeContext } from "@/context/safe-theme-context";
// import { Theme } from "@/types/theme.enum";
import { ProjectStatus } from "@prisma/client";
import L from "leaflet";
import { useEffect, useId, useRef, useState } from "react";
import ProjectMapLegend from "./map-legend";
import ProjectPopupContent from "./map-viewer-project-pop-up";
import { ProjectMapViewerProps } from "./map-wrapper-viewer";
import { Project } from "@/models/project.types";

const getMarkerIcon = (status: ProjectStatus): L.Icon => {
  let iconUrl = "/images/project-proposed.png"; // Default: PROPOSED

  switch (status) {
    case "IN_PROGRESS":
      iconUrl = "/images/project-in-progress.png";
      break;
    case "COMPLETED":
      iconUrl = "/images/project-completed.png";
      break;
    case "REJECTED":
      iconUrl = "/images/marker-icon.png";
      break;
    case "PROPOSED":
    default:
      iconUrl = "/images/project-proposed.png";
      break;
  }

  return L.icon({
    iconUrl,
    iconSize: [60, 60],
    iconAnchor: [30, 60],
    popupAnchor: [0, -40],
  });
};

const ProjectMapViewer: React.FC<ProjectMapViewerProps> = ({
  user,
  projects,
  refreshProjects,
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const containerId = useId(); // generates unique ID per component instance
  const mapRef = useRef<L.Map | null>(null);
  const markerRefs = useRef<L.Marker[]>([]);
  const { theme } = useSafeThemeContext();

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    const map = L.map(container).setView([51.505, -0.09], 6);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      zIndex: 10,
    }).addTo(map);

    markerRefs.current = [];

    projects.forEach((project) => {
      const icon = getMarkerIcon(project.status);
      const marker = L.marker([project.latitude, project.longitude], { icon }).addTo(map);

      marker.on("click", () => {
        setSelectedProject(project);
      });

      markerRefs.current.push(marker);
    });

    return () => {
      map.remove();
    };
  }, [projects, containerId, user, refreshProjects, theme]);

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

export default ProjectMapViewer;