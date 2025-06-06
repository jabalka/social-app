"use client";

import { useSocket } from "@/hooks/use-Socket";
import { AppSocket, SocketEventMap } from "@/models/socket";
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef } from "react";

type EventHandler<T extends keyof SocketEventMap> = (payload: SocketEventMap[T]["payload"]) => void;

interface SocketContextValue {
  socket: AppSocket | null;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  registerListener: <T extends keyof SocketEventMap>(event: T, handler: EventHandler<T>) => void;
  unregisterListener: <T extends keyof SocketEventMap>(event: T) => void;
  emitTyping: (conversationId: string, isTyping: boolean) => void;
  markMessagesRead: (conversationId: string) => void;
  sendMessage: (message: {
    content: string;
    attachmentUrl: string | null;
    conversationId: string;
    tempId?: string;
  }) => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  joinConversation: () => {},
  leaveConversation: () => {},
  registerListener: () => {},
  unregisterListener: () => {},
  emitTyping: () => {},
  markMessagesRead: () => {},
  sendMessage: () => {},
});

interface Props {
  children: ReactNode;
}

type ListenerWrapper = (...args: unknown[]) => void;

export const SocketProvider: React.FC<Props> = ({ children }) => {
  const socket = useSocket();
  const listeners = useRef<Map<keyof SocketEventMap, ListenerWrapper>>(new Map());

  // Join Conversation
  const joinConversation = useCallback(
    (conversationId: string) => {
      socket?.emit("join:conversation", conversationId);
    },
    [socket],
  );

  // Leave Conversation
  const leaveConversation = useCallback(
    (conversationId: string) => {
      socket?.emit("leave:conversation", conversationId);
    },
    [socket],
  );

  const sendMessage = useCallback(
    (message: { content: string; attachmentUrl: string | null; conversationId: string; tempId?: string }) => {
      socket?.emit("message:send", message);
    },
    [socket],
  );

  // Register Listener
  const registerListener = useCallback(
    <T extends keyof SocketEventMap>(event: T, handler: EventHandler<T>) => {
      if (!socket) return;

      // Avoid duplicate listeners
      if (listeners.current.has(event)) {
        socket.off(event, listeners.current.get(event));
        listeners.current.delete(event);
      }

      const wrappedHandler: ListenerWrapper = (data: unknown) => {
        handler(data as SocketEventMap[T]["payload"]);
      };

      listeners.current.set(event, wrappedHandler);
      socket.on(event, wrappedHandler);
    },
    [socket],
  );

  // Unregister Listener
  const unregisterListener = useCallback(
    <T extends keyof SocketEventMap>(event: T) => {
      const listener = listeners.current.get(event);
      if (socket && listener) {
        socket.off(event, listener);
        listeners.current.delete(event);
      }
    },
    [socket],
  );

  // isTyping event
  const emitTyping = useCallback(
    (conversationId: string, isTyping: boolean) => {
      if (!socket) return;
      if (isTyping) {
        socket.emit("typing:start", { conversationId });
      } else {
        socket.emit("typing:stop", { conversationId });
      }
    },
    [socket],
  );

  const markMessagesRead = useCallback(
    (conversationId: string) => {
      socket?.emit("messages:read:all", { conversationId });
    },
    [socket],
  );

  // Cleanup all listeners on unmount.
  useEffect(() => {
    const cleanup = () => {
      if (!socket) return;
      listeners.current.forEach((listener, event) => {
        socket.off(event as string, listener);
      });
      listeners.current.clear();
    };

    return cleanup;
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        joinConversation,
        leaveConversation,
        registerListener,
        unregisterListener,
        emitTyping,
        markMessagesRead,
        sendMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);
