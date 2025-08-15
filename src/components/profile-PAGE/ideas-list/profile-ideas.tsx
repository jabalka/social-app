"use client";

import React, { useState } from "react";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import IdeaListOverview from "@/components/idea-list-overview";
import IdeaListOverviewModal from "@/components/idea-list-overview-modal";

const ProfileIdeas: React.FC = () => {
  const { theme } = useSafeThemeContext();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Wrap the area that needs ideas with IdeaProvider (or put this provider at app root) */}
        <div className="px-6 py-6">
          <button
            onClick={() => setOpen(true)}
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Browse Ideas (Modal)
          </button>
        <IdeaListOverviewModal open={open} onClose={() => setOpen(false)} theme={theme} />
        </div>


        <div className="mx-auto max-w-7xl px-6 py-6">
          <h2 className="text-center text-2xl font-bold">Ideas</h2>
          <IdeaListOverview />
        </div>
    </>
  );
};

export default ProfileIdeas;