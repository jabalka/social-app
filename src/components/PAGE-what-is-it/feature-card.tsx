"use client";

import { Theme } from "@/types/theme.enum";
import { cn } from "@/utils/cn.utils";
import { motion, useInView } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  delay?: number;
  theme?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, theme }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-10% 0px -10% 0px", amount: "some" });

  const [animationKey, setAnimationKey] = useState<number>(0);

  useEffect(() => {
    if (animationKey === 0) return;

    const timeout = setTimeout(() => {
      setAnimationKey(0);
    }, 1500); // match animation duration (in ms)

    return () => clearTimeout(timeout);
  }, [animationKey]);

  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6 }}
      className={cn("group relative m-2 overflow-hidden rounded-3xl p-[0px] shadow-2xl")}
    >
      <motion.div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-between gap-6 rounded-3xl bg-gradient-to-b from-[#d9b8a71a] via-[#514e4d45] to-[#00000063] p-8 text-center backdrop-blur-md md:flex-row md:text-left",
          {
            "border-[2px] border-zinc-400": theme === Theme.LIGHT,
            "border-[2px] border-zinc-700": theme === Theme.DARK,
          },
        )}
      >
        <div className="flex-shrink-0">{icon}</div>
        <div className="w-full flex-1">
          <h3 className="text-2xl font-semibold">{title}</h3>
          <p className="mt-2">{description}</p>
        </div>
        <span
          key={animationKey}
          className="pointer-events-none absolute -inset-[2px] rounded-3xl group-hover:animate-snakeBorderHover"
        />
      </motion.div>
    </motion.div>
  );
};

export default FeatureCard;

// "w-full relative h-[20px]  rounded-full  hover:outline outline outline-2 outline-offset-[2px] outline-white transition-all duration-300 hover:outline-2 ",
// isDark ? "bg-[#6f6561c4] hover:outline-[#3c2f27]" : "bg-[#bda69c66] hover:outline-[#3c2f27]",

//   className={cn("max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6", {
//     "bg-[#f0e3dd] text-zinc-700": theme === Theme.LIGHT,
//     "bg-[#332f2d] text-zinc-200": theme === Theme.DARK,
//   })}
