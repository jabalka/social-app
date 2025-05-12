import {
    User,
    UserCog,
    Gavel,
    Users,
    Compass,
    CheckCircle2,
  } from "lucide-react";
  import type { LucideIcon } from "lucide-react";
  
  export interface UserRole {
    id: string;
    name: string;
    icon: LucideIcon;
  }
  
  export const USER_ROLES: UserRole[] = [
    {
      id: "citizen",
      name: "Citizen",
      icon: User,
    },
    {
      id: "admin",
      name: "Admin",
      icon: UserCog,
    },
    {
      id: "mayor",
      name: "Mayor",
      icon: Gavel,
    },
    {
      id: "council",
      name: "Council",
      icon: Users,
    },
    {
      id: "planner",
      name: "Planner",
      icon: Compass,
    },
    {
      id: "inspector",
      name: "Inspector",
      icon: CheckCircle2,
    },
  ];
  