"use client";

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

const MapViewer: React.FC<ProjectMapViewerProps> = ({ user, projects }) => {
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
      const icon = getMarkerIcon(project.status);
      const popupContainer = document.createElement("div");
      ReactDOM.createRoot(popupContainer).render(
        <ProjectPopupContent
          user={user}
          id={project.id}
          title={project.title}
          images={project.images}
          latitude={project.latitude}
          longitude={project.longitude}
          progress={project.progress}
          categories={project.categories}
          likes={project.likes}
          comments={project.comments}
        />,
      );

      L.marker([project.latitude, project.longitude], { icon }).addTo(map).bindPopup(popupContainer);
    });

    return () => {
      map.remove();
    };
  }, [projects, containerId, user]);

  return (
    <div className="relative z-10 h-full w-full">
      <div id={containerId} className="h-full w-full" />
      <ProjectMapLegend />
    </div>
  );
};

export default MapViewer;
