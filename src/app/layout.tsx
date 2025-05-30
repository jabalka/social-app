import "@/assets/styles/index.css";
import "@/styles/leaflet.css";
import "leaflet/dist/leaflet.css";
import LayoutClient from "@/components/layouts/layout-client";
import Providers from "@/components/providers/providers";
import type { Metadata } from "next";
import type React from "react";
import { getCurrentUser } from "./actions/common.actions";

export const metadata: Metadata = {
  title: "Jabalka | Paul",
  description: "Demo app built with Next.js and Tailwind CSS",
};

const RootLayout: React.FC<React.PropsWithChildren> = async ({ children }) => {
  const user = await getCurrentUser();

  return (
    <Providers>
      <LayoutClient user={user}>{children}</LayoutClient>
    </Providers>
  );
};

export default RootLayout;
