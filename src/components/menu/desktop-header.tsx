import { useSafeThemeContext } from "@/context/safe-theme-context";
import { useSafeUser } from "@/context/user-context";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { setCookie } from "cookies-next";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import SiteLogoBlack from "../site-logo-black";
import SiteLogoWhite from "../site-logo-white";
import ThemeToggle from "../theme-toggle";
import DesktopMenu from "./desktop-menu";
import ProfileHeaderDetails from "./profile-header-details";
import NotificationBubble from "../notification-bubble";
interface DesktopHeaderProps {
  className?: string;
}

const DesktopHeader: React.FC<DesktopHeaderProps> = ({ className = "" }) => {
  const { setTheme } = useTheme();
  const { theme } = useSafeThemeContext();
  const { user } = useSafeUser();
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
    <header
      className={cn(`relative h-20 border-b-2 md:block ${className}`, {
        "border-[#bda69c] bg-gradient-to-br from-[#fbe8e0] via-[#dfc9bf] to-[#c8b3aa] text-zinc-700":
          theme === Theme.LIGHT,
        "border-[#72645f] bg-gradient-to-br from-[#bda69c] via-[#72645f] to-[#443d3a] text-zinc-300":
          theme === Theme.DARK,
      })}
    >
      <div className="container mx-auto flex h-20 items-center justify-between">
        <div className="flex items-center gap-1">
          {theme === Theme.DARK ? <SiteLogoWhite size={200} /> : <SiteLogoBlack size={200} />}
          <DesktopMenu theme={theme} />
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle theme={theme} onClick={switchTheme} />
          <NotificationBubble />
          {user && <ProfileHeaderDetails theme={theme} forceClickDropdown={menuToggleShow} variant="desktop" />}
        </div>
      </div>
    </header>
  );
};

export default DesktopHeader;
