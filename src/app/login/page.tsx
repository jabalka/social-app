import { auth } from "@/auth";
import HomeButtons from "@/components/home-buttons";
import { redirect } from "next/navigation";
import type React from "react";
import { Suspense } from "react";

const LoginPage: React.FC = async () => {
  const session = await auth();

  // If user is authenticated, redirect to dashboard or preferred route
  if (session?.user) {
    redirect("/dashboard"); // Change this to your desired authenticated route
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-white">
      <Suspense>
        <HomeButtons />
      </Suspense>
    </main>
  );
};

export default LoginPage;
