"use client";

import { useSafeThemeContext } from "@/context/safe-theme-context";
import { useSidebarContext } from "@/context/sidebar-context";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { usePathname } from "next/navigation";
import React, { PropsWithChildren, useEffect } from "react";
import ProfileHeader from "../menu/profile-header";
// import { SafeUser } from "./layout-client";
import { useGlobalUnreadCount } from "@/hooks/use-global-unread";
import { AuthUser } from "@/models/auth";
import { useSession } from "next-auth/react";
import Sidebar from "../profile-PAGE/sidebar/sidebar";
import SiteFooter from "../site-footer/site-footer";

const SidebarLayoutClient: React.FC<PropsWithChildren> = ({ children }) => {
  const { theme } = useSafeThemeContext();
  const { sidebarExpanded, setSidebarExpanded } = useSidebarContext();
  const pathname = usePathname();
  const { data: session } = useSession();
  const currentUser = session?.user as AuthUser;

  const { unreadCount } = useGlobalUnreadCount(currentUser?.id);
  const [hasMounted, setHasMounted] = React.useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setSidebarExpanded(false);
    }
  }, [pathname, setSidebarExpanded]);

  if (!hasMounted) return null;

  return (
    <div className="flex">
      <Sidebar
        theme={theme}
        sidebarExpanded={sidebarExpanded}
        unreadMessages={unreadCount}
        onToggle={() => setSidebarExpanded((currentSidebarExpanded) => !currentSidebarExpanded)}
        className={cn("fixed inset-0 z-10 transition-transform md:static md:min-h-screen md:transition-none", {
          "-translate-x-full md:translate-x-0": !sidebarExpanded,
        })}
      />

      <div className="flex min-h-screen flex-1 flex-col">
        <ProfileHeader onToggle={() => setSidebarExpanded((currentSidebarExpanded) => !currentSidebarExpanded)} />

        <main
          className={cn("flex flex-1 flex-col gap-6 p-6", {
            "bg-gradient-to-b from-[#f7f3f1] via-[#f0e3dd] to-[#f7f3f1] text-zinc-700": theme === Theme.LIGHT,
            "bg-gradient-to-b from-[#121211] via-[#332f2d] to-[#121211] text-zinc-200": theme === Theme.DARK,
          })}
        >
          {children}
        </main>

        <SiteFooter theme={theme} />
      </div>
    </div>
  );
};

export default SidebarLayoutClient;
