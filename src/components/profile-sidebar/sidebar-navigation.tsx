"use client";

import { cn } from "@/utils/cn.utils";
import { LucideSquareStack, MessageCircleIcon, Settings, User, Users } from "lucide-react";
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
  { icon: <User className="h-5 w-5" />, label: "Profile", href: "/profile/dashboard" },
  { icon: <LucideSquareStack className="h-5 w-5" />, label: "My Projects", href: "/profile/projects" },
  { icon: <MessageCircleIcon className="h-5 w-5" />, label: "Messages", href: "/profile/messages" },
  { icon: <Users className="h-5 w-5" />, label: "Collaborations", href: "/profile/collaborations" },
  { icon: <Settings className="h-5 w-5" />, label: "Settings", href: "/profile/settings" },
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
