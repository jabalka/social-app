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
  icon?: React.ElementType;
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
  icon: Icon = Info,
  iconClassName,
  tooltipClassName,
  tooltipPlacement = "top",
  onClick,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [animationKey, setAnimationKey] = useState<number>(0);
  const [tooltipStyle, setTooltipStyle] = useState({});
  
  const iconRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (animationKey === 0) return;

    const timeout = setTimeout(() => {
      setAnimationKey(0);
    }, 1500); // match animation duration (in ms)

    return () => clearTimeout(timeout);
  }, [animationKey]);

  useEffect(() => {
    if (!showTooltip || !iconRef.current) return;

    function updatePosition() {
      if (!iconRef.current || !tooltipRef.current) return;
      
      const iconRect = iconRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      const gap = 10;
      
      let top = 0;
      let left = 0;
      
      switch (tooltipPlacement) {
        case "right":
          left = iconRect.right + gap;
          top = iconRect.top + (iconRect.height / 2) - (tooltipRect.height / 2);
          break;
        case "bottom":
          top = iconRect.bottom + gap;
          left = iconRect.left + (iconRect.width / 2) - (tooltipRect.width / 2);
          break;
        case "left":
          left = iconRect.left - tooltipRect.width - gap;
          top = iconRect.top + (iconRect.height / 2) - (tooltipRect.height / 2);
          break;
        case "top":
        default:
          top = iconRect.top - tooltipRect.height - gap;
          left = iconRect.left + (iconRect.width / 2) - (tooltipRect.width / 2);
          break;
      }
      
      // Prevent tooltip from going off-screen
      if (left < 0) left = 0;
      if (left + tooltipRect.width > viewportWidth) {
        left = viewportWidth - tooltipRect.width;
      }
      
      if (top < 0) top = 0;
      if (top + tooltipRect.height > viewportHeight) {
        top = viewportHeight - tooltipRect.height;
      }
      
      setTooltipStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 9999,
      });
    }
    
    updatePosition();
    
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);
    
    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [showTooltip, tooltipPlacement]);

  const handleShowTooltip = () => setShowTooltip(true);
  const handleHideTooltip = () => setShowTooltip(false);

  const handleIconClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setShowTooltip(!showTooltip);
    if (onClick) onClick();
  };

  return (
    <div id={id} className={`group relative ${className ?? ""}`}>
      <button
        ref={iconRef}
        type="button"
        tabIndex={-1}
        aria-label="icon-action"
        onClick={handleIconClick}
        onMouseEnter={handleShowTooltip}
        onFocus={handleShowTooltip}
        onMouseLeave={handleHideTooltip}
        onBlur={handleHideTooltip}
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
      
      {showTooltip && createPortal(
        <div
          ref={tooltipRef}
          className={cn(
            "overflow-hidden rounded-md px-2 py-1 text-xs shadow-lg transition-all",
            {
              "bg-[#dbccc5] text-zinc-700": theme === Theme.LIGHT,
              "bg-[#5e5753] text-zinc-200": theme === Theme.DARK,
            },
            tooltipClassName
          )}
          style={{
            ...tooltipStyle,
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
      )}
    </div>
  );
};

export default IconWithTooltip;