import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { Moon, Sun } from "lucide-react";
import React from "react";
import Ripple from "./ripple";

interface Props {
  theme: string;
  onClick?: () => void;
}

const ThemeSwitcher: React.FC<Props> = ({ theme, onClick }) => {
  return (
    <>
      <button
        type="button"
        data-active={theme === Theme.LIGHT}
        onClick={onClick}
        className={cn("group relative rounded-md p-2 ring-[#ff6913] focus-visible:outline-none focus-visible:ring-2", {
          "text-zinc-300": theme === Theme.DARK,
        })}
      >
        <Sun className={`group-data-[active="true"]:hidden`} />
        <Moon className={`hidden group-data-[active="true"]:block`} />
        <Ripple className="rounded-md" />
      </button>
    </>
  );
};

export default ThemeSwitcher;
