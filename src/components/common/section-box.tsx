"use client";

import { useSafeThemeContext } from "@/context/safe-theme-context";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

const SectionBox: React.FC<Props> = ({ children, className }) => {
  const { theme } = useSafeThemeContext();

  return (
    <div
      className={cn(
        "w-full mx-auto rounded-3xl border-2 px-6 pb-8 pt-4 shadow-2xl backdrop-blur-md",
        "md:max-w-2xl lg:max-w-5xl xl:max-w-6xl",
        theme === Theme.DARK ? "border-zinc-700/40 bg-[#f0e3dd]/10" : "border-zinc-400/10 bg-[#f0e3dd]",
        className
      )}
    >
      {children}
    </div>
  );
};

export default SectionBox;