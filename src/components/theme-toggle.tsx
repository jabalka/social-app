// components/ThemeToggle.tsx
"use client";

import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { Moon, Sun } from "lucide-react";

interface Props {
  theme: string;
  onClick?: () => void;
}

const ThemeToggle: React.FC<Props> = ({ theme, onClick }) => {
  const isDark = theme === Theme.DARK;

  return (
<button
      type="button"
      aria-label="Toggle theme"
      onClick={onClick}
      className={cn(
        " relative h-[20px] w-[49px] rounded-full outline outline-1 outline-white outline-offset-[3px] transition-all duration-300 hover:outline-[#FF5C00] hover:outline-2",
        isDark ? "bg-[#443d3a]" : "bg-[#bda69c]"
      )}
    >
      <span
        className={cn(
          "absolute top-[0px] left-[0px] h-5 w-5 rounded-full flex items-center justify-center transition-all duration-300",
          isDark
            ? "translate-x-[28px] bg-black text-white"
            : "translate-x-0 bg-white text-yellow-500"
        )}
      >
        {isDark ? <Moon size={16} /> : <Sun size={16} />}
      </span>
    </button>
  );
};

export default ThemeToggle;
