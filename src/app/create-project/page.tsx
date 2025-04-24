import type React from "react";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CreateProjectForm from "@/components/create-project-form";

const CreateProjectPage: React.FC = async () => {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return <CreateProjectForm />;
};

export default CreateProjectPage;
