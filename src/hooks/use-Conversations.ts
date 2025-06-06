"use client";

import { useSocketContext } from "@/context/socket-context";
import { FullConversation } from "@/models/message";
import type { Message } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";

export const useConversations = (currentUserId?: string) => {
  const [conversations, setConversations] = useState<FullConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocketContext();

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/conversations");
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Join all conversation rooms when socket connects and conversations are loaded
  useEffect(() => {
    if (!socket || !socket.connected || conversations.length === 0) {
      return;
    }

    // Join all conversation rooms for real-time updates
    conversations.forEach((conversation) => {
      socket.emit("join:conversation", conversation.id);
    });

    return () => {
      // Leave all rooms when component unmounts or dependencies change
      conversations.forEach((conversation) => {
        console.log("[useConversations] Leaving room:", conversation.id);
        socket.emit("leave:conversation", conversation.id);
      });
    };
  }, [socket, socket?.connected, conversations]);

  // Handle new messages from any conversation
  useEffect(() => {
    if (!socket || !currentUserId) return;

    const handleNewMessage = (message: Message & { conversationId: string }) => {
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === message.conversationId) {
            const messageExists = conv.messages.some((m) => m.id === message.id);
            if (messageExists) {
              return conv;
            }
            return {
              ...conv,
              messages: [message], // Update with latest message
              unreadCount: message.senderId !== currentUserId ? conv.unreadCount + 1 : conv.unreadCount,
              updatedAt: new Date().toISOString(),
            };
          }
          return conv;
        }),
      );
    };

    // Handle messages being marked as read
    const handleMessagesRead = ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      // Only update if the current user marked messages as read
      if (userId === currentUserId) {
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                unreadCount: 0, // Reset unread count when user reads messages
              };
            }
            return conv;
          }),
        );
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
    fetchConversations();
  }, [fetchConversations]);

  // Calculate total unread count
  const totalUnreadCount = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

  return {
    conversations,
    loading,
    totalUnreadCount,
    refetch: fetchConversations,
  };
};
