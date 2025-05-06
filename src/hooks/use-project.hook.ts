"use client";

import { useCallback } from "react";
import { useProjectContext } from "@/context/project-context";

export const useProjectActions = () => {
  const context = useProjectContext();

  if (!context) {
    throw new Error("useProjectActions must be used within a ProjectProvider");
  }

  const { refreshProjects } = context;

  const safeRefresh = useCallback(async () => {
    try {
      await refreshProjects();
    } catch (error) {
      console.error("Failed to refresh projects:", error);
    }
  }, [refreshProjects]);

  return { refreshProjects: safeRefresh };
};
