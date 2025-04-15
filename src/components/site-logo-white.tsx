"use client";

import { cn } from "@/utils/cn.utils";
import Image from "next/image";
import React from "react";

interface Props {
  size?: number;
  className?: string;
}

const SiteLogoWhite: React.FC<Props> = ({ className, size = 40 }) => {
  return (
    <div className={cn(className)}>
      <Image
        src="/images/civ-dev-logo-white.png"
        alt="CivilDev Logo"
        width={size}
        height={size}
        className="object-contain"
      />
    </div>
  );
};

export default SiteLogoWhite;
