"use client";

import React, { useState } from "react";
import { Paperclip, Send } from "lucide-react";
import { Button } from "../ui/button";

import { SentMessage } from "@/models/message";
import { AuthUser } from "@/models/auth";
import { useSocket } from "@/hooks/use-Socket";

interface MessageComposerProps {
  conversationId: string;
  onSent: (msg: SentMessage) => void;
  user: AuthUser
}

const MessageComposer: React.FC<MessageComposerProps> = ({
  conversationId,
  onSent,
  user
}) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
    const socket = useSocket();


  const sendMessage = async () => {
    if (!text.trim() && !file) return;
  
    // Make sure socket is connected before sending
    if (!socket || !socket.connected) {
      console.error("Socket not connected. Cannot send message.");
      return;
    }
  
    setIsSending(true);
  
    let attachmentUrl = "";
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
  
      const uploadRes = await fetch("/api/upload-message-file", {
        method: "POST",
        body: formData,
      });
      const json = await uploadRes.json();
      attachmentUrl = json.url;
    }
  
    const message = {
      content: text.trim() || null,
      attachmentUrl: attachmentUrl || null,
      conversationId,
    };
  
    socket.emit("message:send", message);
  
    onSent({
      ...message,
      id: `temp-${Date.now()}`,
      createdAt: new Date(),
      senderId: user!.id,
      readAt: null,
    });
  
    setText("");
    setFile(null);
    setIsSending(false);
  };
  

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="file"
        className="cursor-pointer text-gray-500 hover:text-green-600 transition"
      >
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
        onChange={(e) => setText(e.target.value)}
        placeholder={file ? file.name : "Type a message..."}
        className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none dark:bg-zinc-800 dark:text-white"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        }}
      />

      <Button
        onClick={sendMessage}
        disabled={isSending || (!text.trim() && !file)}
        className="p-2"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MessageComposer;
