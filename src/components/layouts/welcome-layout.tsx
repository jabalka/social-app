"use client";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import React, { PropsWithChildren } from "react";
import WelcomeHeader from "../menu/welcome-header";
import SiteFooter from "../site-footer/site-footer";

const WelcomeLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const { theme } = useSafeThemeContext();

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <WelcomeHeader />

        <div className="max-w-container flex flex-1 flex-col bg-black p-4 text-white">
          <main className="flex-1">
            <div>{children}</div>
          </main>
        </div>

        <SiteFooter theme={theme} />
      </div>
    </>
  );
};

export default WelcomeLayout;
