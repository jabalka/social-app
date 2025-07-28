"use client";

import React from "react";
import Loader from "./loader";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { cn } from "@/utils/cn.utils";
import { Theme } from "@/types/theme.enum";
import { Z_INDEX } from "@/constants";


const LoaderModal: React.FC = () => {
    
    const {theme} = useSafeThemeContext()

   return (
  <div className={cn(`fixed inset-0 flex items-center justify-center z-[${Z_INDEX.LOADER}]` , {
          "bg-black bg-opacity-70": theme === Theme.LIGHT,
                "bg-black bg-opacity-50": theme === Theme.DARK,
  })}>
    <Loader theme={theme} />
  </div>
)};

export default LoaderModal;