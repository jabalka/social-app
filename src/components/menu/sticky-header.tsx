import React from "react";

import MenuToggle from "./menuToggle";
import SidebarLogo from "../sidebar/sidebar-logo";

interface Props {
  sidebarExpanded: boolean;
  className?: string;
  onToggle: () => void;
}

const StickyHeader: React.FC<Props> = ({ sidebarExpanded, onToggle }) => {
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-br from-[#bda69c] via-[#72645f] to-[#443d3a] md:hidden">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <SidebarLogo size={130} className="absolute -top-5" />
          </div>
          <MenuToggle active={!sidebarExpanded} onClick={onToggle} />
        </div>
        <div className="absolute left-0 right-0 h-0.5 bg-[#2b2725]" />
      </div>
    </header>
  );
};

export default StickyHeader;
