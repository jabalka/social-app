"use client";

import { Message } from "@prisma/client";
import { format } from "date-fns";
import { AlertCircle, CheckCheck, CheckCircle, Circle, Loader2 } from "lucide-react";
import React from "react";

interface MessageBubbleProps {
  message: Message & { tempId?: string; status?: "sending" | "failed" };
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const timestamp = message.createdAt ? format(new Date(message.createdAt), "h:mm a") : "Sending...";
  const isTempMessage = message.id.startsWith("temp-");
  // Determine message status for own messages
  const getMessageStatus = () => {
    if (message.status === "failed") {
      return (
        <div className="ml-1 flex items-center gap-1 text-red-500">
          <AlertCircle className="h-3.5 w-3.5" />
          <span className="text-xs">Failed</span>
        </div>
      );
    }

    if (message.status === "sending" || isTempMessage) {
      return <Loader2 className="ml-1 h-3.5 w-3.5 animate-spin text-gray-400" />;
    }

    if (!isOwn) return null;

    if (message.readAt) {
      return <CheckCheck className="ml-1 h-3.5 w-3.5 text-blue-500" />;
    } else if (message.deliveredAt) {
      return <CheckCircle className="ml-1 h-3.5 w-3.5 text-gray-400" />;
    } else {
      return <Circle className="ml-1 h-3.5 w-3.5 text-gray-400" />;
    }
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-lg px-4 py-2 ${
          isOwn
            ? message.status === "failed"
              ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
              : "bg-green-500 text-white"
            : "bg-gray-200 text-gray-800 dark:bg-zinc-700 dark:text-white"
        } ${message.status === "sending" ? "opacity-80" : ""}`}
      >
        {message.content && <p className="break-words">{message.content}</p>}

        {message.attachmentUrl && (
          <a
            href={message.attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-sm underline"
          >
            📎 View Attachment
          </a>
        )}

        <div className="mt-1 flex items-center justify-end text-xs opacity-70">
          <span className={message.status === "failed" ? "text-red-500" : ""}>{timestamp}</span>
          {getMessageStatus()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
