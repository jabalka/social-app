"use client";

import React from "react";
import { cn } from "@/utils/cn.utils";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { Theme } from "@/types/theme.enum";

type Props = {
  children: React.ReactNode;
  className?: string;
  variant?: "solid" | "transparent";
};

const SurfacePanel: React.FC<Props> = ({ children, className, variant = "solid" }) => {
  const { theme } = useSafeThemeContext();

  if (variant === "transparent") {
    return <div className={cn("rounded", className)}>{children}</div>;
  }

  return (
    <div
      className={cn(
        "w-full rounded border-2 px-8 py-8 shadow-2xl backdrop-blur-md",
        theme === Theme.DARK ? "border-zinc-700/40 bg-[#f0e3dd]/10" : "border-zinc-400/10 bg-[#f0e3dd]",
        className
      )}
    >
      {children}
    </div>
  );
};

export default SurfacePanel;