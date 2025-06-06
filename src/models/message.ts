import { Message } from "@prisma/client";
import { AuthUser } from "./auth";

export type SentMessage = {
  id: string;
  content: string | null;
  attachmentUrl: string | null;
  conversationId: string;
  createdAt: Date;
  senderId: string;
  readAt: null;
  deliveredAt: Date | null;
};

export interface FullConversation extends SentMessage {
  users: AuthUser[];
  messages: Message[];
  unreadCount: number;
}

export type ConversationWithUnread = {
  id: string;
  unreadCount: number;
};

export type MessageSendResponse = { success: true; message: Message } | { success: false; error: string };
