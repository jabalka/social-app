import React from "react";
import AnimatedLogo from "../animated-logo";
import DesktopMenu from "./desktopMenu";
// import { useSafeThemeContext } from "@/context/safe-theme-context";
// import { useTheme } from "next-themes";
// import { setCookie } from "cookies-next";
// import { Theme } from "@/types/theme.enum";
// import ThemeToggle from "../theme-toggle";

interface DesktopHeaderProps {
  className?: string;
}

const DesktopHeader: React.FC<DesktopHeaderProps> = ({ className = "" }) => {
  // const { setTheme } = useTheme();
  // const { theme } = useSafeThemeContext();

  // const switchTheme = () => {
  //   const otherTheme = theme === Theme.DARK ? Theme.LIGHT : Theme.DARK;
  //   setTheme(otherTheme);
  //   setCookie("theme", otherTheme, { path: "/" });
  // };
  return (
    <header className={`bg-gradient-to-br from-[#bda69c] via-[#72645f] to-[#443d3a] md:block ${className}`}>
      <AnimatedLogo size={130} className="absolute top-10 -translate-y-1/2 md:-left-2 lg:left-4 xl:left-8" />
      <div className="container mx-auto px-1">
        <div className="flex h-20 items-center">
          <div className="flex flex-1 justify-center pl-24">
            <DesktopMenu />
          </div>
        </div>
        <div className="absolute left-0 right-0 h-0.5 bg-[#2b2725]" />
      </div>
    </header>
    //       <ThemeToggle theme={theme} onClick={switchTheme} />
  );
};

export default DesktopHeader;
