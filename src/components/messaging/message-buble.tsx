"use client";

import React from "react";
import { Message } from "@prisma/client";
import { cn } from "@/utils/cn.utils";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  return (
    <div
      className={cn("flex w-full", {
        "justify-end": isOwn,
        "justify-start": !isOwn,
      })}
    >
      <div
        className={cn(
          "max-w-[70%] rounded-lg px-4 py-2 text-sm shadow transition-all",
          isOwn
            ? "bg-green-600 text-white rounded-br-none"
            : "bg-gray-200 text-gray-800 dark:bg-zinc-700 dark:text-white rounded-bl-none"
        )}
      >
        {message.attachmentUrl ? (
          <a
            href={message.attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80"
          >
            📎 Download attachment
          </a>
        ) : (
          <span>{message.content}</span>
        )}
      </div>

      {message.readAt && (
    <div className="text-[10px] text-gray-400" title={`Seen at ${new Date(message.readAt).toLocaleString()}`}>
    ✅
  </div>
)}
    </div>
  );
};

export default MessageBubble;
