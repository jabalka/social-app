import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import React from "react";
import SiteFooterIcons from "./site-footer-icons";
import SiteFooterSeparator from "./site-footer-separator";
import SiteFooterUpperLinksWelcome from "./site-footer-upper-links-welcome";

interface Props {
  className?: string;
  theme: string;
}

const SiteFooter: React.FC<Props> = ({ className, theme }) => {
  return (
    <>
      {/* <div className="absolute left-0 right-0 h-0.5 bg-[#2b2725]" /> */}
      <footer
        className={cn("space-y-4 border-t py-6 text-center text-sm", className, {
          "border-zinc-300 bg-gradient-to-br from-[#fbe8e0] via-[#dfc9bf] to-[#c8b3aa] text-zinc-700":
            theme === Theme.LIGHT,
          "border-zinc-700 bg-gradient-to-br from-[#443d3a] via-[#72645f] to-[#bda69c] text-zinc-300":
            theme === Theme.DARK,
        })}
      >
        <div className="max-w-container mx-auto">
          <div className="flex justify-center">
            <SiteFooterUpperLinksWelcome className="flex-wrap justify-center text-sm" theme={theme}/>
          </div>

          <SiteFooterSeparator />
          <div className="relative pb-1">
            <div className="w-full pl-9 text-left sm:pl-0 sm:text-center">
              <small className={cn("text-center font-medium ",
                {"text-[#dec7bd]" : theme === Theme.DARK, "text-[#6f6561]" : theme === Theme.LIGHT}
              )}>
                Copyright © {new Date().getFullYear()} jabalka.
                <br /> All rights reserved.
              </small>
            </div>

            <div className="absolute bottom-0 right-8">
              <SiteFooterIcons theme={theme} />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default SiteFooter;
