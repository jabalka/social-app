"use client";

import { useSafeThemeContext } from "@/context/safe-theme-context";
import { Theme } from "@/types/theme.enum";
import React, { useEffect, useState } from "react";


const WhatIsIt: React.FC = () => {
  const [animationKey, setAnimationKey] = useState<number>(0);
  const { theme } = useSafeThemeContext();

  useEffect(() => {
    if (animationKey === 0) return;

    const timeout = setTimeout(() => {
      setAnimationKey(0);
    }, 1500); // match animation duration (in ms)

    return () => clearTimeout(timeout);
  }, [animationKey]);

  return (

      <div className="group relative m-2 mb-20 overflow-hidden rounded-3xl p-[0px] "> {/*  duration-300 hover:scale-[1.04]  */}
        <div className="mx-auto rounded-3xl bg-gradient-to-b from-[#d9b8a71a] via-[#514e4d45] to-[#00000065] p-10 text-lg leading-relaxed backdrop-blur-md transition-all duration-300 hover:shadow-2xl">
          <h1 className="mb-6 text-center text-4xl font-bold">What is CivilDev?</h1>
          <p>
            CivilDev is an innovative civic engagement platform designed to bridge the gap between citizens and local
            administrations through transparent, digital communication. It offers a space where people can share ideas,
            express opinions, and participate in the development of their neighborhoods and cities.
          </p>
          <p className="mt-4">
            Residents can propose new projects, discuss ongoing initiatives, and highlight issues that need attention —
            all in one unified platform. When a suggestion gains enough support, local councils can respond with expert
            analysis and public data, fostering collaboration instead of conflict.
          </p>
          <p className="mt-4">
            More than a feedback tool, CivilDev promotes innovation, trust, and shared responsibility in shaping our
            cities&apos; future.
          </p>
          <span
            key={animationKey}
            className={
              `pointer-events-none absolute -inset-[0px] rounded-3xl ` +
              (theme === Theme.LIGHT
                ? "animate-snakeBorderHoverLight ring-2 ring-gray-300" 
                : "animate-snakeBorderHoverDark")
            }
          />
        </div>
      </div>


  );
};

export default WhatIsIt;
