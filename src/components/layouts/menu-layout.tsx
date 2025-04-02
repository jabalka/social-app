"use client";

import React, { PropsWithChildren, useEffect, useState } from "react";

import { useSidebarContext } from "@/context/sidebar-context";
import DesktopHeader from "../menu/desktop-header";
import MobileMenu from "../menu/mobileMenu";
import StickyHeader from "../menu/sticky-header";
import SiteFooter from "../site-footer/site-footer";

const MenuLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { sidebarExpanded, setSidebarExpanded } = useSidebarContext();

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
            sidebarExpanded={sidebarExpanded}
            onToggle={() => setSidebarExpanded((currentSidebarExpanded) => !currentSidebarExpanded)}
          />
          <MobileMenu isOpen={sidebarExpanded} toggleMenu={toggleMenu} />
        </>
      ) : (
        <>
          <DesktopHeader className="z-50 hidden" />

          <DesktopHeader
            className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
              isScrolled ? "translate-y-0 shadow-[0_1px_2px_0_rgba(0,0,0,0.1)]" : "-translate-y-full"
            }`}
          />
        </>
      )}

      <div className="flex flex-1 flex-col bg-gradient-to-b from-zinc-900 via-indigo-950 to-zinc-900">
        <main className="flex-1">
          <div>{children}</div>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
};

export default MenuLayout;
