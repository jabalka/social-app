"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import ProjectDetailsDialog from "@/components/project-details";
import { useProjectContext } from "./project-context";
import { useSafeThemeContext } from "./safe-theme-context";
import { useSafeUser } from "./user-context";

interface ProjectModalContextType {
  openProjectModal: (projectId: string) => void;
  closeProjectModal: () => void;
}

const ProjectModalContext = createContext<ProjectModalContextType>({
  openProjectModal: () => {},
  closeProjectModal: () => {},
});

export const useProjectModal = () => useContext(ProjectModalContext);

export const ProjectModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const { projects, refreshProjects } = useProjectContext();
  const {user} = useSafeUser()
  const {theme} = useSafeThemeContext();

  const openProjectModal = useCallback((id: string) => {
    setProjectId(id);
    setOpen(true);
  }, []);

  const closeProjectModal = useCallback(() => {
    setOpen(false);
    setProjectId(null);
  }, []);

  const project = projects.find((p) => p.id === projectId);

  return (
    <ProjectModalContext.Provider value={{ openProjectModal, closeProjectModal }}>
      {children}
      {project && user && (
        <ProjectDetailsDialog
          user={user}
          project={project}
          open={open}
          onClose={closeProjectModal}
          refreshProjects={refreshProjects}
          theme={theme}
        />
      )}
    </ProjectModalContext.Provider>
  );
};