"use client"

import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react";
import { useEffect } from "react";


const Dashboard: React.FC = () => {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      // Redirect or handle unauthenticated state
    }
  });

  useEffect(() => {
    console.log("Session:", session);
    console.log("Status:", status);
  }, [session, status]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-black text-white">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-6">Welcome to your Dashboard</h1>
        <p className="mb-8">You have successfully logged in!</p>
        <Link href="/">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">Back to Home</Button>
        </Link>
      </div>
    </main>
  )
}

export default Dashboard

