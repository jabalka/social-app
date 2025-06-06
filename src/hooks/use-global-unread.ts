"use client";

import { useSocketContext } from "@/context/socket-context";
import { FullConversation } from "@/models/message";
import type { Message } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";

export const useGlobalUnreadCount = (currentUserId?: string) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useSocketContext();

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch("/api/conversations");
      if (response.ok) {
        const data = await response.json();
        const total = data.reduce((sum: number, conv: FullConversation) => sum + (conv.unreadCount || 0), 0);
        setUnreadCount(total);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, []);

  // Handle real-time updates
  useEffect(() => {
    if (!socket || !currentUserId) return;

    const handleNewMessage = (message: Message & { conversationId: string }) => {
      // Only increment if message is from another user
      if (message.senderId !== currentUserId) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    const handleMessagesRead = ({ userId, count }: { conversationId: string; userId: string; count: number }) => {
      // Only decrement if the current user marked messages as read
      if (userId === currentUserId) {
        setUnreadCount((prev) => Math.max(0, prev - count));
      }
    };
    socket.on("message:new", handleNewMessage);
    socket.on("messages:read:all", handleMessagesRead);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("messages:read:all", handleMessagesRead);
    };
  }, [socket, currentUserId]);

  // Initial fetch
  useEffect(() => {
    if (currentUserId) {
      fetchUnreadCount();
    }
  }, [currentUserId, fetchUnreadCount]);

  return {
    unreadCount,
    refetch: fetchUnreadCount,
  };
};
