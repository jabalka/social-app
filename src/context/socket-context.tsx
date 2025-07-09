"use client";

import { useSocket } from "@/hooks/use-Socket";
import { AppSocket, SocketEventMap } from "@/models/socket";
import { showCustomToast } from "@/utils/show-custom-toast";
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef } from "react";
import { Notification, useNotifications } from "./notifications-context";

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
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
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
  notifications: [],
  markNotificationRead: () => {},
});

interface Props {
  children: ReactNode;
}

type ListenerWrapper = (...args: unknown[]) => void;

export const SocketProvider: React.FC<Props> = ({ children }) => {
  const socket = useSocket();
  const listeners = useRef<Map<keyof SocketEventMap, ListenerWrapper>>(new Map());
  const { notifications, addNotification, markNotificationRead, refetchNotifications } = useNotifications();

  const isDuplicate = (type: string, targetId: string) => {
    return notifications.some((n) => n.type === type && n.target?.id === targetId && !n.read);
  };

  const optimisticAndSync = (notification: Notification) => {
    addNotification(notification);
    setTimeout(() => {
      refetchNotifications();
    }, 800);
  };

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

  // Global notification listeners for project events
  useEffect(() => {
    if (!socket) return;

    const handleLike: EventHandler<"notification:like"> = (payload) => {
      if (isDuplicate("like", payload.projectId)) return;
      const notification: Notification = {
        id: `${Date.now()}-like`,
        type: "like",
        message: "Someone liked your project!",
        read: false,
        targetType: "project",
        target: {
          id: payload.projectId,
          type: "project",
          projectId: payload.projectId,
        },
      };

      showCustomToast(notification.message);
      optimisticAndSync(notification);
    };

    const handleComment: EventHandler<"notification:comment"> = (payload) => {
      if (isDuplicate("comment", payload.commentId)) return;
      const notification: Notification = {
        id: `${Date.now()}-comment`,
        type: "comment",
        message: "You received a comment!",
        read: false,
        targetType: "comment",
        target: {
          id: payload.commentId,
          type: "comment",
          projectId: payload.projectId,
          commentId: payload.commentId,
        },
      };
      showCustomToast(notification.message);
      optimisticAndSync(notification);
    };

    const handleCommentLike: EventHandler<"notification:comment-like"> = (payload) => {
      if (isDuplicate("comment-like", payload.commentId)) return;
      const notification: Notification = {
        id: `${Date.now()}-comment-like`,
        type: "comment-like",
        message: "Someone liked your comment!",
        read: false,
        targetType: "comment",
        target: {
          id: payload.commentId,
          type: "comment",
          commentId: payload.commentId,
        },
      };
      showCustomToast(notification.message);
      optimisticAndSync(notification);
    };

    const handleReply: EventHandler<"notification:reply"> = (payload) => {
      if (isDuplicate("reply", payload.commentId)) return;
      const notification: Notification = {
        id: `${Date.now()}-reply`,
        type: "reply",
        message: "Someone replied to your comment!",
        read: false,
        targetType: "comment",
        target: {
          id: payload.commentId,
          type: "comment",
          commentId: payload.commentId,
        },
      };
      showCustomToast(notification.message);
      optimisticAndSync(notification);
    };

    const handleCollabRequest: EventHandler<"notification:collab-request"> = (payload) => {
      if (isDuplicate("collab-request", payload.ideaId)) return;
      const notification: Notification = {
        id: `${Date.now()}-collab-request`,
        type: "collab-request",
        message: `You received a collaboration request!`,
        read: false,
        targetType: "idea",
        target: {
          id: payload.ideaId,
          type: "idea",
          ideaId: payload.ideaId,
        },
      };
      showCustomToast(notification.message);
      optimisticAndSync(notification);
    };

    const handleCollabAccepted: EventHandler<"notification:collab-accepted"> = (payload) => {
      if (isDuplicate("collab-accepted", payload.ideaId)) return;
      const notification: Notification = {
        id: `${Date.now()}-collab-accepted`,
        type: "collab-accepted",
        message: "Your collaboration request was accepted!",
        read: false,
        targetType: "idea",
        target: {
          id: payload.ideaId,
          type: "idea",
          ideaId: payload.ideaId,
        },
      };
      showCustomToast(notification.message);
      optimisticAndSync(notification);
    };

    socket.on("notification:like", handleLike);
    socket.on("notification:comment", handleComment);
    socket.on("notification:comment-like", handleCommentLike);
    socket.on("notification:reply", handleReply);
    socket.on("notification:collab-request", handleCollabRequest);
    socket.on("notification:collab-accepted", handleCollabAccepted);

    return () => {
      socket.off("notification:like", handleLike);
      socket.off("notification:comment", handleComment);
      socket.off("notification:comment-like", handleCommentLike);
      socket.off("notification:reply", handleReply);
      socket.off("notification:collab-request", handleCollabRequest);
      socket.off("notification:collab-accepted", handleCollabAccepted);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, addNotification, refetchNotifications]);

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
        notifications,
        markNotificationRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);
