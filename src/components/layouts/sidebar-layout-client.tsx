"use client";

import { useSafeThemeContext } from "@/context/safe-theme-context";
import { useSidebarContext } from "@/context/sidebar-context";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { usePathname } from "next/navigation";
import React, { PropsWithChildren, useEffect } from "react";
import ProfileHeader from "../menu/profile-header";
// import { SafeUser } from "./layout-client";
import SiteFooter from "../site-footer/site-footer";
import { AuthUser } from "@/models/auth";
import Sidebar from "../profile-PAGE/sidebar/sidebar";

interface Props {
  user: AuthUser | null;
}

const SidebarLayoutClient: React.FC<PropsWithChildren<Props>> = ({ user, children }) => {
  const { theme } = useSafeThemeContext();
  const { sidebarExpanded, setSidebarExpanded } = useSidebarContext();
  const pathname = usePathname();

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setSidebarExpanded(false);
    }
  }, [pathname, setSidebarExpanded]);

  return (
    <div className="flex">
      <Sidebar
        user={user}
        theme={theme}
        sidebarExpanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded((currentSidebarExpanded) => !currentSidebarExpanded)}
        className={cn("fixed inset-0 z-10 transition-transform md:static md:min-h-screen md:transition-none", {
          "-translate-x-full md:translate-x-0": !sidebarExpanded,
        })}
      />

      <div className="flex min-h-screen flex-1 flex-col">
        <ProfileHeader
          user={user}
          onToggle={() => setSidebarExpanded((currentSidebarExpanded) => !currentSidebarExpanded)}
        />

        <main
          className={cn("flex flex-1 flex-col gap-6 p-6", {
       "bg-gradient-to-b from-[#f7f3f1] via-[#f0e3dd] to-[#f7f3f1] text-zinc-700":
          theme === Theme.LIGHT,
        "bg-gradient-to-b from-[#121211] via-[#332f2d] to-[#121211] text-zinc-200":
          theme === Theme.DARK,
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
