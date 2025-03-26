"use server";

import { getServerInitialSidebarExpanded } from "@/actions/sidebar.actions";
import { SidebarProvider } from "@/context/sidebar-context";

import React, { PropsWithChildren } from "react";

const SidebarProviders: React.FC<PropsWithChildren> = async ({ children }) => {
  const initialSidebarExpanded = await getServerInitialSidebarExpanded();
  return <SidebarProvider initialSidebarExpanded={initialSidebarExpanded === "true"}>{children}</SidebarProvider>;
};

export default SidebarProviders;
