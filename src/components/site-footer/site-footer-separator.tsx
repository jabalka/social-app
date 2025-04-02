import { cn } from "@/utils/cn.utils";
import React from "react";

interface Props {
  className?: string;
}

const SiteFooterSeparator: React.FC<Props> = ({ className }) => {
  return (
    <>
      <div className={cn("mb-4 mt-8 border-t border-white", className)}></div>
    </>
  );
};

export default SiteFooterSeparator;
