"use client";

import { cn } from "@/utils/cn.utils";
import Image from "next/image";
import React from "react";

interface Props {
  className?: string;
}

const SidebarLogo: React.FC<Props> = ({ className }) => {
  return (
    <div className={cn(className)}>
      <Image
        src="/images/civ-dev-logo.png"
        alt="CivDev Logo"
        width={72}
        height={72}
        priority
        className="object-contain"
      />
    </div>
  );
};

export default SidebarLogo;
