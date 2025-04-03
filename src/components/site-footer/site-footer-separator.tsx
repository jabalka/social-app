import { cn } from "@/utils/cn.utils";
import React from "react";

interface Props {
  className?: string;
}

const SiteFooterSeparator: React.FC<Props> = ({ className }) => {
  return (
    <>
      <div className={cn("mb-2 mt-2 border-t border-white/50", className)}></div>
    </>
  );
};

export default SiteFooterSeparator;
