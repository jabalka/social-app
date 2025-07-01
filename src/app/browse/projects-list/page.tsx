"use client";

import ProjectListOverview from "@/components/projects-list-overview";
import React from "react";

const ProjectsListPage: React.FC = () => {
  return (
    <>
      <div className="mx-auto max-w-7xl px-6 py-6">
      <div className="relative text-center">
      <h2 className="text-2xl font-bold">Projects</h2>
        <ProjectListOverview/>
      </div>
      </div>
    </>
  );
};

export default ProjectsListPage;
