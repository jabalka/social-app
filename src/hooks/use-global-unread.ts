"use client";

import { useSocketContext } from "@/context/socket-context";
import { FullConversation } from "@/models/message.types";
import { fetcher } from "@/swr";
import type { Message } from "@prisma/client";
import { useEffect } from "react";
import useSWR from "swr";

export const useGlobalUnreadCount = (currentUserId?: string) => {
  const { socket } = useSocketContext();

  // Use SWR to fetch all conversations
  const { data, mutate } = useSWR<FullConversation[]>(currentUserId ? "/api/conversations" : null, fetcher);

  // Calculate unread count from conversations
  const unreadCount = (data || []).reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

  // Real-time updates
  useEffect(() => {
    if (!socket || !currentUserId) return;

    const handleNewMessage = (message: Message & { conversationId: string }) => {
      // Only increment if message is from another user
      if (message.senderId !== currentUserId) {
        mutate();
      }
    };

    const handleMessagesRead = ({ userId }: { conversationId: string; userId: string; count: number }) => {
      if (userId === currentUserId) {
        mutate();
      }
    };

    socket.on("message:new", handleNewMessage);
    socket.on("messages:read:all", handleMessagesRead);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("messages:read:all", handleMessagesRead);
    };
  }, [socket, currentUserId, mutate]);

  return {
    unreadCount,
    refetch: () => mutate(),
  };
};
