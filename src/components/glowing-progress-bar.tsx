import { Project } from "@/models/project";
import { cn } from "@/utils/cn.utils";
import React from "react";

interface Props {
  project?: Project;
  skeleton?: boolean
  className?: string;
}
const GlowingProgressBar: React.FC<Props> = ({ project, skeleton, className }) => {
  return (
    <div className={cn("relative overflow-hidden rounded-full shadow-inner", className)}>
      <div
        className="relative h-full rounded-full bg-gradient-to-r from-green-400 via-green-600 to-green-800 transition-all duration-300"
        style={!skeleton ? { width: `${project?.progress}%` } : { width: "85%" }}
      >
        {/* Glowing shimmer */}
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <div className="absolute h-full w-full animate-progressBarGlow bg-gradient-to-r from-transparent via-white to-transparent" />
        </div>
      </div>
    </div>
  );
};

export default GlowingProgressBar;
