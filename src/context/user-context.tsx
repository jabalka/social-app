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
}> = ({ initialUser, children }) => {
  const [user, setUser] = useState<AuthUser | null>(initialUser);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/user/session-user")
     .then((res) => (res.ok ? res.json() : null))
     .then((data: AuthUser | null) => {
      if (cancelled) return;
      if (data) {
        setUser(data);
        } else {
          // setUser(null);
        }
      })
      .catch(err => {
        console.error("Failed to fetch user session:", err);
        // setUser(null);
      });
      return () => {
        cancelled = true;
      };
  }, []);


  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

export const useSafeUser = (): Props => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useSafeUser must be used within a <UserProvider>");
  return context;
};
