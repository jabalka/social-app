import { useState, useEffect } from "react";
import { initializeSocket } from "@/lib/socket-client";
import { AppSocket } from "@/models/socket";

export const useSocket = (): AppSocket | null => {
  const [socket, setSocket] = useState<AppSocket | null>(null);

  useEffect(() => {
    // Call the API to force initialization of the socket server
    const initSocket = async () => {
      try {
        await fetch("/api/socket");
        const s = await initializeSocket();
        if (s) setSocket(s);
      } catch (err) {
        console.error("Failed to initialize socket:", err);
      }
    };
    initSocket();
  }, []);

  return socket;
};