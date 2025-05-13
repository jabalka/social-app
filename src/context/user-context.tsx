// src/context/user-context.ts
"use client";

import { createContext, useContext, useState } from "react";
import type { AuthUser } from "@/models/auth";

interface Props {
  user: AuthUser | null;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
}

export const UserContext = createContext<Props | undefined>(undefined);

export const UserProvider: React.FC<{
  initialUser: AuthUser | null;
  children: React.ReactNode;
}> = ({ initialUser: initialUser, children }) => {
  const [user, setUser] = useState<AuthUser | null>(initialUser);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useSafeUser = (): Props => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useSafeUser must be used within a <UserProvider>");
  return context;
};
