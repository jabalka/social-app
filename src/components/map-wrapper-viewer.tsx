"use client";

import { AuthUser } from "@/models/auth";
import { ProjectStatus } from "@prisma/client";
import { useEffect, useState } from "react";

export interface Project {
  id: string;
  title: string;
  description: string;
  postcode: string;
  latitude: number;
  longitude: number;
  progress: number;
  status: ProjectStatus;
  progressNotes: string | null;
  author: {
    id: string;
    name: string | null;
    email: string | null;
    username: string | null;
    image: string | null;
  };
  comments: {
    id: string;
    content: string;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  likes: {
    id: string;
    userId: string;
    createdAt: Date;
  }[];
  images: {
    id: string;
    url: string;
    projectId: string;
    createdAt: Date;
  }[];
  categories: {
    id: string;
    name: string;
    icon: string;
  }[];
}

export interface ProjectMapViewerProps {
  user: AuthUser;
  projects: Project[];
  refreshProjects(): void;
}

const MapViewerWrapper: React.FC<ProjectMapViewerProps> = ({
  user,
  projects,
  refreshProjects,
}) => {
  const [MapComponent, setMapComponent] = useState<React.ComponentType<ProjectMapViewerProps> | null>(null);

  useEffect(() => {
    import("./map-viewer").then((mod) => {
      setMapComponent(() => mod.default);
    });
  }, []);

  if (!MapComponent) {
    return <div className="flex h-full w-full items-center justify-center bg-gray-100">Loading map...</div>;
  }

  return (
    <MapComponent
      user={user}
      projects={projects}
      refreshProjects={refreshProjects}
    />
  );
};

export default MapViewerWrapper;
