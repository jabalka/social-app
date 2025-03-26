"use server";


import { DEFAULT_THEME } from "@/constants";
import { cookies } from "next/headers";

export const getServerInitialTheme = async () => {
  const readonlyCookies = await cookies();
  const themeCookie = readonlyCookies.get("theme");
  const theme = themeCookie?.value ?? DEFAULT_THEME;

  return theme;
};
