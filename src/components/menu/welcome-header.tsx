import React from "react";

import SiteLogoBlack from "../site-logo-black";
import SiteLogoWhite from "../site-logo-white";
import WelcomeMenu from "./welcomeMenu";
import { cn } from "@/utils/cn.utils";
import { Theme } from "@/types/theme.enum";

interface Props {
  className?: string;
  theme: string
}

const WelcomeHeader: React.FC<Props> = ({ className = "", theme }) => {

  return (
    <header className={cn(`relative md:block ${className}`, {
               "border-[#bda69c] bg-gradient-to-br from-[#fbe8e0] via-[#dfc9bf] to-[#c8b3aa] text-zinc-700":
                  theme === Theme.LIGHT,
                "border-[#72645f] bg-gradient-to-br from-[#443d3a] via-[#72645f] to-[#bda69c] text-zinc-300":
                  theme === Theme.DARK,
    })}>
      <div className="container mx-auto flex h-52 flex-col items-center justify-between px-1 pb-1">
        <div className="relative -top-16 flex flex-1 items-center justify-center">
          {theme === Theme.DARK ? (
        <SiteLogoWhite size={330}/>
      ) : (
        <SiteLogoBlack size={330} />
      )}
        </div>
        <div className="absolute bottom-1 sm:bottom-1 md:bottom-1 lg:bottom-1 xl:bottom-1 2xl:bottom-1 w-full justify-center">
          <WelcomeMenu theme={theme}/>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2b2725]" />
      </div>
    </header>
  );
};

export default WelcomeHeader;
