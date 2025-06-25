"use client";

import { useSafeThemeContext } from "@/context/safe-theme-context";
import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import React, { useEffect, useState } from "react";
import { Toast } from "react-hot-toast";

interface CustomToastProps {
  t: Toast;
  message: string;
}

const CustomToast: React.FC<CustomToastProps> = ({ t, message }) => {
  const { theme } = useSafeThemeContext();

  const [animationKey, setAnimationKey] = useState<number>(0);

  useEffect(() => {
    if (animationKey === 0) return;

    const timeout = setTimeout(() => {
      setAnimationKey(0);
    }, 1500); // match animation duration (in ms)

    return () => clearTimeout(timeout);
  }, [animationKey]);

  return (
    <div className="absolute overflow-hidden rounded-lg mt-20">
      <div
        className={cn(
          "relative flex min-w-[320px] items-center justify-center rounded-lg px-4 py-3 font-medium text-white shadow backdrop-blur-md",
          {
            "border-[#b8a299] bg-gradient-to-br from-[#57504d85] via-[#57504dc1] to-[#57504dce] text-zinc-100":
              theme === Theme.LIGHT,
            "border-[#72645f] bg-gradient-to-br from-[#6d6c6cd9] via-[#4a4a4aa8] to-[#4d4d4ddd] text-zinc-300":
              theme === Theme.DARK,
          },
        )}
        style={{
          minWidth: 320,
     
        }}
      >
        <span>{message}</span>
        <button
          onClick={() => window.toast.dismiss(t.id)}
          className="absolute right-2 top-0 text-lg hover:text-gray-100"
          aria-label="Close"
          type="button"
        >
          ×
        </button>
        <span
          key={animationKey}
          className={cn("pointer-events-none absolute -inset-[0px] z-20 rounded-lg", {
            "animate-snakeBorderGreen1sLight": theme === Theme.LIGHT,
            "animate-snakeBorderGreen1s": theme === Theme.DARK,
          })}
        />
      </div>
    </div>
  );
};

export default CustomToast;
