"use client";

import { useSafeThemeContext } from "@/context/safe-theme-context";
import { useSidebarContext } from "@/context/sidebar-context";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { setCookie } from "cookies-next";
import { useTheme } from "next-themes";
import React from "react";
import Hamburger from "./hamburger";
import ProfileDetails from "./profile-details";
import ThemeSwitcher from "./theme-switcher";
import ThemeToggle from "./theme-toggle";
import { SafeUser } from "./layouts/layout-client";

interface Props {
  user: SafeUser | null;
  className?: string;
  onToggle: () => void;
}

const HeaderClient: React.FC<Props> = ({ user, className, onToggle }) => {
  const { setTheme } = useTheme();
  const { theme } = useSafeThemeContext();
  const { sidebarExpanded } = useSidebarContext();

  const switchTheme = () => {
    const otherTheme = theme === Theme.DARK ? Theme.LIGHT : Theme.DARK;
    setTheme(otherTheme);
    setCookie("theme", otherTheme, { path: "/" });
  };

  return (
    <>
      <header
        className={cn(
          "flex items-center justify-between border-b p-4",
          {//
            "border-zinc-300 bg-gradient-to-r from-[#fbe8e0] via-[#dfc9bf] to-[#c8b3aa]": theme === Theme.LIGHT,
            "border-zinc-700 bg-gradient-to-r from-[#6f635e] via-[#443d3a] to-[#443d3a]": theme === Theme.DARK,
          },
          className,
        )}
      >
        <Hamburger theme={theme} active={!sidebarExpanded} onClick={onToggle} className="z-20" />

        <div className="flex items-center gap-4">
          <ThemeSwitcher theme={theme} onClick={switchTheme} />
          <ThemeToggle theme={theme} onClick={switchTheme} />

          {user && <ProfileDetails theme={theme} user={user} />}
        </div>
      </header>
    </>
  );
};

export default HeaderClient;
