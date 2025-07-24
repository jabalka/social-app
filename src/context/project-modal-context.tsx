"use client";
import ProjectDetailsDialog from "@/components/project-details";
import { Project } from "@/models/project.types";
import React, { createContext, useCallback, useContext, useState } from "react";
import { useProjectContext } from "./project-context";
import { useSafeThemeContext } from "./safe-theme-context";
import { useSafeUser } from "./user-context";
import LoaderModal from "@/components/common/loader-modal";

interface ProjectModalContextType {
  openProjectModal: (projectId: string) => Promise<void>;
  closeProjectModal: () => void;
  loading: boolean;
}

const ProjectModalContext = createContext<ProjectModalContextType>({
  openProjectModal: async () => {},
  closeProjectModal: () => {},
  loading: false,
});

export const useProjectModal = () => useContext(ProjectModalContext);

export const ProjectModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const { projects, setProjects } = useProjectContext();
  const { user } = useSafeUser();
  const { theme } = useSafeThemeContext();
  const [fetchedProject, setFetchedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);

  const openProjectModal = useCallback(
    async (id: string) => {
      setProjectId(id);
      setOpen(true);

      

      const project = projects.find((p) => p.id === id);
      if (!project) {
        setLoading(true);
        const res = await fetch(`/api/projects/${id}`);
        if (res.ok) {
          const fetched = await res.json();
          setFetchedProject(fetched);
          setProjects([...projects, fetched as Project]);
        } else {
          setFetchedProject(null);
        }
        setLoading(false);
      } else {
        setFetchedProject(null);
          }

          console.log("ProjectModalProvider, openProjectModal project***:", project, "user***", user, "loading?***", loading);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projects, setProjects],
  );

  const closeProjectModal = useCallback(() => {
    setOpen(false);
    setProjectId(null);
    setFetchedProject(null);
    setLoading(false);
  }, []);

  const project = projects.find((p) => p.id === projectId) || fetchedProject;

  return (
    <>
      <ProjectModalContext.Provider value={{ openProjectModal, closeProjectModal, loading }}>
        {children}
        {loading && <LoaderModal />}
        {!loading && project && user && (
          <ProjectDetailsDialog
            user={user}
            project={project}
            open={open}
            onClose={closeProjectModal}

            theme={theme}
          />
        )}
      </ProjectModalContext.Provider>
    </>
  );
};
