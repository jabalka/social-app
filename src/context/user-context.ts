"use client";

import type { SafeUser } from "@/components/layouts/layout-client";
import { createContext, useContext } from "react";

export const UserContext = createContext<SafeUser | null>(null);

export const useSafeUser = () => {
  const user = useContext(UserContext);
  if (!user) {
    throw new Error("useSafeUser must be used within a <UserProvider>");
  }
  return user;
};
