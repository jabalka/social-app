"use client";

import { AuthUser } from "@/models/auth";
import { Project } from "@/models/project";
import { useEffect, useState } from "react";

export interface ProjectMapViewerProps {
  user: AuthUser;
  projects: Project[];
  refreshProjects(): void;
}

const MapViewerWrapper: React.FC<ProjectMapViewerProps> = ({ user, projects, refreshProjects }) => {
  const [MapComponent, setMapComponent] = useState<React.ComponentType<ProjectMapViewerProps> | null>(null);

  useEffect(() => {
    import("./map-viewer").then((mod) => {
      setMapComponent(() => mod.default);
    });
  }, []);

  if (!MapComponent) {
    return <div className="flex h-full w-full items-center justify-center bg-gray-100">Loading map...</div>;
  }

  return <MapComponent user={user} projects={projects} refreshProjects={refreshProjects} />;
};

export default MapViewerWrapper;
