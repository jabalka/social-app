"use client";

import { useSafeThemeContext } from "@/context/safe-theme-context";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import React, { useEffect, useState } from "react";

const ReportPage: React.FC = () => {
  const { theme } = useSafeThemeContext();

    const [animationKey, setAnimationKey] = useState<number>(0);
  
    useEffect(() => {
      if (animationKey === 0) return;
  
      const timeout = setTimeout(() => {
        setAnimationKey(0);
      }, 1500); // match animation duration (in ms)
  
      return () => clearTimeout(timeout);
    }, [animationKey]);
  return (
    <>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="overflow-hidden absolute rounded-lg">
          <div
            className={cn(
              "relative flex items-center justify-center rounded-lg px-4 py-3 font-medium text-white shadow backdrop-blur-md min-w-[320px]",
              {
                "border-[#b8a299] bg-gradient-to-br from-[#57504d85] via-[#57504dc1] to-[#57504dce] text-zinc-100":
                  theme === Theme.LIGHT,
                "border-[#72645f] bg-gradient-to-br from-[#6d6c6cd9] via-[#4a4a4aa8] to-[#4d4d4ddd] text-zinc-300":
                  theme === Theme.DARK,
              },
            )}
            style={{
              minWidth: 320,

            }}
          >
            <span>{"Bugnal mutant, are yo usure?"}</span>
            <button className="absolute top-0 right-2 text-lg hover:text-gray-100" aria-label="Close" type="button">
              ×
            </button>
                  <span
                    key={animationKey}
                    className={cn("pointer-events-none absolute -inset-[0px] z-20 rounded-lg", {
                      "animate-snakeBorderGreen1sLight": theme === Theme.LIGHT,
                      "animate-snakeBorderGreen1s": theme === Theme.DARK,
                    })}
                  />
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportPage;

// {  "border-[2px] border-zinc-400": theme === Theme.LIGHT,
//   "border-[2px] border-zinc-700": theme === Theme.DARK,}
