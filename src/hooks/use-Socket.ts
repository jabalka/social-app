import { initializeSocket } from "@/lib/socket-client";
import { AppSocket } from "@/models/socket";
import { getSession, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export const useSocket = (): AppSocket | null => {
  const [socket, setSocket] = useState<AppSocket | null>(null);
  const { data: session } = useSession();

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     const session = await getSession();
  //     if (session?.user && session.accessToken) {
  //       setIsAuthenticated(true);
  //     }
  //   };

  //   checkAuth();
  // }, []);

  // useEffect(() => {
  //   const initialize = async () => {
  //     const session = await getSession();
  //     const hasValidSession = !!session?.accessToken;
  //     setIsAuthenticated(hasValidSession);

  //     if (hasValidSession && !socket) {
  //       try {
  //         const s = await initializeSocket();
  //         setSocket(s);
  //       } catch (err) {
  //         console.error("Socket init error:", err);
  //       }
  //     }
  //   };

  //   initialize();
  // }, [socket]);

  // useEffect(() => {
  //   if (!isAuthenticated) return;

  //   const initSocket = async () => {
  //     try {
  //       const s = await initializeSocket();
  //       if (s) setSocket(s);
  //     } catch (err) {
  //       console.error("Failed to initialize socket:", err);
  //     }
  //   };
  //   initSocket();
  // }, [isAuthenticated]);

  // return socket;

  useEffect(() => {
    const initSocket = async () => {
      try {
        // Use both server-side user and client-side session
        const session = await getSession();
        if (session?.accessToken) {
          const s = await initializeSocket();
          setSocket(s);
        }
      } catch (err) {
        console.error("Socket init error:", err);
      }
    };

    initSocket();
  }, [session?.accessToken]); // Add session dependency

  return socket;
};
