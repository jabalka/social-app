"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Message } from "@prisma/client";
import { initializeSocket } from "@/lib/socket-client";
import ConversationItem from "./conversation-item";
import ChatWindow from "./chat-window";
import { AuthUser } from "@/models/auth";
import { FullConversation } from "@/models/message";
import { toDate } from "date-fns";
import { toOptionalDate } from "@/utils/date";
import { AppSocket } from "@/models/socket";

const ConversationList: React.FC = () => {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<FullConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [newMessageMap, setNewMessageMap] = useState<Record<string, boolean>>({});
  const [socket, setSocket] = useState<AppSocket | null>(null);

  const currentUser = session?.user as AuthUser;

  useEffect(() => {
    const setupSocket = async () => {
      try {
        const socket = await initializeSocket();
        setSocket(socket);
      } catch (error) {
        console.error("Failed to initialize socket:", error);
      }
    };

    setupSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      const res = await fetch("/api/conversations");
      const data: FullConversation[] = await res.json();
      
      // Convert string dates to Date objects if needed
      const processedData = data.map(conversation => ({
        ...conversation,
        createdAt: toDate(conversation.createdAt),
        updatedAt: toDate(conversation.updatedAt),
        messages: conversation.messages.map(msg => ({
          ...msg,
          createdAt: toDate(msg.createdAt),
          readAt: toOptionalDate(msg.readAt)
        }))
      }));
      
      setConversations(processedData);
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: Message & { conversationId: string }) => {
      if (msg.conversationId !== activeConversationId) {
        setNewMessageMap((prev) => ({ ...prev, [msg.conversationId]: true }));
      }

      setConversations((prev) => {
        const updatedConversations = prev.map((conversation) => {
          if (conversation.id === msg.conversationId) {
            return {
              ...conversation,
              messages: [{
                ...msg,
                createdAt: new Date(msg.createdAt),
                readAt: msg.readAt ? new Date(msg.readAt) : null
              }, ...(conversation.messages || [])],
              updatedAt: new Date()
            };
          }
          return conversation;
        });

        // Sort by updatedAt (newest first)
        return [...updatedConversations].sort((a, b) => 
          b.updatedAt.getTime() - a.updatedAt.getTime()
        );
      });
    };

    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, [socket, activeConversationId]);

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setNewMessageMap((prev) => ({ ...prev, [id]: false }));
    
    if (socket) {
      socket.emit("join:conversation", id);
    }
  };

  const handleMessageSent = (message: Message) => {
    setConversations((prev) => {
      const updatedConversations = prev.map((conversation) => {
        if (conversation.id === message.conversationId) {
          return {
            ...conversation,
            messages: [{
              ...message,
              createdAt: new Date(message.createdAt),
              readAt: message.readAt ? new Date(message.readAt) : null
            }, ...(conversation.messages || [])],
            updatedAt: new Date()
          };
        }
        return conversation;
      });

      // Sort by updatedAt (newest first)
      return [...updatedConversations].sort((a, b) => 
        b.updatedAt.getTime() - a.updatedAt.getTime()
      );
    });
  };

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  return (
    <>
      <div className="flex flex-col gap-2 overflow-y-auto max-h-[80vh]">
        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isActive={conversation.id === activeConversationId}
            hasNewMessage={!!newMessageMap[conversation.id]}
            onClick={() => handleSelectConversation(conversation.id)}
            currentUserId={currentUser?.id || ""}
          />
        ))}
      </div>

      {activeConversation && currentUser && (
        <ChatWindow
          open={!!activeConversationId}
          onClose={() => {
            if (socket && activeConversationId) {
              socket.emit("leave:conversation", activeConversationId);
            }
            setActiveConversationId(null);
          }}
          messages={activeConversation.messages || []}
          currentUser={currentUser}
          conversationId={activeConversation.id}
          onMessageSent={handleMessageSent}
        />
      )}
    </>
  );
};

export default ConversationList;