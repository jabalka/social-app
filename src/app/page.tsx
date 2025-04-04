import { auth } from "@/auth";
import HomeButtons from "@/components/home-buttons";
import { redirect } from "next/navigation";
import type React from "react";
import { Suspense } from "react";

const Home: React.FC = async () => {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard"); 
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-white">
      <Suspense>
        <HomeButtons />
      </Suspense>
    </main>
  );
};

export default Home;
