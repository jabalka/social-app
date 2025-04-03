"use client";

import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { User } from "@prisma/client";
import React from "react";
import SidebarLogo from "./sidebar-logo";
import SidebarNavigation from "./sidebar-navigation";

interface SidebarProps {
  user: User | null;
  theme: string;
  sidebarExpanded: boolean;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ user, theme, sidebarExpanded, className }) => {
  return (
    <aside
      className={cn(
        "flex flex-col border-r relative",
        {
          "border-zinc-300 bg-zinc-100": theme === Theme.LIGHT,
          "border-zinc-700 bg-zinc-900": theme === Theme.DARK,
        },
        className,
      )}
    >
        <div className={cn(
    "absolute -left-px top-0 bottom-0 w-2",
    {
      "bg-zinc-300": theme === Theme.LIGHT,
      "bg-[#2b2725]": theme === Theme.DARK,
    }
  )} />

      <SidebarLogo className="mb-2 flex justify-center p-4" />

      <SidebarNavigation
        user={user}
        theme={theme}
        sidebarExpanded={sidebarExpanded}
        className="my-6 flex flex-col gap-2 px-[1.125rem]"
      />
    </aside>
  );
};

export default Sidebar;
