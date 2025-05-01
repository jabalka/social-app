"use client";

import type { User } from "next-auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import dynamic from "next/dynamic";
import React from "react";
import { Project } from "./map-wrapper-viewer";

interface DashboardClientProps {
  user: User;
  projects: Project[];
}

const MapWrapper = dynamic(() => import("./map-wrapper-viewer"), { ssr: false });

const DashboardClient: React.FC<DashboardClientProps> = ({ user, projects }) => {
  return (
    <div className="sm:w-96 md:w-[768px] text-center ">
      <h1 className="text-3xl font-bold mb-6">Welcome {user.name ?? "User"}</h1>
      <p className="mb-8">You have successfully logged in!</p>
      <Link href="/">
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
          Back to Home
        </Button>
      </Link>

      <div className="h-[600px] w-full rounded border">
      <MapWrapper projects={projects} />
    </div>
    </div>
  );
};

export default DashboardClient;
