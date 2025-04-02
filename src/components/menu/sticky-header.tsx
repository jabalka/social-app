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
    <header className="sticky top-0 z-40 bg-[#c6c7cf] md:hidden">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <SidebarLogo className="h-14 w-auto" />
          </div>
          <MenuToggle active={!sidebarExpanded} onClick={onToggle} />
        </div>
      </div>
    </header>
  );
};

export default StickyHeader;
