import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import React from "react";

interface Props {
  theme: string;
  active: boolean;
  className?: string;
  onClick: () => void;
}

const Hamburger: React.FC<Props> = ({ theme, active, className, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active}
      className={cn(
        "group relative flex h-9 w-9 rounded-md border ring-[#ff6913] focus-visible:outline-none focus-visible:ring-2",
        {
          "border-zinc-300 bg-gradient-to-br from-zinc-200 via-indigo-100 to-slate-300": theme === Theme.LIGHT,
          "border-zinc-700 bg-gradient-to-br from-zinc-900 via-indigo-950 to-slate-900": theme === Theme.DARK,
        },
        className,
      )}
    >
      <div className="m-auto">
        <div
          className={cn(
            `my-1 h-[2px] w-[1.375rem] rounded-[0.1875rem] transition-all group-data-[active="true"]:w-[0.625rem] group-data-[active="true"]:translate-x-[13px] group-data-[active="true"]:translate-y-[3px] group-data-[active="true"]:rotate-45`,
            {
              "bg-zinc-700": theme === Theme.LIGHT,
              "bg-white": theme === Theme.DARK,
            },
          )}
        ></div>

        <div
          className={cn(`my-1 h-[2px] w-[1.375rem] rounded-[0.1875rem] transition-all`, {
            "bg-zinc-700": theme === Theme.LIGHT,
            "bg-white": theme === Theme.DARK,
          })}
        ></div>

        <div
          className={cn(
            `my-1 h-[2px] w-[0.875rem] rounded-[0.1875rem] transition-all group-hover:w-[1.375rem] group-data-[active="true"]:w-[0.625rem] group-data-[active="true"]:-translate-y-[3px] group-data-[active="true"]:translate-x-[13px] group-data-[active="true"]:-rotate-45`,
            {
              "bg-zinc-700": theme === Theme.LIGHT,
              "bg-white": theme === Theme.DARK,
            },
          )}
        ></div>
      </div>
    </button>
  );
};

export default Hamburger;
