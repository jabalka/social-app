"use client"

import React, { useState } from "react";

import ProjectListOverview from "../../project-list-overview";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import ProjectListOverviewModal from "@/components/project-list-overview-modal";

const ProfileProjects: React.FC = () => {
  const { theme } = useSafeThemeContext();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  return (
    <>
        <div>
      <button 
        onClick={() => setIsProjectModalOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        View Projects
      </button>
      
      <ProjectListOverviewModal
        open={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        theme={theme}
        showOwnedOnly={false} 
        />
    </div>
    <div className="mx-auto max-w-7xl px-6 py-6">
      <div className="relative text-center">
      <h2 className="text-2xl font-bold">Projects</h2>
      
      <ProjectListOverview showOwnedOnly={true}/>
      </div>
      </div>
    </>
  );
};

export default ProfileProjects;
