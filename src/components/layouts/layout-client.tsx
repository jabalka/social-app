"use client";

import { User } from "@prisma/client";
import { usePathname } from "next/navigation";
import React, { PropsWithChildren } from "react";
import MenuLayout from "./menu-layout";
import SidebarLayoutClient from "./sidebar-layout-client";

const PATHS_WITH_MENU_LAYOUT = ["/dashboard"];

const PATHS_WITH_SIDEBAR_LAYOUT = ["/profile/dashboard"];

interface Props {
  user: User | null;
}

const LayoutClient: React.FC<PropsWithChildren<Props>> = ({ user, children }) => {
  const pathname = usePathname();

  if (pathname === "/") {
    return <MenuLayout>{children}</MenuLayout>;
  }

  if (PATHS_WITH_MENU_LAYOUT.some((path) => pathname.startsWith(path))) {
    return <MenuLayout>{children}</MenuLayout>;
  }

  if (PATHS_WITH_SIDEBAR_LAYOUT.some((path) => pathname.startsWith(path))) {
    return <SidebarLayoutClient user={user}>{children}</SidebarLayoutClient>;
  }

  return <>{children}</>;
};

export default LayoutClient;
