import { useSafeThemeContext } from "@/context/safe-theme-context";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { setCookie } from "cookies-next";
import { useTheme } from "next-themes";
import React from "react";
// import { SafeUser } from "../layouts/layout-client";
import SiteLogoBlack from "../site-logo-black";
import SiteLogoWhite from "../site-logo-white";
import ThemeToggle from "../theme-toggle";
import DesktopMenu from "./desktop-menu";
import { AuthUser } from "@/models/auth";
interface DesktopHeaderProps {
  className?: string;
  user: AuthUser | null;
}

const DesktopHeader: React.FC<DesktopHeaderProps> = ({ className = "" }) => {
  const { setTheme } = useTheme();
  const { theme } = useSafeThemeContext();

  const switchTheme = () => {
    const otherTheme = theme === Theme.DARK ? Theme.LIGHT : Theme.DARK;
    setTheme(otherTheme);
    setCookie("theme", otherTheme, { path: "/" });
  };

  return (
    <header
      className={cn(`md:block relative border-b-2 ${className}`, {
        "border-[#bda69c] bg-gradient-to-br from-[#fbe8e0] via-[#dfc9bf] to-[#c8b3aa] text-zinc-700":
          theme === Theme.LIGHT,
        "border-[#72645f] bg-gradient-to-br from-[#bda69c] via-[#72645f] to-[#443d3a] text-zinc-300":
          theme === Theme.DARK,
      })}
    >
      {theme === Theme.DARK ? (
        <SiteLogoWhite size={130} className="absolute top-10 -translate-y-1/2 md:-left-2 lg:left-4 xl:left-8" />
      ) : (
        <SiteLogoBlack size={130} className="absolute top-10 -translate-y-1/2 md:-left-2 lg:left-4 xl:left-8" />
      )}

      <ThemeToggle className="absolute left-40 top-[52px]" theme={theme} onClick={switchTheme} />
      <div className="container mx-auto px-1">
        <div className="flex h-20 items-center">
          <div className="flex flex-1 justify-center pl-24">
            <DesktopMenu theme={theme} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default DesktopHeader;
