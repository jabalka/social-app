"use client"

import HomeButtons from "@/components/home-buttons";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { redirect } from "next/navigation";
import type React from "react";
import { Suspense, useEffect } from "react";

const Home: React.FC = () => {
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      redirect("/dashboard");
    }
  }, [status]);

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center md:flex-row md:items-start">
      <div className="mb-0 flex justify-center md:mb-0 md:mr-2 md:w-2/3">
        <Image
          src="/images/civ-dev-logo-white.png"
          alt="CivDev Logo"
          width={720}
          height={720}
          className="absolute left-20 top-48 w-full max-w-[120px] transition-all duration-300 hover:scale-105 md:relative md:left-0 md:top-0 md:max-w-[720px]"
          priority
        />
      </div>

      <div className="mb-14 flex w-full flex-col items-center md:mt-0 md:w-2/3 md:items-start">
        <Suspense>
          <HomeButtons />
        </Suspense>
      </div>
    </div>
  );
};

export default Home;
