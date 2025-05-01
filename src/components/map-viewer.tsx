"use client";

import { ProjectStatus } from "@prisma/client";
import L from "leaflet";
import { useEffect, useId, useRef } from "react";
import { renderToString } from "react-dom/server";
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

const MapViewer: React.FC<ProjectMapViewerProps> = ({ projects }) => {
  const containerId = useId(); // generates unique ID per component instance
  const mapRef = useRef<L.Map | null>(null);

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
      console.log("projectDetials: ", project);
      const popupContent = renderToString(
        <ProjectPopupContent
          title={project.title}
          latitude={project.latitude}
          longitude={project.longitude}
          progress={project.progress}
          categories={project.categories}
        />,
      );

      const icon = getMarkerIcon(project.status);

      L.marker([project.latitude, project.longitude], { icon }).addTo(map).bindPopup(popupContent);
    });

    return () => {
      map.remove();
    };
  }, [projects, containerId]);

  return <div id={containerId} className="relative z-10 h-full w-full" />;
};

export default MapViewer;
