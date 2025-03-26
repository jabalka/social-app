"use client";

import { useSafeTheme } from "@/hooks/use-safe-theme";
import React, { createContext, PropsWithChildren, useContext } from "react";

type SafeThemeContextType = {
  theme: string;
};

export const SafeThemeContext = createContext<SafeThemeContextType | undefined>(undefined);

export const useSafeThemeContext = (): SafeThemeContextType => {
  const context = useContext(SafeThemeContext);
  if (!context) {
    throw new Error("useSafeThemeContext must be used within a SafeThemeProvider");
  }
  return context;
};

interface Props {
  initialTheme: string;
}

export const SafeThemeProvider: React.FC<PropsWithChildren<Props>> = ({ initialTheme, children }) => {
  const theme = useSafeTheme(initialTheme);
  return <SafeThemeContext.Provider value={{ theme }}>{children}</SafeThemeContext.Provider>;
};
