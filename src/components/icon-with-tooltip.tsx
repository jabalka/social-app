"use client";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { Info } from "lucide-react";
import React, { useEffect, useState } from "react";

interface InfoWithTooltipProps {
  id: string;
  content: React.ReactNode;
  className?: string;
  theme: string;
  icon?: React.ElementType; // could be any Lucide or custom icon component
  iconClassName?: string;
  tooltipClassName?: string;
  tooltipPlacement?: "top" | "right" | "bottom" | "left";
  onClick?: () => void;
}

const IconWithTooltip: React.FC<InfoWithTooltipProps> = ({
  id,
  content,
  className,
  theme,
  icon: Icon = Info, // info is default icon
  iconClassName,
  tooltipClassName,
  tooltipPlacement = "top",
  onClick,
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [animationKey, setAnimationKey] = useState<number>(0);

  useEffect(() => {
    if (animationKey === 0) return;

    const timeout = setTimeout(() => {
      setAnimationKey(0);
    }, 1500); // match animation duration (in ms)

    return () => clearTimeout(timeout);
  }, [animationKey]);

  const placement = (() => {
    switch (tooltipPlacement) {
      case "right":
        return "left-full top-1/2 -translate-y-1/2 ml-2";
      case "bottom":
        return "top-full left-1/2 -translate-x-1/2 mt-2";
      case "left":
        return "right-full top-1/2 -translate-y-1/2 mr-2";
      default: // top
        return "-top-7 left-1/2 -translate-x-1/2";
    }
  })();

  const handleIconClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    // Toggle tooltip for info (always show tooltip when clicked)
    setActiveTooltip(activeTooltip === id ? null : id);
    // Fire action if present
    if (onClick) onClick();
  };

  return (
    <div
      className={`group relative ${className ?? ""}`}
      tabIndex={0}
      onMouseLeave={() => setActiveTooltip(null)}
      onBlur={() => setActiveTooltip(null)}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="icon-action"
        onClick={handleIconClick}
        className={cn("m-0 border-none bg-transparent p-0", iconClassName)}
        style={{ lineHeight: 0 }}
      >
        <Icon
          className={cn(
            "cursor-pointer transition-all duration-300",
            {
              "text-gray-600 group-hover:text-orange-700": theme === Theme.LIGHT,
              "text-zinc-300 group-hover:text-orange-500": theme === Theme.DARK,
            },
            iconClassName,
          )}
        />
      </button>

      <div
        className={cn(
          `absolute scale-0 overflow-hidden whitespace-nowrap rounded-md px-2 py-1 text-xs transition-all group-hover:scale-100 ${activeTooltip === id ? "pointer-events-auto scale-100" : ""}`,
          placement,
          {
            "bg-[#dbccc5] text-zinc-700": theme === Theme.LIGHT,
            "bg-[#5e5753] text-zinc-200": theme === Theme.DARK,
          },
          tooltipClassName,
        )}
      >
        {content}
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
    </div>
  );
};

export default IconWithTooltip;
