"use client";

import type { AuthUser } from "@/models/auth.types";
import { createContext, useContext, useEffect, useState } from "react";

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

  useEffect(() => {
    fetch("/api/auth/session")
      .then(res => res.json())
      .then(data => {
        if (data && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(err => {
        console.error("Failed to fetch user session:", err);
        setUser(null);
      });
  }, []);


  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

export const useSafeUser = (): Props => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useSafeUser must be used within a <UserProvider>");
  return context;
};
