"use client";

import IdeaCreateForm from "@/components/PAGE-create-idea/idea-create-form";
import IdeaList from "@/components/PAGE-create-idea/idea-list";
import React from "react";

const ShareIdeaPage: React.FC = () => {
  return (
    <>
      <div className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="text-3xl font-bold mb-6">Share an Idea for Your Area</h1>
      <IdeaCreateForm />
      <IdeaList />
      </div>
    </>
  );
};

export default ShareIdeaPage;
