"use client";

import { useSafeThemeContext } from "@/context/safe-theme-context";
import { useSidebarContext } from "@/context/sidebar-context";

import { useSafeUser } from "@/context/user-context";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { setCookie } from "cookies-next";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import ThemeToggle from "../theme-toggle";
import MobileMenuToggle from "./mobile-menu-toggle";
import ProfileHeaderDetails from "./profile-header-details";

interface Props {
  className?: string;
  onToggle: () => void;
}

const ProfileHeader: React.FC<Props> = ({ className, onToggle }) => {
  const { setTheme } = useTheme();
  const { user } = useSafeUser();
  const { theme } = useSafeThemeContext();
  const { sidebarExpanded } = useSidebarContext();
  const [menuToggleShow, setMenuToggleShow] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setMenuToggleShow(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const switchTheme = () => {
    const otherTheme = theme === Theme.DARK ? Theme.LIGHT : Theme.DARK;
    setTheme(otherTheme);
    setCookie("theme", otherTheme, { path: "/" });
  };

  return (
    <>
      <header
        className={cn(
          "flex items-center justify-between border-b-2 p-4",
          {
            "border-[#bda69c] bg-gradient-to-r from-[#fbe8e0] via-[#dfc9bf] to-[#c8b3aa]": theme === Theme.LIGHT,
            "border-[#72645f] bg-gradient-to-r from-[#6f635e] via-[#443d3a] to-[#443d3a]": theme === Theme.DARK,
          },
          className,
        )}
      >
        <div className="flex items-center">
          {menuToggleShow && <MobileMenuToggle active={!sidebarExpanded} onClick={onToggle} size={48} />}
        </div>

        {/* <ProfileMenu theme={theme} /> */}

        <div className="flex items-center gap-4">
          <ThemeToggle theme={theme} onClick={switchTheme} />

          {user && <ProfileHeaderDetails theme={theme} forceClickDropdown={menuToggleShow}/>}
        </div>
      </header>
    </>
  );
};

export default ProfileHeader;
