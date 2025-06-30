"use client";

import FeatureCard from "@/components/PAGE-what-is-it/feature-card";
import WhatIsIt from "@/components/what-is-it";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { features } from "@/lib/features-data";
import Image from "next/image";
import React from "react";

const WhatIsItPage: React.FC = () => {
  const { theme } = useSafeThemeContext();
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      {/* Image Container */}
      <div className="relative mb-10 flex items-center justify-center">
        {/* Image Container */}
        <div className="relative z-10 rounded-3xl border border-white/10 bg-white/10 p-4 shadow-xl backdrop-blur-md">
          <Image
            src="/images/urban-work-background.jpg"
            alt="CivilDev Urban Background"
            width={720}
            height={720}
            className="rounded-2xl"
            priority
          />
        </div>
      </div>

      {/* Main Introduction */}
      <WhatIsIt />
      {/* Features Section */}
      <div className="space-y-10">
        {features.map((feature, i) => (
          <FeatureCard key={feature.title} {...feature} delay={i * 0.1} theme={theme} />
        ))}
      </div>
    </div>
  );
};

export default WhatIsItPage;
