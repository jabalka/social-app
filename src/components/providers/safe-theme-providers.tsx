import { getServerInitialTheme } from "@/actions/theme.actions";
import { SafeThemeProvider } from "@/context/safe-theme-context";

import React, { PropsWithChildren } from "react";

const SafeThemeProviders: React.FC<PropsWithChildren> = async ({ children }) => {
  const initialTheme = await getServerInitialTheme();
  return <SafeThemeProvider initialTheme={initialTheme}>{children}</SafeThemeProvider>;
};

export default SafeThemeProviders;
