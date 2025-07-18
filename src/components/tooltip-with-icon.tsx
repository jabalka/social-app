"use client";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { formatTooltipContent } from "@/utils/formatContent";
import { Info } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [animationKey, setAnimationKey] = useState<number>(0);
  const iconRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (animationKey === 0) return;

    const timeout = setTimeout(() => {
      setAnimationKey(0);
    }, 1500); // match animation duration (in ms)

    return () => clearTimeout(timeout);
  }, [animationKey]);

  const showTooltip = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
      });
      setActiveTooltip(id);
    }
  };

  const hideTooltip = () => setActiveTooltip(null);

function getTooltipPlacementStyles(
  tooltipPlacement: "top" | "right" | "bottom" | "left",
  coords: { top: number; left: number },
  iconRef: React.RefObject<HTMLButtonElement>
) {
  const gap = 6; // Increased gap for better visibility
  const iconWidth = iconRef.current?.offsetWidth ?? 0;
  const iconHeight = iconRef.current?.offsetHeight ?? 0;
  
  switch (tooltipPlacement) {
    case "right":
      return {
        top: coords.top + iconHeight / 2,
        left: coords.left + iconWidth + gap,
        transform: "translate(0, -50%)",
      };
    case "bottom":
      return {
        top: coords.top + iconHeight + gap,
        left: coords.left + iconWidth / 2,
        transform: "translate(-50%, 0)",
      };
    case "left":
      return {
        top: coords.top + iconHeight / 2,
        left: coords.left - gap,
        transform: "translate(-100%, -50%)",
      };
    case "top":
    default:

      return {
        top: Math.max(0, coords.top - gap), // if bug persist and tooltip appears way below then consider fixed offset of some px
        left: coords.left + iconWidth / 2,
        transform: "translate(-50%, -100%)", 
      };
  }
}

  const tooltip = activeTooltip === id && coords
  ? createPortal(
      <div
        className={cn(
          "fixed z-[9999] overflow-hidden rounded-md px-2 py-1 text-xs shadow-lg transition-all",
          {
            "bg-[#dbccc5] text-zinc-700": theme === Theme.LIGHT,
            "bg-[#5e5753] text-zinc-200": theme === Theme.DARK,
          },
          tooltipClassName
        )}
        style={{
          ...getTooltipPlacementStyles(tooltipPlacement, coords, iconRef),
          pointerEvents: "auto",
          minWidth: 'max-content',
          maxWidth: 300,
          whiteSpace: 'normal',
        }}
      >
        {formatTooltipContent(content)}
        <span
          key={animationKey}
          className={cn("pointer-events-none absolute -inset-[0px] z-20 rounded-md", {
            "animate-snakeBorderHoverLight": theme === Theme.LIGHT,
            "animate-snakeBorderHoverDark": theme === Theme.DARK,
          })}
        />
        <span
          className={cn("pointer-events-none absolute -inset-[0px] z-10 rounded-md border-[2px]", {
            "border-zinc-700": theme === Theme.LIGHT,
            "border-zinc-500": theme === Theme.DARK,
          })}
        />
      </div>,
      document.body
    )
  : null;

  const handleIconClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setActiveTooltip(activeTooltip === id ? null : id);
    // Fire action if present
    if (onClick) onClick();
  };

  return (
    <div className={`group relative ${className ?? ""}`}>
      <button
        ref={iconRef}
        type="button"
        tabIndex={-1}
        aria-label="icon-action"
        onClick={handleIconClick}
        onMouseEnter={showTooltip}
        onFocus={showTooltip}
        onMouseLeave={hideTooltip}
        onBlur={hideTooltip}
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
      {tooltip}
    </div>
  );
};

export default IconWithTooltip;
