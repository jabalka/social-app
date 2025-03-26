"use server";


import { DEFAULT_SIDEBAR_EXPANDED } from "@/constants";
import { cookies } from "next/headers";

export const getServerInitialSidebarExpanded = async () => {
  const readonlyCookies = await cookies();
  const sidebarExpandedCookie = readonlyCookies.get("sidebarExpanded");
  const sidebarExpanded = sidebarExpandedCookie?.value ?? DEFAULT_SIDEBAR_EXPANDED;

  return sidebarExpanded;
};
