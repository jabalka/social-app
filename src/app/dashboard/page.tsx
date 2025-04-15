import type React from "react";

import { auth } from "@/auth";
import DashboardClient from "@/components/dashboard-client";
import { redirect } from "next/navigation";

const DashboardPage: React.FC = async () => {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return <DashboardClient user={session.user} />;
};

export default DashboardPage;
