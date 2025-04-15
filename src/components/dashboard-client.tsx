"use client";

import type { User } from "next-auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DashboardClientProps {
  user: User;
}

const DashboardClient: React.FC<DashboardClientProps> = ({ user }) => {
  return (
    <div className="w-full max-w-md text-center">
      <h1 className="text-3xl font-bold mb-6">Welcome {user.name ?? "User"}</h1>
      <p className="mb-8">You have successfully logged in!</p>
      <Link href="/">
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
          Back to Home
        </Button>
      </Link>
    </div>
  );
};

export default DashboardClient;
