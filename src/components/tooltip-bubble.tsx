"use client";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { formatTooltipContent } from "@/utils/formatContent";

import React, { useEffect, useState } from "react";

interface TooltipBubbleProps {
  theme: string;
  content: React.ReactNode;
  placement?: "top" | "right" | "bottom" | "left";
  show?: boolean; // control externally (optional)
  className?: string;
  children?: React.ReactNode;
}

const TooltipBubble: React.FC<TooltipBubbleProps> = ({
  theme,
  content,
  placement = "right",

  className,
}) => {
  const [animationKey, setAnimationKey] = useState<number>(0);

  useEffect(() => {
    if (animationKey === 0) return;

    const timeout = setTimeout(() => {
      setAnimationKey(0);
    }, 1500); // match animation duration (in ms)

    return () => clearTimeout(timeout);
  }, [animationKey]);

  const place = {
    right: "left-full top-1/2 -translate-y-1/2 ml-4",
    left: "right-full top-1/2 -translate-y-1/2 mr-4",
    top: "bottom-full left-1/2 -translate-x-1/2 mb-1",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  }[placement];

  return (
    <div
      className={cn(
        "pointer-events-none absolute z-50 scale-0 overflow-hidden rounded-md px-2 py-1 text-xs font-semibold opacity-0 shadow-lg transition-all duration-200 group-hover:scale-100 group-hover:opacity-100",
"max-w-[320px] break-words",
        place,
        {
          "bg-[#dbccc5] text-zinc-700": theme === Theme.LIGHT,
          "bg-[#5e5753] text-zinc-200": theme === Theme.DARK,
        },
        className,
      )}
    >
      {formatTooltipContent(content)}
      <span
        key={animationKey}
        className={cn("pointer-events-none absolute -inset-[0px] z-20 rounded-md", {
          "group-hover:animate-snakeBorderHoverLight": theme === Theme.LIGHT,
          "group-hover:animate-snakeBorderHoverDark": theme === Theme.DARK,
        })}
      />
      <span
        className={cn("pointer-events-none absolute -inset-[0px] z-10 rounded-md border-[2px]", {
          "border-zinc-700": theme === Theme.LIGHT,
          "border-zinc-500": theme === Theme.DARK,
        })}
      />
    </div>
  );
};

export default TooltipBubble;
