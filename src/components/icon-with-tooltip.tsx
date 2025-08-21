"use client";

import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { formatTooltipContent } from "@/utils/formatContent";
import { Info } from "lucide-react";
import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

interface Props {
  id: string;
  content: React.ReactNode;
  className?: string;
  theme: string;
  icon?: React.ElementType;
  iconClassName?: string;
  tooltipClassName?: string;
  tooltipPlacement?: "top" | "right" | "bottom" | "left";
  onClick?: () => void;
  hideDelayMs?: number;
  gap?: number;
  maxWidth?: number;
}

type Placement = NonNullable<Props["tooltipPlacement"]>;

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

function computePosition(
  iconRect: DOMRect,
  tooltipRect: DOMRect,
  placement: Placement,
  gap: number,
  viewportW: number,
  viewportH: number,
) {
  let top = 0;
  let left = 0;

  switch (placement) {
    case "right":
      left = iconRect.right + gap;
      top = iconRect.top + iconRect.height / 2 - tooltipRect.height / 2;
      break;
    case "bottom":
      top = iconRect.bottom + gap;
      left = iconRect.left + iconRect.width / 2 - tooltipRect.width / 2;
      break;
    case "left":
      left = iconRect.left - tooltipRect.width - gap * 2; 
      top = iconRect.top + iconRect.height / 2 - tooltipRect.height / 2;
      break;
    case "top":
    default:
      top = iconRect.top - tooltipRect.height - gap;
      left = iconRect.left + iconRect.width / 2 - tooltipRect.width / 2;
      break;
  }

  const margin = 4;
  left = clamp(left, margin, viewportW - tooltipRect.width - margin);
  top = clamp(top, margin, viewportH - tooltipRect.height - margin);

  return { top, left };
}

const IconWithTooltip: React.FC<Props> = ({
  id,
  content,
  className,
  theme,
  icon: Icon = Info,
  iconClassName,
  tooltipClassName,
  tooltipPlacement = "top",
  onClick,
  hideDelayMs = 120,
  gap = 10,
  maxWidth = 300,
}) => {
  const [open, setOpen] = useState(false);
  const [positioned, setPositioned] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [animationKey, setAnimationKey] = useState(0);

  const iconRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<number | null>(null);
  const resizeObsRef = useRef<ResizeObserver | null>(null);

  const clearHideTimer = () => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const scheduleHide = () => {
    clearHideTimer();
    hideTimerRef.current = window.setTimeout(() => {
      setOpen(false);
    }, hideDelayMs);
  };

  const openTooltip = () => {
    clearHideTimer();
    setPositioned(false);
    setOpen(true);
    setAnimationKey((k) => k + 1);
  };

  const closeTooltip = () => {
    clearHideTimer();
    setOpen(false);
  };

  const updatePosition = useCallback(() => {
    if (!iconRef.current || !tooltipRef.current) return;

    const iconRect = iconRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    const { top, left } = computePosition(
      iconRect,
      tooltipRect,
      tooltipPlacement,
      gap,
      viewportW,
      viewportH,
    );

    setCoords({ top, left });
    setPositioned(true);
  }, [tooltipPlacement, gap]);

  // Position when opening and on size/viewport changes
  useLayoutEffect(() => {
    if (!open) return;

    setPositioned(false);

    const raf = requestAnimationFrame(() => {
      updatePosition();

      if (tooltipRef.current && !resizeObsRef.current) {
        resizeObsRef.current = new ResizeObserver(() => updatePosition());
        resizeObsRef.current.observe(tooltipRef.current);
      }
    });

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
      if (resizeObsRef.current) {
        resizeObsRef.current.disconnect();
        resizeObsRef.current = null;
      }
    };
  }, [open, updatePosition]);

  // Clean timers on unmount
  useEffect(() => {
    return () => clearHideTimer();
  }, []);

  // Optional border animation reset
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => setAnimationKey((k) => k + 1), 1500);
    return () => window.clearTimeout(t);
  }, [open]);

  const handleIconEnter = () => {
    clearHideTimer();
    if (!open) openTooltip();
  };

  const handleIconLeave = () => {
    scheduleHide();
  };

  const handleIconClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!open) openTooltip();
    else closeTooltip();
    onClick?.();
  };

  const visible = open && positioned;

  return (
    <div id={id} className={cn("relative inline-flex items-center", className)}>
      <button
        ref={iconRef}
        type="button"
        aria-label="icon action"
        onClick={handleIconClick}
        onMouseEnter={handleIconEnter}
        onFocus={handleIconEnter}
        onMouseLeave={handleIconLeave}
        onBlur={handleIconLeave}
        className={cn("m-0 border-none bg-transparent p-0", iconClassName)}
        style={{ lineHeight: 0 }}
      >
        <Icon
          className={cn(
            "cursor-pointer transition-colors duration-200",
            {
              "text-gray-600 hover:text-orange-700": theme === Theme.LIGHT,
              "text-zinc-300 hover:text-orange-500": theme === Theme.DARK,
            },
            iconClassName,
          )}
        />
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={tooltipRef}
            onMouseEnter={clearHideTimer}
            onMouseLeave={scheduleHide}
            className={cn(
              "pointer-events-auto overflow-hidden rounded-md px-2 py-1 text-xs shadow-lg transition-opacity",
              {
                "bg-[#dbccc5] text-zinc-700": theme === Theme.LIGHT,
                "bg-[#5e5753] text-zinc-200": theme === Theme.DARK,
              },
              tooltipClassName,
            )}
            style={{
              position: "fixed",
              zIndex: 9999,
              maxWidth,
              minWidth: "max-content",
              whiteSpace: "normal",
              opacity: visible ? 1 : 0,
              visibility: visible ? "visible" : "hidden",
              top: coords?.top ?? -9999, // keep offscreen until positioned
              left: coords?.left ?? -9999,
            } as CSSProperties}
            role="tooltip"
            aria-hidden={!open}
          >
            {formatTooltipContent(content)}

            <span
              key={`anim-${animationKey}`}
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
          document.body,
        )}
    </div>
  );
};

export default IconWithTooltip;