"use client";

import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { motion } from "motion/react";
import Link from "next/link";

interface Props {
  theme: string;
  icon: JSX.Element;
  label: string;
  href: string;
  active: boolean;
  sidebarExpanded: boolean;
  className?: string;
}

const SidebarNavItem: React.FC<Props> = ({ theme, icon, label, active, href, sidebarExpanded, className }) => {
  return (
    <Link
      href={href}
      className={cn("flex rounded-lg focus-visible:outline-none focus-visible:ring-2", {
        "ring-[#ff6913]": theme === Theme.LIGHT,
        "ring-zinc-950": theme === Theme.LIGHT && active,
        "ring-white": theme === Theme.DARK,
      })}
    >
      <motion.div
        initial={{ width: sidebarExpanded ? "100%" : "2.75rem" }}
        animate={{ width: sidebarExpanded ? "100%" : "2.75rem" }}
        transition={{ duration: 0.15, ease: "linear" }}
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
        <div className="flex-shrink-0">{icon}</div>

        <motion.span
          initial={{ width: sidebarExpanded ? "auto" : 0 }}
          animate={{ width: sidebarExpanded ? "auto" : 0 }}
          transition={{ duration: 0.15, ease: "linear" }}
          className="overflow-hidden overflow-ellipsis whitespace-nowrap"
        >
          {label}
        </motion.span>
      </motion.div>
    </Link>
  );
};

export default SidebarNavItem;
