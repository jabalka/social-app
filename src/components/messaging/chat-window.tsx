"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSocketContext } from "@/context/socket-context";
import type { AuthUser } from "@/models/auth.types";
import type { Message } from "@prisma/client";
import { Loader2 } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MessageBubble from "./message-buble";
import MessageComposer from "./message-composer";
import TypingIndicator from "./typing-indicator";

interface ChatWindowProps {
  open: boolean;
  onClose: () => void;
  currentUser: AuthUser;
  userId?: string;
  conversationId?: string;
  onMessageSent?: (message: Message) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  open,
  onClose,
  currentUser,
  userId,
  conversationId: initialConversationId,
  onMessageSent,
}) => {
  const {
    socket,
    joinConversation,
    leaveConversation,
    registerListener,
    unregisterListener,
    emitTyping,
    markMessagesRead,
  } = useSocketContext();

  const [conversationId, setConversationId] = useState(initialConversationId ?? "");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());

  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    if (!open) setMessages([]);
  }, [open]);

  const fetchOrCreateConversation = useCallback(async () => {
    if (userId && !conversationId && open) {
      const res = await fetch(`/api/conversations/with/${userId}`, { method: "POST" });
      const data = await res.json();
      setConversationId(data.id);
    }
  }, [userId, conversationId, open]);

  const fetchMessages = useCallback(async (id: string, isInitial = false) => {
    if (!id) return;
    if (isInitial) setIsLoadingMessages(true);

    const res = await fetch(`/api/conversations/${id}/messages?limit=30`);
    const data = await res.json();

    if (data?.messages) {
      setMessages(data.messages);
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor);
    }

    if (isInitial) setIsLoadingMessages(false);
  }, []);

  useEffect(() => {
    fetchOrCreateConversation();
  }, [fetchOrCreateConversation]);

  useEffect(() => {
    if (open && conversationId) {
      fetchMessages(conversationId, true);
    }
  }, [open, conversationId, fetchMessages]);

  useEffect(() => {
    if (!conversationId || !socket) return;
    joinConversation(conversationId);
    return () => leaveConversation(conversationId);
  }, [socket, conversationId, joinConversation, leaveConversation]);

  useEffect(() => {
    if (!conversationId) return;

    const handler = (message: Message & { conversationId: string; tempId?: string }) => {
      if (message.conversationId !== conversationId) return;

      setMessages((prev) => {
        const exists = prev.some((m) => m.id === message.id || m.id === message.tempId);
        if (exists) return prev;

        const updated = [...prev.filter((m) => m.id !== message.tempId), message];
        return updated.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      });

      if (message.senderId !== currentUser.id) {
        setTimeout(() => markMessagesRead(conversationId), 1000);
      }
    };

    registerListener("message:new", handler);
    return () => unregisterListener("message:new");
  }, [conversationId, currentUser.id, registerListener, unregisterListener, markMessagesRead]);

  useEffect(() => {
    if (!conversationId) return;

    const handleTyping = ({ userId, typing }: { userId: string; typing: boolean }) => {
      if (userId === currentUser.id) return;

      setTypingUsers((prev) => {
        const map = new Map(prev);
        if (typing) {
          map.set(userId, userId);
          clearTimeout(typingTimeoutRef.current[userId]);
          typingTimeoutRef.current[userId] = setTimeout(() => {
            setTypingUsers((p) => {
              const newMap = new Map(p);
              newMap.delete(userId);
              return newMap;
            });
          }, 5000);
        } else {
          map.delete(userId);
        }
        return map;
      });
    };

    registerListener("user:typing", handleTyping);
    return () => unregisterListener("user:typing");
  }, [conversationId, currentUser.id, registerListener, unregisterListener]);

  const handleMessageSent = useCallback(
    (msg: Message) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === msg.id);
        if (exists) return prev;
        return [...prev, msg].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      });

      onMessageSent?.(msg);
    },
    [onMessageSent],
  );

  const uniqueMessages = useMemo(() => {
    const map = new Map<string, Message>();
    messages.forEach((m) => map.set(m.id, m));
    return [...map.values()].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [messages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || isLoadingMore) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    if (isAtBottom || uniqueMessages.length < 20) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [uniqueMessages, isLoadingMore, scrollToBottom]);

  const handleLoadMoreClick = async () => {
    if (!conversationId || !nextCursor || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const res = await fetch(`/api/conversations/${conversationId}/messages?cursor=${nextCursor}&limit=30`);
    const data = await res.json();

    if (data?.messages?.length) {
      setMessages((prev) => [...data.messages, ...prev]);
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor);
    }

    setIsLoadingMore(false);
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 150;
    }, 100);
  };

  useEffect(() => {
    if (open) scrollToBottom();
  }, [messages, open, scrollToBottom]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex h-[80vh] max-w-2xl flex-col">
        <DialogHeader>
          <DialogTitle>Conversation</DialogTitle>
        </DialogHeader>

        <div className="relative flex-1 overflow-hidden">
          {isLoadingMessages && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Loading messages...</span>
            </div>
          )}

          {hasMore && !isLoadingMore && (
            <div className="absolute left-0 right-0 top-0 z-10 flex justify-center bg-background/80 p-2">
              <Button variant="ghost" size="sm" onClick={handleLoadMoreClick} className="text-xs">
                Load older messages
              </Button>
            </div>
          )}
          <div ref={scrollRef} className="h-full flex-1 space-y-2 overflow-y-auto px-4 py-6 pt-14">
            {!isLoadingMessages && uniqueMessages.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
            ) : (
              uniqueMessages.map((msg) => (
                <MessageBubble
                  key={`${msg.id}-${msg.senderId}-${Date.parse(msg.createdAt.toString())}`}
                  message={msg}
                  isOwn={msg.senderId === currentUser.id}
                />
              ))
            )}
          </div>

          <div className="absolute bottom-4 right-4">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full opacity-80 hover:opacity-100"
              onClick={() => {
                if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </Button>
          </div>
        </div>

        {typingUsers.size > 0 && (
          <div className="px-4">
            <TypingIndicator
              isTyping={true}
              username={typingUsers.size === 1 ? "Someone" : `${typingUsers.size} people`}
            />
          </div>
        )}

        <div className="border-t px-4 py-3 dark:border-zinc-700">
          <MessageComposer
            conversationId={conversationId}
            user={currentUser}
            onSent={handleMessageSent}
            onTyping={(isTyping) => {
              if (conversationId) emitTyping(conversationId, isTyping);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatWindow;
