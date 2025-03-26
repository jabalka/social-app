import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const useSafeTheme = (initialTheme: string) => {
  const { resolvedTheme } = useTheme();

  const [theme, setTheme] = useState<string>(initialTheme);

  useEffect(() => {
    setTheme(resolvedTheme ?? initialTheme);
  }, [resolvedTheme, initialTheme]);

  return theme;
};
