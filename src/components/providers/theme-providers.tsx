import { ThemeProvider } from "next-themes";
import React, { PropsWithChildren } from "react";

const ThemeProviders: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
};

export default ThemeProviders;
