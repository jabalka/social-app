"use client";

import { cn } from "@/utils/cn.utils";
import { BarChart3, Coins, FileText, Flame, LayoutDashboard, Newspaper, Settings, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import React from "react";
import SidebarNavItem from "./sidebar-nav-item";
import { SafeUser } from "../layouts/layout-client";

interface Props {
  user: SafeUser | null;
  theme: string;
  sidebarExpanded: boolean;
  className?: string;
}

interface NavItem {
  icon: JSX.Element;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard", href: "/platform/dashboard" },
  { icon: <Coins className="h-5 w-5" />, label: "Staking", href: "/platform/staking" },
  { icon: <BarChart3 className="h-5 w-5" />, label: "Statuses", href: "/platform/statuses" },
  { icon: <FileText className="h-5 w-5" />, label: "Information", href: "/platform/information" },
  { icon: <Newspaper className="h-5 w-5" />, label: "News", href: "/platform/news" },
  { icon: <Flame className="h-5 w-5" />, label: "Burn", href: "/platform/burn" },
  { icon: <Users className="h-5 w-5" />, label: "My referrals", href: "/platform/referrals" },
  { icon: <Settings className="h-5 w-5" />, label: "Settings", href: "/platform/settings" },
];

const SidebarNavigation: React.FC<Props> = ({ theme, sidebarExpanded, className }) => {
  const pathname = usePathname();
  const items = [...navItems];

  return (
    <nav className={cn(className)}>
      {items.map((item) => (
        <SidebarNavItem
          theme={theme}
          key={item.href}
          icon={item.icon}
          label={item.label}
          href={item.href}
          active={pathname.startsWith(item.href)}
          sidebarExpanded={sidebarExpanded}
        />
      ))}
    </nav>
  );
};

export default SidebarNavigation;
