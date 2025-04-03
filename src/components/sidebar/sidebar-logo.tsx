"use client";

import { cn } from "@/utils/cn.utils";
import Image from "next/image";
import React from "react";

interface Props {
  size?: number;
  className?: string;
}

const SidebarLogo: React.FC<Props> = ({ className, size = 40 }) => {
  return (
    <div className={cn(className)}>
      <Image
        src="/images/civ-dev-logo.png"
        alt="CivDev Logo"
        width={size}
        height={size}
        className="object-contain"
      />
    </div>
  );
};

export default SidebarLogo;
