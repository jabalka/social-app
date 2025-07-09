"use client";

import React, { PropsWithChildren, useEffect, useState } from "react";

import { useSafeThemeContext } from "@/context/safe-theme-context";
import { useSidebarContext } from "@/context/sidebar-context";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import DesktopHeader from "../menu/desktop-header";
import MobileMenu from "../menu/mobile-menu";
import MobileStickyHeader from "../menu/mobile-sticky-header";
import SiteFooter from "../site-footer/site-footer";
// import { SafeUser } from "./layout-client";
import { AuthUser } from "@/models/auth";

interface Props {
  user: AuthUser | null;
}

const MenuLayout: React.FC<PropsWithChildren<Props>> = ({ user, children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { sidebarExpanded, setSidebarExpanded } = useSidebarContext();
  const { theme } = useSafeThemeContext();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    handleResize();
    handleScroll();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {isMobile ? (
        <>
          {" "}
          <MobileStickyHeader
            theme={theme}
            sidebarExpanded={sidebarExpanded}
            onToggle={() => setSidebarExpanded((currentSidebarExpanded) => !currentSidebarExpanded)}
          />
          <MobileMenu user={user} theme={theme} isOpen={sidebarExpanded} toggleMenu={toggleMenu} />
        </>
      ) : (
        <>
          <DesktopHeader className="top-0 z-50 hidden" />

          <DesktopHeader
            className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
              isScrolled ? "translate-y-0 shadow-[0_1px_2px_0_rgba(0,0,0,0.1)]" : "-translate-y-full"
            }`}
          />
        </>
      )}

      <main
        className={cn("flex flex-1 flex-col items-center justify-center", {
          "bg-gradient-to-b from-[#f7f3f1] via-[#f0e3dd] to-[#f7f3f1] text-zinc-700": theme === Theme.LIGHT,
          "bg-gradient-to-b from-[#121211] via-[#332f2d] to-[#121211] text-zinc-200": theme === Theme.DARK,
        })}
      >
        <div>{children}</div>
      </main>

      <SiteFooter theme={theme} />
    </div>
  );
};

export default MenuLayout;
