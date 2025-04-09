"use client";

import { useSafeThemeContext } from "@/context/safe-theme-context";
import { useSidebarContext } from "@/context/sidebar-context";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { usePathname } from "next/navigation";
import React, { PropsWithChildren, useEffect } from "react";
import Footer from "../sitebar-footer";
import HeaderClient from "../header-client";
import Sidebar from "../sidebar/sidebar";
import { SafeUser } from "./layout-client";

interface Props {
  user: SafeUser | null;
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
        className={cn("fixed inset-0 z-10 transition-transform md:static md:min-h-screen md:transition-none", {
          "-translate-x-full md:translate-x-0": !sidebarExpanded,
        })}
      />

      <div className="flex min-h-screen flex-1 flex-col">
        <HeaderClient
          user={user}
          onToggle={() => setSidebarExpanded((currentSidebarExpanded) => !currentSidebarExpanded)}
        />

        <main
          className={cn("flex flex-1 flex-col gap-6 p-6", {
            "bg-gradient-to-br from-slate-200 via-indigo-50 to-slate-200": theme === Theme.LIGHT,
            "bg-gradient-to-br from-zinc-900 via-indigo-950 to-zinc-900": theme === Theme.DARK,
          })}
        >
          {children}
        </main>

        <Footer theme={theme} />
      </div>
    </div>
  );
};

export default SidebarLayoutClient;
