import { Conversation, Message, User } from "@prisma/client";

export type SentMessage = {
    id: string;
    content: string | null;
    attachmentUrl: string | null;
    conversationId: string;
    createdAt: Date;
    senderId: string;
    readAt: null;
  };
  
export interface FullConversation extends Conversation {
    users: User[];
    messages: Message[];
    unreadCount: number;
}

export type ConversationWithUnread = {
  id: string;
  unreadCount: number;
};
  

export type MessageSendResponse = 
  | { success: true; message: Message }
  | { success: false; error: string };