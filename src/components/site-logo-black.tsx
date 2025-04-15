import { cn } from "@/utils/cn.utils";
import Image from "next/image";
import React from "react";

interface Props {
  size: number;
  className?: string;
}

const SiteLogoBlack: React.FC<Props> = ({ size = 40, className }) => {
  return (
    <div className={cn(className)}>
      <Image
        src="/images/civ-dev-logo-black.png"
        alt="CivilDev Logo"
        width={size}
        height={size}
        className="object-contain"
      />
    </div>
  );
};

export default SiteLogoBlack;
