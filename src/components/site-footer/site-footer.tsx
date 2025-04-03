import { cn } from "@/utils/cn.utils";
import React from "react";
import SiteFooterIcons from "./site-footer-icons";
import SiteFooterSeparator from "./site-footer-separator";
import SiteFooterUpperLinks from "./site-footer-upper-links";

interface Props {
  className?: string;
}

const SiteFooter: React.FC<Props> = ({ className }) => {
  return (
    <div className="bg-gradient-to-br from-[#443d3a] via-[#72645f] to-[#bda69c] md:block">
      <div className="absolute left-0 right-0 h-0.5 bg-[#2b2725]" />
      <footer className={cn("my-4", className)}>
        <div className="max-w-container mx-auto">
          <div className="flex flex-col items-center gap-2">
            <SiteFooterIcons />

            <div className="flex justify-center">
              <SiteFooterUpperLinks className="flex-wrap justify-center text-sm" />
            </div>
          </div>

          <SiteFooterSeparator />

          <div className="text-center pb-1">
            <small className="font-medium text-[#dec7bd]">Copyright © {new Date().getFullYear()} jabalka.<br /> All rights reserved.</small>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SiteFooter;
