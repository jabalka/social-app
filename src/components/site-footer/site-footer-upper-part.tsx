import { cn } from "@/utils/cn.utils";
import React from "react";
import SiteFooterIcons from "./site-footer-icons";
import SiteFooterUpperLinks from "./site-footer-upper-links";

interface Props {
  className?: string;
}

const SiteFooterUpperPart: React.FC<Props> = ({ className }) => {
  return (
    <>
      <div className={cn("flex flex-col items-center justify-between gap-6 lg:flex-row", className)}>
        <SiteFooterIcons />

        <SiteFooterUpperLinks />
      </div>
    </>
  );
};

export default SiteFooterUpperPart;
