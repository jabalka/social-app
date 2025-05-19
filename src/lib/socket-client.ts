import { io } from "socket.io-client";
import { getSession } from "next-auth/react";
import { AppSocket } from "@/models/socket";

let socket: AppSocket | null = null;

export const initializeSocket = async (): Promise<AppSocket | null> => {
  // Create socket if not already connected
  if (socket && socket.connected) return socket;

  try {
    const session = await getSession();
    if (!session?.user?.email) {
      console.error("Not authenticated, cannot initialize socket.");
      return null;
    }

    socket = io({
      path: "/api/socket",
      auth: { token: session.user.email },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 5000, // Increase if needed
    }) as AppSocket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket!.id);
    });

    socket.on("connect_error", (err: Error) => {
      console.error("Socket connection error:", err.message);
    });

    socket.on("disconnect", (reason: string) => {
      console.warn("Socket disconnected:", reason);
    });

    return socket;
  } catch (error) {
    console.error("Socket initialization failed:", error);
    return null;
  }
};