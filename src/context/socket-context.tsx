"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { AppSocket } from "@/models/socket";
import { useSocket } from "@/hooks/use-Socket";


// Create a context with a default value of null.
const SocketContext = createContext<AppSocket | null>(null);

// Custom hook to simplify accessing the socket
export const useSocketContext = (): AppSocket | null => {
  return useContext(SocketContext);
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const socket = useSocket();


  if (!socket) {
    return <div>Initializing real-time connection...</div>;
  }

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};