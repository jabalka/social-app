import type React from "react";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CreateProjectForm from "@/components/create-project-form";

const CreateProjectPage: React.FC = async () => {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return(
    <>
          <div className="mx-auto max-w-7xl px-6 py-16">
            <h1 className="mb-6 text-3xl font-bold">Create a Project Your Area</h1>
            <CreateProjectForm />
            {/* <IdeaList /> */}
          </div>

    </> 
  );
};

export default CreateProjectPage;
