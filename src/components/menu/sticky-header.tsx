import React from "react";

import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import SiteLogoWhite from "../site-logo-white";
import MenuToggle from "./menuToggle";
import SiteLogoBlack from "../site-logo-black";

interface Props {
  sidebarExpanded: boolean;
  className?: string;
  onToggle: () => void;
  theme: string;
}

const StickyHeader: React.FC<Props> = ({ sidebarExpanded, onToggle, theme }) => {
  return (
    <header
      className={cn("sticky top-0 z-40 md:hidden", {
        "border-zinc-300 bg-gradient-to-r from-[#fbe8e0] via-[#dfc9bf] to-[#c8b3aa]": theme === Theme.LIGHT,
        "border-zinc-700 bg-gradient-to-r from-[#6f635e] via-[#443d3a] to-[#443d3a]": theme === Theme.DARK,
      })}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
          {theme === Theme.DARK ? (
                <SiteLogoWhite size={130} className="absolute -top-5" />
              ) : (
                <SiteLogoBlack size={130} className="absolute -top-5"/>
              )}
          </div>
          <MenuToggle active={!sidebarExpanded} onClick={onToggle} />
        </div>
        <div className="absolute left-0 right-0 h-0.5 bg-[#2b2725]" />
      </div>
    </header>
  );
};

export default StickyHeader;

// className={cn("flex flex-col rounded-md  shadow-lg", {
//                 "bg-[#443d3a]": theme === Theme.DARK,
//                 "bg-[#eeded7]": theme === Theme.LIGHT,
//               })}
