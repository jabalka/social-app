// components/ThemeToggle.tsx
"use client";

import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { Moon, Sun } from "lucide-react";

interface Props {
  theme: string;
  onClick?: () => void;
  className: string;
}

const ThemeToggle: React.FC<Props> = ({ theme, onClick, className }) => {
  const isDark = theme === Theme.DARK;

  return (
    <div className={className}>
      <button
        type="button"
        aria-label="Toggle theme"
        onClick={onClick}
        className={cn(
          "relative h-[20px] w-[49px] rounded-full outline outline-1 outline-offset-[3px] outline-white transition-all duration-300 hover:outline-2 hover:outline-[#FF5C00]",
          isDark ? "bg-[#6f6561c4]" : "bg-[#bda69c66]",
        )}
      >
        <span
          className={cn(
            "absolute left-[0px] top-[0px] flex h-5 w-5 items-center justify-center rounded-full transition-all duration-300",
            isDark ? "translate-x-[28px] bg-black text-white" : "translate-x-0 bg-white text-black",
          )}
        >
          {isDark ? <Moon size={16} /> : <Sun size={16} />}
        </span>
      </button>
    </div>
  );
};

export default ThemeToggle;
