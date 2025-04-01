import "@/assets/styles/index.css";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";
// import { AuthProvider } from "@/hooks/use-auth"
import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jabalka | Paul",
  description: "Demo app built with Next.js and Tailwind CSS",
};

const RootLayout: React.FC<React.PropsWithChildren> = async ({ children }) => {
  const session = await auth();
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <SessionProvider session={session}>{children}</SessionProvider>
          {/* <AuthProvider>{children}</AuthProvider> */}
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
