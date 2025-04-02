import React from "react";
import DesktopMenu from "./desktopMenu";
import AnimatedLogo from "../animated-logo";

interface DesktopHeaderProps {
  className?: string;
}

const DesktopHeader: React.FC<DesktopHeaderProps> = ({ className = "" }) => {
  return (
    <header className={`bg-[#0A0B1A] md:block ${className}`}>
      <div className="container mx-auto px-1">
        <div className="flex h-20 items-center justify-between">
          <div className="flex-shrink-0">
            <AnimatedLogo size={64} className="w-auto" />
          </div>
          <div className="flex flex-1 justify-center">
            <DesktopMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

export default DesktopHeader;
