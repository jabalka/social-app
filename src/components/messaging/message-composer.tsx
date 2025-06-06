"use client";

import { Paperclip, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

import { useSocketContext } from "@/context/socket-context";
import type { AuthUser } from "@/models/auth";
import type { Message } from "@prisma/client";

type TempMessage = Message & { tempId?: string; status?: "sending" | "failed" };

interface MessageComposerProps {
  conversationId: string;
  onSent: (msg: TempMessage) => void;
  user: AuthUser;
  onTyping?: (isTyping: boolean) => void;
}

const MessageComposer: React.FC<MessageComposerProps> = ({ conversationId, onSent, user, onTyping }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const sendingRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const lastTextRef = useRef("");

  const { socket, emitTyping, sendMessage } = useSocketContext();

  const handleTypingStart = () => {
    if (!socket || !socket.connected) return;
    if (!isTypingRef.current) {
      emitTyping(conversationId, true);
      isTypingRef.current = true;
      onTyping?.(true);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      handleTypingStop();
    }, 3000);
  };

  const handleTypingStop = () => {
    if (!socket || !socket.connected) return;
    if (isTypingRef.current) {
      emitTyping(conversationId, false);
      isTypingRef.current = false;
      onTyping?.(false);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    const isActuallyTyping =
      newText.length > lastTextRef.current.length || (newText.trim() !== "" && newText !== lastTextRef.current);
    lastTextRef.current = newText;
    if (isActuallyTyping && newText.trim()) {
      handleTypingStart();
    } else if (!newText.trim()) {
      handleTypingStop();
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (socket && socket.connected && isTypingRef.current) {
        emitTyping(conversationId, false);
      }
    };
  }, [socket, conversationId, emitTyping]);

  const send = async () => {
    if (!text.trim() && !file) return;
    if (sendingRef.current) return;

    sendingRef.current = true;
    setIsSending(true);
    handleTypingStop();

    let attachmentUrl = "";
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/upload-message-file", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) throw new Error("Upload failed");
        const json = await uploadRes.json();
        attachmentUrl = json.url;
      } catch (error) {
        console.error("[Upload]", error);
        setIsSending(false);
        sendingRef.current = false;
        return;
      }
    }

    const tempId = `temp-${user.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const tempMessage: TempMessage = {
      id: tempId,
      content: text.trim(),
      attachmentUrl: attachmentUrl || null,
      conversationId,
      senderId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      readAt: null,
      deliveredAt: null,
      tempId,
      status: "sending",
    };

    onSent(tempMessage);

    try {
      if (socket && socket.connected) {
        sendMessage({
          content: text.trim(),
          attachmentUrl: attachmentUrl || null,
          conversationId,
          tempId,
        });
      } else {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: text.trim(),
            attachmentUrl: attachmentUrl || null,
            conversationId,
            tempId,
          }),
        });
        if (!res.ok) throw new Error("API fallback failed");
        const realMessage = await res.json();
        onSent(realMessage);
      }
    } catch (err) {
      console.error("[MessageComposer]", err);
      onSent({ ...tempMessage, status: "failed" });
    }

    setText("");
    setFile(null);
    setIsSending(false);
    sendingRef.current = false;
    lastTextRef.current = "";
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="file" className="cursor-pointer text-gray-500 hover:text-green-600">
        <Paperclip className="h-5 w-5" />
        <input
          id="file"
          type="file"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              setFile(e.target.files[0]);
            }
          }}
        />
      </label>

      <input
        type="text"
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder={file ? file.name : "Type a message..."}
        className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none dark:bg-zinc-800 dark:text-white"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
        onBlur={handleTypingStop}
      />

      <Button onClick={send} disabled={isSending || (!text.trim() && !file)} className="p-2">
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MessageComposer;
