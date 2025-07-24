"use client";

import { useSocketContext } from "@/context/socket-context";
import { FullConversation } from "@/models/message.types";
import { fetcher } from "@/swr";
import type { Message } from "@prisma/client";
import { useEffect } from "react";
import useSWR from "swr";

export const useConversations = (currentUserId?: string) => {
  const { socket } = useSocketContext();

  const { data, error, isLoading, mutate } = useSWR<FullConversation[]>("/api/conversations", fetcher);

  useEffect(() => {
    if (!socket || !socket.connected || !data) {
      return;
    }

    data.forEach((conversation) => {
      socket.emit("join:conversation", conversation.id);
    });

    return () => {
      data.forEach((conversation) => {
        socket.emit("leave:conversation", conversation.id);
      });
    };
  }, [socket, socket?.connected, data]);

  useEffect(() => {
    if (!socket || !currentUserId) return;

    const handleNewMessage = (message: Message & { conversationId: string }) => {
      mutate((prev) => {
        if (!prev) return prev;
        return prev.map((conv) => {
          if (conv.id === message.conversationId) {
            const messageExists = conv.messages.some((m) => m.id === message.id);
            if (messageExists) return conv;
            return {
              ...conv,
              messages: [message],
              unreadCount: message.senderId !== currentUserId ? (conv.unreadCount || 0) + 1 : conv.unreadCount,
              updatedAt: new Date().toISOString(),
            };
          }
          return conv;
        });
      }, false);
    };

    const handleMessagesRead = ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      if (userId === currentUserId) {
        mutate((prev) => {
          if (!prev) return prev;
          return prev.map((conv) => (conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv));
        }, false);
      }
    };

    socket.on("message:new", handleNewMessage);
    socket.on("messages:read:all", handleMessagesRead);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("messages:read:all", handleMessagesRead);
    };
  }, [socket, currentUserId, mutate]);

  const totalUnreadCount = (data || []).reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

  return {
    conversations: data || [],
    loading: isLoading,
    totalUnreadCount,
    refetch: () => mutate(),
    error,
  };
};
