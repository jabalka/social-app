"use client";

import React, { useEffect, useState } from "react";

const ReportPage: React.FC = () => {
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
      <div className="mx-auto w-[350px] py-16">
       <div className={"relative overflow-hidden rounded-full shadow-inner h-3 w-full border-[1px] border-gray-400 bg-gray-200"}>
         <div
           className="relative h-full rounded-full bg-gradient-to-r from-green-400 via-green-600 to-green-800 transition-all duration-300"
           style={{ width: `${80}%` }}
         >
           {/* Glowing shimmer */}
           <div className="absolute inset-0 overflow-hidden rounded-full">
             <div className="absolute h-full w-full animate-progressBarGlow bg-gradient-to-r from-transparent via-white to-transparent" />
           </div>
         </div>
       </div>
      </div>
    </>
  );
};

export default ReportPage;

// {  "border-[2px] border-zinc-400": theme === Theme.LIGHT,
//   "border-[2px] border-zinc-700": theme === Theme.DARK,}
