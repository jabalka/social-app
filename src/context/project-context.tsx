"use client";

import { Project } from "@/components/map-wrapper-viewer";
import { createContext, useCallback, useContext, useState } from "react";

interface ProjectContextType {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error("useProjectContext must be used within ProjectProvider");
  return context;
};

export const ProjectProvider: React.FC<{ initialProjects: Project[]; children: React.ReactNode }> = ({
  initialProjects,
  children,
}) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  const refreshProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error("Failed to refresh projects:", err);
    }
  }, []);

  return (
    <ProjectContext.Provider value={{ projects, setProjects, refreshProjects }}>{children}</ProjectContext.Provider>
  );
};
