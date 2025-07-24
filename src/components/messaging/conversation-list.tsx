"use client";

import { useSocketContext } from "@/context/socket-context";
import { useUserDialog } from "@/context/user-dialog-context";
import { useConversations } from "@/hooks/use-conversations";
import { AuthUser } from "@/models/auth.types";
import { FullConversation } from "@/models/message.types";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Wifi, WifiOff } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import UserInteractionDialog from "../user-interaction-dialog";

const ConversationList: React.FC = () => {
  const { data: session } = useSession();
  const currentUser = session?.user as AuthUser;
  const { socket } = useSocketContext();
  const { conversations, loading, refetch } = useConversations(currentUser?.id);
  const { setIsOpen, setSelectedUserId } = useUserDialog();

  const socketConnected = socket?.connected ?? false;

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log("[ConversationList] Socket connected");
      refetch();
    };

    const handleDisconnect = () => {
      console.log("[ConversationList] Socket disconnected");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket, refetch]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (socketConnected) {
      refetch();
    }
  }, [socketConnected, refetch]);

  const handleConversationClick = (conversation: FullConversation) => {
    const otherUser = conversation.users.find((user: AuthUser) => user.id !== currentUser?.id);
    if (otherUser) {
      setSelectedUserId(otherUser.id);
      setIsOpen(true);
    }
  };

  const handleRetryConnection = () => {
    if (socket && !socket.connected) {
      socket.connect();
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Conversations</h2>
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Conversations</h2>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {socket?.connected ? (
                <div className="flex items-center space-x-1 text-green-600">
                  <Wifi className="h-3 w-3" />
                  <span className="text-xs">Online</span>
                </div>
              ) : (
                <button
                  onClick={handleRetryConnection}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                >
                  <WifiOff className="h-3 w-3" />
                  <span className="text-xs">Offline</span>
                </button>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={refetch}>
              Refresh
            </Button>
          </div>
        </div>

        {!socketConnected && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950">
            <div className="flex items-center space-x-2">
              <WifiOff className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Real-time messaging is offline. You can still view conversations, but new messages won&apos;t appear
                automatically.
              </p>
              <Button variant="outline" size="sm" onClick={handleRetryConnection}>
                Retry
              </Button>
            </div>
          </div>
        )}

        {conversations.length === 0 ? (
          <div className="py-8 text-center">
            <MessageCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">No conversations yet</h3>
            <p className="text-gray-500 dark:text-gray-400">Start a conversation by messaging someone!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => {
              const otherUser = conversation.users.find((user) => user.id !== currentUser?.id);
              const lastMessage = conversation.messages[0];
              const hasUnread = conversation.unreadCount > 0;

              if (!otherUser) return null;

              return (
                <Card
                  key={conversation.id}
                  className={`w-[45vh] cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 md:w-[55vh] lg:w-[75vh] ${
                    hasUnread ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950" : ""
                  }`}
                  onClick={() => handleConversationClick(conversation)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={otherUser.image || ""} alt={otherUser.name || ""} />
                          <AvatarFallback>
                            <Image src={otherUser.image || ""} alt={otherUser.name || ""} width={40} height={40} />
                          </AvatarFallback>
                        </Avatar>
                        {hasUnread && (
                          <Badge
                            variant="destructive"
                            className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
                          >
                            {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                          </Badge>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`truncate text-sm ${hasUnread ? "font-semibold" : "font-medium"}`}>
                            {otherUser.name || otherUser.username}
                          </p>
                          {lastMessage && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                            </span>
                          )}
                        </div>

                        {lastMessage ? (
                          <p
                            className={`truncate text-sm ${
                              hasUnread ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {lastMessage.senderId === currentUser?.id ? "You: " : ""}
                            {lastMessage.content || "📎 Attachment"}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">No messages yet</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {currentUser && <UserInteractionDialog currentUser={currentUser} />}
    </>
  );
};

export default ConversationList;
