"use client";

import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import React, { useEffect, useState } from "react";

import MobileMenuToggle from "@/components/menu/mobile-menu-toggle";
import SiteLogoWhite from "@/components/site-logo-white";
import SidebarNavigation from "./sidebar-navigation";
import { useSafeUser } from "@/context/user-context";

interface SidebarProps {

  theme: string;
  sidebarExpanded: boolean;
  className?: string;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ theme, sidebarExpanded, className, onToggle }) => {
  const [menuToggleShow, setMenuToggleShow] = useState(false);
  const {user} = useSafeUser()
  // const [mobileScreen, setMobileScreen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setMenuToggleShow(window.innerWidth > 768);
      // setMobileScreen(true);
    };

    handleResize(); // run once on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r",
        {
          "border-zinc-300 bg-zinc-100": theme === Theme.LIGHT,
          "border-zinc-700 bg-zinc-900": theme === Theme.DARK,
        },
        className,
      )}
    >
      <div
        className={cn("absolute -left-px bottom-0 top-0 w-2", {
          "bg-zinc-300": theme === Theme.LIGHT,
          "bg-[#2b2725]": theme === Theme.DARK,
        })}
      />
      {menuToggleShow ? (
        <MobileMenuToggle
          active={!sidebarExpanded}
          onClick={onToggle}
          size={32}
          className="mb-2 flex justify-center p-4"
        />
      ) : (
        <MobileMenuToggle
          active={!sidebarExpanded}
          onClick={onToggle}
          size={48}
          className="mb-2 flex justify-center p-4"
        />
      )}

      <SiteLogoWhite className="mb-2 flex justify-center p-4" />

      <SidebarNavigation
        user={user}
        theme={theme}
        sidebarExpanded={sidebarExpanded}
        className="my-6 flex flex-col gap-2 px-[1.125rem]"
      />
    </aside>
  );
};

export default Sidebar;
