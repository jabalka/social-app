"use client";

import { FullConversation } from "@/models/message";
import { cn } from "@/utils/cn.utils";
import Image from "next/image";
import React from "react";

interface Props {
  conversation: FullConversation;
  isActive: boolean;
  hasNewMessage: boolean;
  currentUserId: string;
  onClick: () => void;
}

const ConversationItem: React.FC<Props> = ({ conversation, isActive, hasNewMessage, currentUserId, onClick }) => {
  const otherUser = conversation.users.find((user) => user.id !== currentUserId);
  const lastMessage = conversation.messages[0];

  return (
    <>
      {conversation.unreadCount > 0 && (
        <span className="ml-auto text-xs font-semibold text-red-600">{conversation.unreadCount}</span>
      )}
      <div
        onClick={onClick}
        className={cn(
          "flex cursor-pointer items-center gap-4 rounded-lg px-4 py-2 transition-all",
          isActive
            ? "bg-green-100 dark:bg-green-900"
            : hasNewMessage
              ? "bg-green-50 font-semibold dark:bg-zinc-700"
              : "hover:bg-zinc-100 dark:hover:bg-zinc-800",
        )}
      >
        <div className="relative h-10 w-10 overflow-hidden rounded-full border border-zinc-300 dark:border-zinc-600">
          {otherUser?.image ? (
            <Image src={otherUser.image} alt={otherUser.name || "User"} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-400 text-xs text-white">
              {otherUser?.name?.[0] || "?"}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm">
            {otherUser?.username || otherUser?.email || otherUser?.name || "Unknown User"}
          </p>
          <p
            className={cn(
              "truncate text-xs text-gray-500 dark:text-gray-300",
              hasNewMessage && !isActive && "font-bold text-green-600 dark:text-green-400",
            )}
          >
            {lastMessage?.content || (lastMessage?.attachmentUrl ? "📎 Attachment" : "No messages yet")}
          </p>
        </div>
      </div>
    </>
  );
};

export default ConversationItem;
