"use client";

import FeatureCard from "@/components/PAGE-what-is-it/feature-card";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { BarChart3, Bell, FileText, Landmark, Lightbulb, MapPin, MessageCircle, Users } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const features = [
  {
    title: "Public Project Portal",
    description:
      "Councils can publish upcoming, ongoing, or completed projects with full details like location, budgets, timelines, and visuals.",
    icon: <Landmark className="h-10 w-10" />,
  },
  {
    title: "Citizen Proposals",
    description:
      "Any user can propose community initiatives. Other residents can upvote, discuss, and improve these proposals.",
    icon: <Lightbulb className="h-10 w-10" />,
  },
  {
    title: "Interactive Discussions",
    description: "Open comment sections and threaded replies create meaningful conversations around urban ideas.",
    icon: <MessageCircle className="h-10 w-10" />,
  },
  {
    title: "Integrated Voting Mechanism",
    description: "Vote for or against proposals. Admins can set thresholds that trigger further review or action.",
    icon: <Users className="h-10 w-10" />,
  },
  {
    title: "Administrative Dashboards",
    description: "Admins can track engagement, respond to feedback, and manage the platform through powerful tools.",
    icon: <BarChart3 className="h-10 w-10" />,
  },
  {
    title: "Real-time Messaging & Notifications",
    description: "Instant updates keep everyone informed about status changes, admin responses, or project milestones.",
    icon: <Bell className="h-10 w-10" />,
  },
  {
    title: "Transparent Change Logs",
    description: "Every update is logged visibly to build trust and show project progress.",
    icon: <FileText className="h-10 w-10" />,
  },
  {
    title: "Geolocation-based Engagement",
    description: "Residents can explore local projects filtered by area or current location.",
    icon: <MapPin className="h-10 w-10" />,
  },
];

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
            className="pointer-events-none absolute -inset-[0px] animate-snakeBorderHover rounded-3xl"
          />
        </div>
      </div>
      {/* Features Section */}
      <div className="space-y-10">
        {features.map((feature, i) => (
          <FeatureCard key={feature.title} {...feature} delay={i * 0.1} theme={theme} />
        ))}
      </div>
    </div>
  );
};

export default WhatIsIt;
