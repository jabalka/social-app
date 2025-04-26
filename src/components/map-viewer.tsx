"use client";

import { useEffect, useRef, useId } from "react";
import L from "leaflet";

interface Project {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
}

interface ViewerMapProps {
  projects: Project[];
}

const ProjectMap: React.FC<ViewerMapProps> = ({ projects }) => {
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

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    const icon = L.icon({
      iconUrl: "/images/marker-icon.png",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });

    projects.forEach((project) => {
      L.marker([project.latitude, project.longitude], { icon })
        .addTo(map)
        .bindPopup(project.title);
    });

    return () => {
      map.remove(); // FULLY remove map to avoid reusing container
    };
  }, [projects, containerId]);

  return <div id={containerId} className="h-full w-full" />;
};

export default ProjectMap;
