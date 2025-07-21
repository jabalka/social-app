"use client";

import { Project } from "@/models/project";
import { createContext, useCallback, useContext, useState } from "react";

interface ProjectContextType {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  refreshProjects: (options?: {
    page?: number;
    limit?: number;
    sort?: string;
    ownerId?: string;
    type?: "all" | "user";
    lat?: number;
    lng?: number;
    radius?: number;
  }) => Promise<void>;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalProjects: number;
  setTotalProjects: (count: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error("useProjectContext must be used within ProjectProvider");
  return context;
};

export const ProjectProvider: React.FC<{ initialProjects?: Project[]; children: React.ReactNode }> = ({
  initialProjects = [],
  children,
}) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const refreshProjects = useCallback(
    async (options?: {
      page?: number;
      limit?: number;
      sort?: string;
      ownerId?: string;
      type?: "all" | "user";
      lat?: number;
      lng?: number;
      radius?: number;
    }) => {
      try {
        const page = options?.page ?? currentPage;
        const limit = options?.limit ?? pageSize;
        const sort = options?.sort ? `&sort=${options.sort}` : "";
        let url = "";

        if (options?.type === "user" && options.ownerId) {
          url = `/api/user/projects?page=${page}&limit=${limit}${sort}`;
        } else {
          url = `/api/projects?page=${page}&limit=${limit}${sort}`;
          if (options?.ownerId) url += `&ownerId=${options.ownerId}`;
          if (options?.lat !== undefined && options?.lng !== undefined && options?.radius) {
            url += `&near=${options.lat},${options.lng}&radius=${options.radius}`;
          }
        }

        const res = await fetch(url);

        const data = await res.json();
        setProjects(data.projects);
        setTotalProjects(data.totalCount);
      } catch (err) {
        console.error("Failed to refresh projects:", err);
      }
    },
    [currentPage, pageSize]
  );

  return (
    <ProjectContext.Provider
      value={{
        projects,
        setProjects,
        refreshProjects,
        currentPage,
        setCurrentPage,
        totalProjects,
        setTotalProjects,
        pageSize,
        setPageSize,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};