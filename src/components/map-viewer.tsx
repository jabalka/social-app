"use client";

import { useSafeThemeContext } from "@/context/safe-theme-context";
import { Theme } from "@/types/theme.enum";
import { ProjectStatus } from "@prisma/client";
import L from "leaflet";
import { useEffect, useId, useRef } from "react";
import ReactDOM from "react-dom/client";
import ProjectMapLegend from "./map-legend";
import ProjectPopupContent from "./map-viewer-project-pop-up";
import { ProjectMapViewerProps } from "./map-wrapper-viewer";

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

const MapViewer: React.FC<ProjectMapViewerProps> = ({ user, projects, refreshProjects }) => {
  const containerId = useId(); // generates unique ID per component instance
  const mapRef = useRef<L.Map | null>(null);
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

    // const icon = L.icon({
    //   iconUrl: "/images/marker-icon.png",
    //   iconSize: [60, 60],
    //   iconAnchor: [30, 60],
    // });

    projects.forEach((project) => {
      const icon = getMarkerIcon(project.status);
      const popupContainer = document.createElement("div");
      ReactDOM.createRoot(popupContainer).render(
        <ProjectPopupContent user={user} project={project} refreshProjects={refreshProjects} theme={theme} />,
      );

      const marker = L.marker([project.latitude, project.longitude], { icon }).addTo(map).bindPopup(popupContainer);

      marker.on("popupopen", (e) => {
        const popupEl = e.popup.getElement(); // this is .leaflet-popup
        if (popupEl) {
          // set the pop-up tip to theme colour
          popupEl.style.setProperty("--popup-bg", theme === Theme.LIGHT ? "#f0e3dd" : "#332f2d");
        }
      });
    });

    return () => {
      map.remove();
    };
  }, [projects, containerId, user, refreshProjects, theme]);

  return (
    <div className="relative z-10 h-full w-full">
      <div id={containerId} className="h-full w-full" />
      <ProjectMapLegend />
    </div>
  );
};

export default MapViewer;
