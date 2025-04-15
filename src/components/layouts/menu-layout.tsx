"use client";

import React, { PropsWithChildren, useEffect, useState } from "react";

import { useSafeThemeContext } from "@/context/safe-theme-context";
import { useSidebarContext } from "@/context/sidebar-context";
import DesktopHeader from "../menu/desktop-header";
import MobileMenu from "../menu/mobileMenu";
import StickyHeader from "../menu/sticky-header";
import SiteFooter from "../site-footer/site-footer";
import { SafeUser } from "./layout-client";

interface Props {
  user: SafeUser | null;
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
          <StickyHeader
            theme={theme}
            sidebarExpanded={sidebarExpanded}
            onToggle={() => setSidebarExpanded((currentSidebarExpanded) => !currentSidebarExpanded)}
          />
          <MobileMenu user={user} theme={theme} isOpen={sidebarExpanded} toggleMenu={toggleMenu} />
        </>
      ) : (
        <>
          <DesktopHeader user={user} className="z-50 hidden" />

          <DesktopHeader
            user={user}
            className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
              isScrolled ? "translate-y-0 shadow-[0_1px_2px_0_rgba(0,0,0,0.1)]" : "-translate-y-full"
            }`}
          />
        </>
      )}

      <main className="flex flex-1 flex-col items-center justify-center bg-black p-4 text-white">
        <div>{children}</div>
      </main>

      <SiteFooter theme={theme} />
    </div>
  );
};

export default MenuLayout;
