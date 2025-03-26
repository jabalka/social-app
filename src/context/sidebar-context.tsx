"use client";

import { setCookie } from "cookies-next";
import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";

type SidebarContextType = {
  sidebarExpanded: boolean;
  setSidebarExpanded: React.Dispatch<React.SetStateAction<boolean>>;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebarContext = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

interface Props {
  initialSidebarExpanded: boolean;
}

export const SidebarProvider: React.FC<PropsWithChildren<Props>> = ({ initialSidebarExpanded, children }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(initialSidebarExpanded);

  useEffect(() => {
    setCookie("sidebarExpanded", sidebarExpanded.toString());
  }, [sidebarExpanded]);

  return <SidebarContext.Provider value={{ sidebarExpanded, setSidebarExpanded }}>{children}</SidebarContext.Provider>;
};
