"use client";

// import { Post, Comment, Like } from "@prisma/client";
import { UserProvider } from "@/context/user-context";
import { usePathname } from "next/navigation";
import React, { PropsWithChildren } from "react";
import MenuLayout from "./menu-layout";
import SidebarLayoutClient from "./sidebar-layout-client";
import WelcomeLayout from "./welcome-layout";

// import { AuthUser } from "@/models/auth";

const PATHS_WITH_MENU_LAYOUT = [
  "/dashboard",
  "/create-project", 
  "/share-idea",
  "/report", 
  "send-test",
  "/about/what-is-it",
  "/about/faq",
  "/about/contact"
];

const PATHS_WITH_SIDEBAR_LAYOUT = ["/profile/dashboard", "/profile/projects", "/profile/messages"];

export type SafeUser = {
  id: string;
  name: string | null;
  email: string | null;
  username: string | null;
  emailVerified: Date | null;
  image: string | null;
  roleId: string | null;
  comments: { id: string; content: string; createdAt: Date }[];
  likes: { id: string; projectId: string | null; createdAt: Date }[];
  ideas: { id: string; title: string; createdAt: Date }[];
  projects: { id: string; title: string; createdAt: Date }[];
  role: { id: string; name: string } | null;
};
interface Props {
  user: SafeUser | null;
  children: React.ReactNode;
}

const LayoutClient: React.FC<PropsWithChildren<Props>> = ({ user, children }) => {
  const pathname = usePathname();

  // if (pathname === "/") {
  //   return <WelcomeLayout>{children}</WelcomeLayout>;
  // }

  // if (PATHS_WITH_MENU_LAYOUT.some((path) => pathname.startsWith(path))) {
  //   return <MenuLayout user={user}>{children}</MenuLayout>;
  // }

  // if (PATHS_WITH_SIDEBAR_LAYOUT.some((path) => pathname.startsWith(path))) {
  //   return <SidebarLayoutClient user={user}>{children}</SidebarLayoutClient>;
  // }

  // return <>{children}</>;

  return (
    <UserProvider initialUser={user}>
      {pathname === "/" && <WelcomeLayout>{children}</WelcomeLayout>}
      {PATHS_WITH_MENU_LAYOUT.some((path) => pathname!.startsWith(path)) && (
        <MenuLayout user={user}>{children}</MenuLayout>
      )}
      {PATHS_WITH_SIDEBAR_LAYOUT.some((path) => pathname!.startsWith(path)) && (
        <SidebarLayoutClient>{children}</SidebarLayoutClient>
      )}
      {!pathname!.startsWith("/") && children}
    </UserProvider>
  );
};

export default LayoutClient;
