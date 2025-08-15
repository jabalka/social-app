"use client";

import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import React, { useEffect, useState } from "react";

export interface TopTabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badgeCount?: number;
  theme?: string;
}

interface TopTabsProps {
  tabs: TopTabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  theme?: string;
}

const TopTabs: React.FC<TopTabsProps> = ({ tabs, activeKey, onChange, theme }) => {
  const [animationKey, setAnimationKey] = useState<number>(0);

  // Restart the animation whenever the active tab changes
  useEffect(() => {
    setAnimationKey((k) => k + 1);
  }, [activeKey]);

  // Optional: clear the animation key after a while to allow retrigger on hover if needed
  // useEffect(() => {
  //   if (animationKey === 0) return;
  //   const timeout = setTimeout(() => setAnimationKey(0), 1500);
  //   return () => clearTimeout(timeout);
  // }, [animationKey]);

  return (
    <div className="w-full">
      <div
        role="tablist"
        className={cn(
          "flex items-end gap-2 border-b",
          {
            "border-zinc-300/70": theme === Theme.LIGHT,
            "border-zinc-700/70": theme === Theme.DARK,
          }
        )}
      >
        {tabs.map((t) => {
          const active = t.key === activeKey;

          return (
            <div
              key={t.key}
              className="group relative inline-flex rounded-t-xl"
            >
              <button
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => !t.disabled && onChange(t.key)}
                disabled={t.disabled}
                className={cn(
                  "relative -mb-[1px] select-none rounded-t-xl px-4 py-2 text-sm font-medium transition-colors",
                  "border overflow-hidden ", 
                  active ? "border-b-transparent" : "",
                  {
                    "bg-[#fbe8e0] text-zinc-700 border-transparent hover:bg-[#c8b3aa]": theme === Theme.LIGHT && !active,
                    "bg-[#dfc9bf] text-zinc-800 border-zinc-300 shadow-sm": theme === Theme.LIGHT && active,
                    "bg-[#443d3a] text-zinc-200 border-transparent hover:bg-[#bda69c]": theme === Theme.DARK && !active,
                    "bg-[#72645f] text-zinc-300 border-zinc-700 shadow-sm": theme === Theme.DARK && active,
                  }
                )}
              >
                <span className="inline-flex items-center gap-2">
                  {t.icon && <span className="shrink-0">{t.icon}</span>}
                  <span>{t.label}</span>
                  {typeof t.badgeCount === "number" && (
                    <span
                      className={cn(
                        "inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1 text-xs",
                        {
                          "bg-zinc-200 text-zinc-700": theme === Theme.LIGHT,
                          "bg-zinc-700 text-zinc-100": theme === Theme.DARK,
                        }
                      )}
                    >
                      {t.badgeCount}
                    </span>
                  )}
                </span>

                <span
                  key={`${t.key}-${animationKey}`}
                  className={cn(
                    "pointer-events-none absolute inset-0 rounded-t-xl", // inset-0 aligns exactly with the button edges
                    {
                      // Always animate when active
                      "animate-snakeBorderHoverLight": theme === Theme.LIGHT && active,
                      "animate-snakeBorderHoverDark": theme === Theme.DARK && active,
                      // Otherwise animate on hover
                      // "group-hover:animate-snakeBorderHoverLight": theme === Theme.LIGHT && !active,
                      // "group-hover:animate-snakeBorderHoverDark": theme === Theme.DARK && !active,
                    }
                  )}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopTabs;