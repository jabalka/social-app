"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import React, { useEffect, useRef } from "react";
import { Message } from "@prisma/client";
import { AuthUser } from "@/models/auth";
import MessageBubble from "./message-buble";
import MessageComposer from "./message-composer";
import { useSocketContext } from "@/context/socket-context";


interface ChatWindowProps {
  open: boolean;
  onClose: () => void;
  messages: Message[];
  currentUser: AuthUser;
  conversationId: string;
  onMessageSent?: (message: Message) => void;

}

const ChatWindow: React.FC<ChatWindowProps> = ({
  open,
  onClose,
  messages = [],
  currentUser,
  conversationId,
  onMessageSent,

}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const socket = useSocketContext();


  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open, messages]);

  useEffect(() => {
    if (!open || !conversationId || !socket) return;

    const markMessagesAsRead = async () => {
      try {
        await fetch(`/api/conversations/${conversationId}/read`, {
          method: "PATCH",
        });
        socket.emit("message:read", {
          conversationId,
          userId: currentUser.id,
        });
      } catch (error) {
        console.error("Failed to mark messages as read", error);
      }
    };

    markMessagesAsRead();

    // Setup socket listeners for this conversation
    const handleNewMessage = (message: Message) => {
      if (message.conversationId === conversationId) {
        onMessageSent?.(message);
      }
    };

    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, [open, conversationId, currentUser.id, socket, onMessageSent]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Conversation</DialogTitle>
        </DialogHeader>
        
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-2 px-4 py-2"
        >
          {messages.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map((msg) => (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                isOwn={msg.senderId === currentUser.id} 
              />
            ))
          )}
        </div>

        <div className="border-t px-4 py-3 dark:border-zinc-700">
          <MessageComposer
            conversationId={conversationId}
            user={currentUser}
            onSent={(msg) => {
              if (socket) {
                socket.emit("message:send", msg);
              }
              onMessageSent?.(msg);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatWindow;