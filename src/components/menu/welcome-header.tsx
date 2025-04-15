import React from "react";

import SiteLogoBlack from "../site-logo-black";
import WelcomeMenu from "./welcomeMenu";

interface Props {
  className?: string;
}

const WelcomeHeader: React.FC<Props> = ({ className = "" }) => {
  return (
    <header className={`relative bg-gradient-to-br from-[#bda69c] via-[#72645f] to-[#443d3a] md:block ${className}`}>
      <div className="container mx-auto flex h-52 flex-col items-center justify-between px-1 pb-1">
        <div className="relative -top-16 flex flex-1 items-center justify-center">
          <SiteLogoBlack size={330} />
        </div>
        <div className="absolute bottom-1 sm:bottom-1 md:bottom-1 lg:bottom-1 xl:bottom-1 2xl:bottom-1 w-full justify-center">
          <WelcomeMenu />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2b2725]" />
      </div>
    </header>
  );
};

export default WelcomeHeader;
