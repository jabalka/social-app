import { auth } from "@/auth";
import IdeaCreateForm from "@/components/PAGE-create-idea/idea-create-form";
// import IdeaList from "@/components/PAGE-create-idea/idea-list";
import { redirect } from "next/navigation";
import React from "react";

const ShareIdeaPage: React.FC = async () => {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }
  return (
    <>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h1 className="mb-6 text-3xl font-bold">Share an Idea for Your Area</h1>
        <IdeaCreateForm />
        {/* <IdeaList /> */}
      </div>
    </>
  );
};

export default ShareIdeaPage;
