"use client";

import BrowseIdeas from "@/components/browse-ideas";
import React from "react";

const IdeasListPage: React.FC = () => {
  return (
    <>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <BrowseIdeas/>
      </div>
    </>
  );
};

export default IdeasListPage;
