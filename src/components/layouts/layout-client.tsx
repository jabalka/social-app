"use client";

import { Post, Comment, Like } from "@prisma/client";
import { usePathname } from "next/navigation";
import React, { PropsWithChildren } from "react";
import MenuLayout from "./menu-layout";
import SidebarLayoutClient from "./sidebar-layout-client";
import WelcomeLayout from "./welcome-layout";

const PATHS_WITH_MENU_LAYOUT = ["/dashboard"];

const PATHS_WITH_SIDEBAR_LAYOUT = ["/profile/dashboard"];


export type SafeUser = {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  posts: Post[];  
  comments: Comment[]; 
  likes: Like[]; 
};
interface Props {
  user: SafeUser | null;
  children: React.ReactNode;
}

const LayoutClient: React.FC<PropsWithChildren<Props>> = ({ user, children }) => {
  const pathname = usePathname();

  if (pathname === "/") {
    return <WelcomeLayout>{children}</WelcomeLayout>;
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
