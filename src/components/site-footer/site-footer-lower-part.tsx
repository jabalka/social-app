import { cn } from "@/utils/cn.utils";
import React from "react";
import SiteFooterLowerLinks from "./site-footer-lower-links";

interface Props {
  className?: string;
}

const SiteFooterLowerPart: React.FC<Props> = ({ className }) => {
  return (
    <>
      <div className={cn("flex flex-col items-center justify-between gap-2 md:flex-row", className)}>
        <small className="font-medium text-white">Copyright © STARCK. All rights reserved.</small>

        <SiteFooterLowerLinks />
      </div>
    </>
  );
};

export default SiteFooterLowerPart;
