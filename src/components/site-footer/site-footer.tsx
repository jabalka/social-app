import { cn } from "@/utils/cn.utils";
import React from "react";
import SiteFooterIcons from "./site-footer-icons";
import SiteFooterSeparator from "./site-footer-separator";
import SiteFooterUpperLinksWelcome from "./site-footer-upper-links-welcome";

interface Props {
  className?: string;
}

const SiteFooter: React.FC<Props> = ({ className }) => {
  return (
    <>
      <div className="bg-gradient-to-br from-[#443d3a] via-[#72645f] to-[#bda69c] md:block">
        <div className="absolute left-0 right-0 h-0.5 bg-[#2b2725]" />
        <footer className={cn("my-4", className)}>
          <div className="max-w-container mx-auto">
            <div className="flex justify-center">
              <SiteFooterUpperLinksWelcome className="flex-wrap justify-center text-sm" />
            </div>

            <SiteFooterSeparator />
            <div className="relative pb-1">
              <div className="w-full sm:text-center sm:pl-0 text-left pl-9">
                <small className="text-center font-medium text-[#dec7bd]">
                  Copyright © {new Date().getFullYear()} jabalka.
                  <br /> All rights reserved.
                </small>
              </div>

              <div className="absolute bottom-0 right-8">
                <SiteFooterIcons />
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default SiteFooter;
