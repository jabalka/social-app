import { cn } from "@/utils/cn.utils";
import Image from "next/image";
import React from "react";

interface Props {
  size: number;
  className?: string;
}

const AnimatedLogo: React.FC<Props> = ({ size, className }) => {
  return (
    <Image
      src="/images/civ-dev-logo.png"
      alt="CivDev Logo"
      width={size}
      height={size}
      className={cn("group-hover:animate-tiltZoom", className)}
    />
  );
};

export default AnimatedLogo;
