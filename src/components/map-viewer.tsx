"use client";

import { useEffect, useRef, useId } from "react";
import { renderToString } from "react-dom/server";
import L from "leaflet";
import ProjectPopupContent from "./map-viewer-project-pop-up";

interface Project {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
}

interface ViewerMapProps {
  projects: Project[];
}

const MapViewer: React.FC<ViewerMapProps> = ({ projects }) => {
  const containerId = useId(); // generates unique ID per component instance
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Ensure the container is empty
    container.innerHTML = "";

    // Initialize map
    const map = L.map(container).setView([51.505, -0.09], 6);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        zIndex: 10, 
      }).addTo(map);

    const icon = L.icon({
      iconUrl: "/images/marker-icon.png",
      iconSize: [60, 60],
      iconAnchor: [30, 60],
    });

    projects.forEach((project) => {
        const popupContent = renderToString(
          <ProjectPopupContent
            title={project.title}
            latitude={project.latitude}
            longitude={project.longitude}
          />
        );
      
        L.marker([project.latitude, project.longitude], { icon })
          .addTo(map)
          .bindPopup(popupContent);
      });

    return () => {
      map.remove(); // FULLY remove map to avoid reusing container
    };
  }, [projects, containerId]);

  return <div id={containerId} className="relative z-10 h-full w-full" />;
};

export default MapViewer;
