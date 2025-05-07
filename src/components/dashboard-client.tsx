"use client";

import { Button } from "@/components/ui/button";
import { useProjectContext } from "@/context/project-context";
import { AuthUser } from "@/models/auth";
import dynamic from "next/dynamic";
import Link from "next/link";
import React from "react";

interface DashboardClientProps {
  user: AuthUser;
}

const MapWrapper = dynamic(() => import("./map-wrapper-viewer"), { ssr: false });

const DashboardClient: React.FC<DashboardClientProps> = ({ user }) => {
  const { projects, refreshProjects } = useProjectContext();
  return (
    <div className="text-center sm:w-96 md:w-[768px]">
      <h1 className="mb-6 text-3xl font-bold">Welcome {user.name ?? "User"}</h1>
      <p className="mb-8">You have successfully logged in!</p>
      <Link href="/">
        <Button className="bg-blue-500 text-white hover:bg-blue-600">Back to Home</Button>
      </Link>

      <div className="h-[600px] w-full rounded border">
        <MapWrapper user={user} projects={projects} refreshProjects={refreshProjects} />
      </div>
    </div>
  );
};

export default DashboardClient;
