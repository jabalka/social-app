import type React from "react";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import DashboardClient from "@/components/dashboard-client";
import { redirect } from "next/navigation";

const DashboardPage: React.FC = async () => {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const projects = await prisma.project.findMany({
    where: { authorId: session.user.id },
    select: { id: true, title: true, latitude: true, longitude: true },
  });

  return <DashboardClient user={session.user} projects={projects} />;
};

export default DashboardPage;
