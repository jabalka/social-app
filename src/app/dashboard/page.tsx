"use client"

import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { redirect } from "next/navigation";


const Dashboard: React.FC = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/");
    }
  }, [status]);

  useEffect(() => {
    console.log("Session:", session);
    console.log("Status:", status);
  }, [session, status]);


  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p>Loading...</p>
      </main>
    );
  }

  return (
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-6">Welcome {session?.user?.name ?? "User"}</h1>
        <p className="mb-8">You have successfully logged in!</p>
        <Link href="/">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">Back to Home</Button>
        </Link>
      </div>

  )
}

export default Dashboard

