import { cn } from "@/utils/cn.utils";
import React from "react";
import SiteFooterLowerPart from "./site-footer-lower-part";
import SiteFooterSeparator from "./site-footer-separator";
import SiteFooterUpperPart from "./site-footer-upper-part";

interface Props {
  className?: string;
}

const SiteFooter: React.FC<Props> = ({ className }) => {
  return (
    <div className="bg-gradient-to-b from-zinc-900 via-indigo-950 to-zinc-900">
      <footer className={cn("my-12", className)}>
        <div className="max-w-container">
          <SiteFooterUpperPart />

          <SiteFooterSeparator />

          <SiteFooterLowerPart />
        </div>
      </footer>
    </div>
  );
};

export default SiteFooter;
