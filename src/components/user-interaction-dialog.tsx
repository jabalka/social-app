"use client";

import { useSocketContext } from "@/context/socket-context";
import { useUserDialog } from "@/context/user-dialog-context";
import { useConversations } from "@/hooks/use-Conversations";
import { initializeSocket } from "@/lib/socket-client";
import { AuthUser } from "@/models/auth";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import ChatWindow from "./messaging/chat-window";
import UserDetailsDialog from "./user-details";

interface UserInteractionDialogProps {
  currentUser: AuthUser;
}

const UserInteractionDialog: React.FC<UserInteractionDialogProps> = ({ currentUser }) => {
  const [showChat, setShowChat] = useState(false);
  const [conversationId, setConversationId] = useState<string>("");

  const { socket, joinConversation, leaveConversation } = useSocketContext();
  const { refetch } = useConversations(currentUser?.id);
  const { status } = useSession();
  const { selectedUserId: userId, isOpen: open, setIsOpen, setSelectedUserId } = useUserDialog();

  const socketConnected = socket?.connected ?? false;

  const handleClose = () => {
    setIsOpen(false);
    setSelectedUserId(null);
    setShowChat(false);
    setConversationId("");
    setTimeout(() => refetch(), 500);
  };

  useEffect(() => {
    if (socketConnected) {
      refetch();
    }
  }, [socketConnected, refetch]);

  // Setup socket and join conversation
  useEffect(() => {
    const setupSocketAndConversation = async () => {
      if (status !== "authenticated" || !userId) return;

      const initializedSocket = await initializeSocket();

      if (initializedSocket?.connected) {
        const res = await fetch(`/api/conversations/with/${userId}`, { method: "POST" });
        const data = await res.json();
        setConversationId(data.id);
        joinConversation(data.id);
      }
    };

    if (open) {
      setupSocketAndConversation();
    }

    return () => {
      if (conversationId) {
        leaveConversation(conversationId);
      }
    };
  }, [open, userId, status, joinConversation, leaveConversation, conversationId]);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      refetch();
    };

    const handleDisconnect = () => {
      // maybe we can add something for UI or not
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket, refetch]);

  useEffect(() => {
    if (!open) {
      setShowChat(false);
      setConversationId("");
    }
  }, [open]);

  return (
    <>
      <UserDetailsDialog
        open={open && !showChat}
        onClose={handleClose}
        userId={userId}
        onMessageClick={() => setShowChat(true)}
      />

      {userId && conversationId && (
        <ChatWindow
          open={showChat}
          onClose={handleClose}
          currentUser={currentUser}
          userId={userId}
          conversationId={conversationId}
        />
      )}
    </>
  );
};

export default UserInteractionDialog;
