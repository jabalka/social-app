"use client";

import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { motion } from "framer-motion";
import Link from "next/link";

interface Props {
  theme: string;
  icon: JSX.Element;
  label: string;
  href: string;
  active: boolean;
  sidebarExpanded: boolean;
  className?: string;
  unreadCount?: number;
}

const SidebarNavItem: React.FC<Props> = ({
  theme,
  icon,
  label,
  active,
  href,
  sidebarExpanded,
  className,
  unreadCount = 0,
}) => {
  return (
    <Link
      href={href}
      className={cn("group relative flex rounded-lg focus-visible:outline-none focus-visible:ring-2", {
        "ring-[#ff6913]": theme === Theme.LIGHT,
        "ring-zinc-950": theme === Theme.LIGHT && active,
        "ring-white": theme === Theme.DARK,
      })}
    >
      <motion.div
        initial={{ width: sidebarExpanded ? "100%" : "2.75rem" }}
        animate={{ width: sidebarExpanded ? "100%" : "2.75rem" }}
        transition={{ duration: 0.15, ease: "easeInOut" }}
        className={cn(
          "flex min-w-[2.75rem] items-center gap-2 rounded-lg px-3 py-2 transition-colors",
          {
            "text-zinc-950 hover:bg-[#ff6913] hover:text-white": theme === Theme.LIGHT,
            "bg-[#ff6913] text-white": theme === Theme.LIGHT && active,
            "text-zinc-400 hover:bg-zinc-800 hover:text-[#ff6913]": theme === Theme.DARK,
            "bg-zinc-800 text-[#ff6913]": theme === Theme.DARK && active,
          },
          className,
        )}
      >
        <div className="relative flex-shrink-0">
          {icon}

          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border border-white bg-red-500 dark:border-zinc-900" />
          )}

          {!sidebarExpanded && (
            <div
              className={cn(
                "pointer-events-none absolute left-full top-1/2 z-50 ml-4 -translate-y-1/2 whitespace-nowrap rounded px-2 py-1 text-xs font-semibold opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100",
                {
                  "bg-[#dbccc5] text-zinc-700": theme === Theme.LIGHT,
                  "bg-[#5e5753] text-zinc-200": theme === Theme.DARK,
                },
              )}
            >
              {label}
            </div>
          )}
        </div>

        {sidebarExpanded && (
          <motion.span
            initial={{ width: 0 }}
            animate={{ width: "auto" }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className={cn("overflow-hidden overflow-ellipsis whitespace-nowrap")}
          >
            {label}
            {unreadCount > 0 && (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </motion.span>
        )}
      </motion.div>
    </Link>
  );
};

export default SidebarNavItem;
