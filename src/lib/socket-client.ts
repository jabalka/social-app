import { AppSocket } from "@/models/socket";
import { getSession } from "next-auth/react";
import { io } from "socket.io-client";

let socketInstance: AppSocket | null = null;
let isInitializing = false;
let initPromise: Promise<AppSocket | null> | null = null;

export const initializeSocket = async (): Promise<AppSocket | null> => {
  console.log("[socket-client] Start socket initialization...");
  if (isInitializing && initPromise) {
    console.log("[socket-client] Initialization already in progress");
    return initPromise;
  }

  if (socketInstance && socketInstance.connected) {
    console.log("[socket-client] Already connected");
    return socketInstance;
  }

  isInitializing = true;
  // Create a new promise for initialization
  initPromise = new Promise(async (resolve) => {
    try {
      const session = await getSession();
      console.log("[socket-client] Session:", session);

      if (!session?.user || !session.accessToken) {
        console.log("[socket-client] No session or accessToken available");
        isInitializing = false;
        resolve(null);
        return;
      }

      // Only disconnect if we have an existing socket that's not connected
      if (socketInstance && !socketInstance.connected) {
        console.log("[socket-client] Cleaning up disconnected socket");
        socketInstance.disconnect();
        socketInstance = null;
      }

      // If we already have a connected socket, return it
      if (socketInstance && socketInstance.connected) {
        isInitializing = false;
        resolve(socketInstance);
        return;
      }

      console.log("[socket-client] Creating new socket connection");
      socketInstance = io("http://localhost:5000", {
        auth: { token: session.accessToken },
        transports: ["websocket"],
        withCredentials: true,
        reconnection: true,
        autoConnect: false,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        timeout: 5000,
      }) as AppSocket;

      if (session.accessToken) {
        socketInstance.auth = { token: session.accessToken };
        socketInstance.connect();
      }

      socketInstance.on("connect", () => {
        console.log("[socket-client] Socket connected:", socketInstance!.id);
        isInitializing = false;
        resolve(socketInstance);
      });

      socketInstance.on("connect_error", (err: Error) => {
        console.error("[socket-client] Socket connection error:", err.message);
        if (!socketInstance!.connected) {
          isInitializing = false;
          resolve(null);
        }
      });

      socketInstance.on("disconnect", (reason: string) => {
        console.warn("[socket-client] Socket disconnected:", reason);
      });

      // Add a timeout in case connection hangs
      setTimeout(() => {
        if (isInitializing) {
          console.warn("[socket-client] Socket connection timed out");
          isInitializing = false;
          resolve(null);
        }
      }, 10000);
    } catch (error) {
      console.error("[socket-client] Socket initialization failed:", error);
      isInitializing = false;
      resolve(null);
    }
  });

  return initPromise;
};

// Function to get the current socket instance without initializing
export const getSocketInstance = (): AppSocket | null => {
  return socketInstance;
};
