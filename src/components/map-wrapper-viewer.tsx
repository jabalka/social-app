"use client";

import { useEffect, useState } from "react";

interface Project {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
}

interface ProjectMapViewerProps {
  projects: Project[];
}

const MapViewerWrapper: React.FC<ProjectMapViewerProps> = ({ projects }) => {
  const [MapComponent, setMapComponent] = useState<React.ComponentType<ProjectMapViewerProps> | null>(null);

  useEffect(() => {
    import("./map-viewer").then((mod) => {
      setMapComponent(() => mod.default);
    });
  }, []);

  if (!MapComponent) {
    return <div className="flex h-full w-full items-center justify-center bg-gray-100">Loading map...</div>;
  }

  return <MapComponent projects={projects} />;
};

export default MapViewerWrapper;
