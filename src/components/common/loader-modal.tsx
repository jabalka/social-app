"use client";

import React, { useEffect } from "react";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { cn } from "@/utils/cn.utils";
import { Theme } from "@/types/theme.enum";
import { Z_INDEX } from "@/constants";
import { createPortal } from "react-dom";
import Loader from "./loader";

const LoaderModal: React.FC = () => {
  const { theme } = useSafeThemeContext();

  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  const overlay = (
    <div
      className={cn("fixed inset-0 flex items-center justify-center", {
        "bg-black/70": theme === Theme.LIGHT,
        "bg-black/50": theme === Theme.DARK,
      })}
      style={{ zIndex: Z_INDEX.LOADER }}
      role="progressbar"
      aria-busy="true"
      aria-live="polite"
    >
      <Loader theme={theme} />
    </div>
  );

  return createPortal(overlay, document.body);
};

export default LoaderModal;