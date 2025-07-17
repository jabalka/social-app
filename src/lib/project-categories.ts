import {
    Building,
    Leaf,
    GraduationCap,
    ShieldCheck,
    Bus,
  } from "lucide-react";
  import type { LucideIcon } from "lucide-react";
  
  export interface ProjectCategory {
    id: string;
    name: string;
    icon: LucideIcon;
  }

  
  export const PROJECT_CATEGORIES: ProjectCategory[] = [
    {
      id: "infrastructure",
      name: "Infrastructure",
      icon: Building,
    },
    {
      id: "environmental",
      name: "Environmental",
      icon: Leaf,
    },
    {
      id: "education",
      name: "Education",
      icon: GraduationCap,
    },
    {
      id: "public-safety",
      name: "Public Safety",
      icon: ShieldCheck,
    },
    {
      id: "transport",
      name: "Transport",
      icon: Bus,
    },
  ];
  