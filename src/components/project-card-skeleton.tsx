// src/components/project-card-skeleton.tsx
import Image from "next/image";
import React from "react";
import DefaultProjectImage from "../../public/images/project-image-dedfault.png";
import GlowingProgressBar from "./glowing-progress-bar";

const ProjectCardSkeleton: React.FC<{ theme?: string }> = ({  }) => {
  return (
    <div className="flex h-[360px] w-full min-w-[340px] flex-col justify-between rounded border p-4 shadow animate-pulse">
      <div className="flex flex-col gap-3 md:flex-row">
        {/* LEFT COLUMN */}
        <div className="flex-1">
        <div className="mb-1 h-5 w-1/2 rounded bg-gray-300" />
          <div className="mb-2 h-4 w-full rounded bg-gray-200" />
          <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />

          {/* Categories */}
          <div className="mt-2 flex flex-wrap gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-5 w-5 rounded-full bg-gray-300" />
            ))}
          </div>
          {/* Progress */}
          <GlowingProgressBar skeleton={true} className="mt-3 h-3 w-full border border-gray-400" />
          <p className="mt-1 h-3 w-1/4 rounded bg-gray-200 justify-center" />

          {/* Button */}
          <div className="group relative mt-2 inline-flex w-44 overflow-hidden rounded-full p-[1px]">
            <div className="h-10 w-full rounded-full bg-gray-300" />
          </div>
        </div>

        {/* RIGHT COLUMN (Image) */}
        <div className="h-32 overflow-hidden rounded-2xl md:ml-6 md:h-auto md:w-1/3 flex-shrink-0 min-w-[120px] max-w-[240px]">
          <Image
            src={DefaultProjectImage}
            alt={`skeleton preview`}
            width={240}
            height={240}
            className="h-full w-full object-cover opacity-60"
          />
        </div>
      </div>

      {/* Bottom row: Likes & Comments */}
      <div className="mt-4 flex justify-between text-sm">
        <div className="flex flex-col items-center opacity-60">
          <span>❤️</span>
          <span className="text-xs">Likes</span>
        </div>
        <div className="flex flex-col items-center opacity-60">
          <span>💬</span>
          <span className="text-xs">Comments</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCardSkeleton;
