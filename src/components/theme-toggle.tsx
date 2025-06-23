// components/ThemeToggle.tsx
"use client";

import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

interface Props {
  theme: string;
  onClick?: () => void;
  className?: string;
}

const ThemeToggle: React.FC<Props> = ({ theme, onClick, className }) => {
  const isDark = theme === Theme.DARK;
  const [animationKey, setAnimationKey] = useState<number>(0);

  useEffect(() => {
    if (animationKey === 0) return;

    const timeout = setTimeout(() => {
      setAnimationKey(0);
    }, 1500); // match animation duration (in ms)

    return () => clearTimeout(timeout);
  }, [animationKey]);

  return (
    <>
      <div className={`${className} group relative inline-flex w-[49px] overflow-hidden rounded-full p-[4px]`}>
        <Button
          type="button"
          aria-label="Toggle theme"
          onClick={onClick}
          className={cn(
            "relative h-[20px] w-full rounded-full outline outline-2 outline-offset-[2px] outline-white transition-all duration-300 hover:outline hover:outline-2",
            isDark ? "bg-[#6f6561c4] hover:outline-[#3c2f27]" : "bg-[#bda69c66] hover:outline-[#3c2f27]",
          )}
        >
          <span
            className={cn(
              "absolute left-[0px] top-[0px] flex h-5 w-5 items-center justify-center rounded-full transition-all duration-300",
              isDark ? "translate-x-[21px] bg-black text-white" : "translate-x-0 bg-white text-black",
            )}
          >
            {isDark ? <Moon size={16} /> : <Sun size={16} />}
          </span>
          <span
            key={animationKey}
            className={cn("pointer-events-none absolute -inset-[4px] rounded-full", {
              "group-hover:animate-snakeBorderHoverLight": theme === Theme.LIGHT,
              "group-hover:animate-snakeBorderHoverDark": theme === Theme.DARK,
            })}
          />
        </Button>
      </div>
    </>
  );
};

export default ThemeToggle;
