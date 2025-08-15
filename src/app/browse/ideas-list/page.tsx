"use client";

import IdeaListOverview from "@/components/idea-list-overview";
import React from "react";

const IdeasListPage: React.FC = () => {
  return (
    <>
      <div className="mx-auto max-w-7xl px-6 py-6">
      <div className="relative text-center">
      <h2 className="text-2xl font-bold">Projects</h2>
      
      <IdeaListOverview/>
      </div>
      </div>
    </>
  );
};

export default IdeasListPage;
