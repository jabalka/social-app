"use client";

import type { AuthUser } from "@/models/auth.types";
import { cn } from "@/utils/cn.utils";
import { LucideSquareStack, MessageCircleIcon, Settings, User, Users, Home } from "lucide-react";
import { usePathname } from "next/navigation";
import type React from "react";
import type { JSX } from "react/jsx-runtime";
import SidebarNavItem from "./sidebar-nav-item";

interface Props {
  user: AuthUser | null;
  theme: string;
  sidebarExpanded: boolean;
  className?: string;
  unreadMessages: number;
}

interface NavItem {
  icon: JSX.Element;
  label: string;
  href: string;
  showUnreadCount?: boolean;
}

const SidebarNavigation: React.FC<Props> = ({ theme, sidebarExpanded, className, unreadMessages }) => {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { icon: <Home className="h-5 w-5" />, label: "Home", href: "/dashboard" },
    { icon: <User className="h-5 w-5" />, label: "Profile", href: "/profile/dashboard" },
    { icon: <LucideSquareStack className="h-5 w-5" />, label: "My Projects", href: "/profile/projects" },
    {
      icon: <MessageCircleIcon className="h-5 w-5" />,
      label: "Messages",
      href: "/profile/messages",
      showUnreadCount: true,
    },
    { icon: <Users className="h-5 w-5" />, label: "Collaborations", href: "/profile/collaborations" },
    { icon: <Settings className="h-5 w-5" />, label: "Settings", href: "/profile/settings" },
  ];

  return (
    <nav className={cn(className)}>
      {navItems.map((item) => (
        <SidebarNavItem
          theme={theme}
          key={item.href}
          icon={item.icon}
          label={item.label}
          href={item.href}
          active={pathname!.startsWith(item.href)}
          sidebarExpanded={sidebarExpanded}
          unreadCount={item.showUnreadCount ? unreadMessages : 0}
        />
      ))}
    </nav>
  );
};

export default SidebarNavigation;
