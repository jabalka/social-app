import type { Message } from "@prisma/client";
import type { Socket } from "socket.io-client";

type MessageEventPayload = Message & { conversationId: string; tempId?: string };
type ReadReceiptPayload = { conversationId: string; userId: string };

type MessageSendResponse = { success: true; message: Message } | { success: false; error: string };

export interface AppSocket extends Socket {
  // Basic socket events
  on(event: "connect", listener: () => void): this;
  on(event: "connect_error", listener: (error: Error) => void): this;
  on(event: "disconnect", listener: (reason: string) => void): this;

  // Notification events
  on(event: "notification:like", listener: (data: { projectId: string; userId: string; type: "like" }) => void): this;
  on(
    event: "notification:comment",
    listener: (data: { projectId: string; commentId: string; userId: string; type: "comment" }) => void,
  ): this;
  on( 
    event: "notification:comment-like",
    listener: (data: { commentId: string; userId: string; type: "comment-like" }) => void,
  ): this;
  on(
    event: "notification:reply",
    listener: (data: { parentId: string; commentId: string; userId: string; type: "reply" }) => void,
  ): this;
  on(
    event: "notification:collab-request",
    listener: (data: { ideaId: string; requestId: string; userId: string; type: "collab-request" }) => void,
  ): this;
  on(
    event: "notification:collab-accepted",
    listener: (data: { ideaId: string; requestId: string; userId: string; type: "collab-accepted" }) => void,
  ): this;

  // Comment/project events
  emit(event: "project:like", data: { projectId: string; userId: string }): boolean;
  emit(event: "project:comment", data: { projectId: string; commentId: string; userId: string }): boolean;
  emit(event: "comment:like", data: { commentId: string; userId: string; projectId: string }): boolean;
  emit(
    event: "comment:reply",
    data: { parentId: string; commentId: string; projectId: string; userId: string },
  ): boolean;
  emit(event: "idea:collab-request", data: { ideaId: string; requestId: string }): boolean;
  emit(event: "idea:collab-accepted", data: { ideaId: string; requestId: string; userId: string }): boolean;

  // Message events
  on(event: "message:new", listener: (message: Message & { conversationId: string; tempId?: string }) => void): this;
  on(event: "message:error", listener: (data: { error: string }) => void): this;
  on(
    event: "message:delivered",
    listener: (data: { messageId: string; conversationId: string; deliveredAt: Date }) => void,
  ): this;
  on(
    event: "message:read",
    listener: (data: { conversationId: string; messageId: string; userId: string; readAt: Date }) => void,
  ): this;
  on(
    event: "messages:read:all",
    listener: (data: { conversationId: string; userId: string; count: number; readAt: Date }) => void,
  ): this;

  // Typing events
  on(event: "user:typing", listener: (data: { userId: string; conversationId: string; typing: boolean }) => void): this;

  // User presence events
  on(event: "user:active", listener: (data: { userId: string; conversationId: string }) => void): this;
  on(event: "user:inactive", listener: (data: { userId: string; conversationId: string }) => void): this;
  on(event: "active:users", listener: (data: { conversationId: string; users: string[] }) => void): this;

  // Generic on/off methods for all events
  on<T extends keyof SocketEventMap>(event: T, listener: (data: SocketEventMap[T]["payload"]) => void): this;
  on(event: string, listener: (...args: unknown[]) => void): this;
  off<T extends keyof SocketEventMap>(event: T, listener?: (data: SocketEventMap[T]["payload"]) => void): this;
  off(event: string, listener?: (...args: unknown[]) => void): this;

  // Emit events
  emit(
    event: "message:send",
    data: { content: string; attachmentUrl: string | null; conversationId: string; tempId?: string },
  ): boolean;
  emit(event: "message:new", payload: MessageEventPayload): this;
  emit(event: "message:read", data: { conversationId: string; messageId: string }): boolean;
  emit(event: "join:conversation", conversationId: string): boolean;
  emit(event: "leave:conversation", conversationId: string): this;
  emit(event: "messages:read:all", data: { conversationId: string }): boolean;
  emit(event: "typing:start", data: { conversationId: string }): boolean;
  emit(event: "typing:stop", data: { conversationId: string }): boolean;

  // Disconnect events
  off(event: "connect", listener?: () => void): this;
  off(event: "disconnect", listener?: (reason: string) => void): this;
  off(event: "connect_error", listener?: (error: Error) => void): this;

  off(event: "message:new", listener?: (payload: MessageEventPayload) => void): this;
  off(event: "message:read", listener?: (payload: ReadReceiptPayload) => void): this;
  off(
    event: "messages:read:all",
    listener?: (data: { conversationId: string; userId: string; count: number; readAt: Date }) => void,
  ): this;
}

export interface SocketEventMap {
  // Notifications
  "notification:like": {
    payload: { projectId: string; userId: string; type: "like" };
    response: void;
  };
  "notification:comment": {
    payload: { projectId: string; commentId: string; userId: string; type: "comment" };
    response: void;
  };
  "notification:comment-like": {
    payload: { commentId: string; userId: string; type: "comment-like" };
    response: void;
  };
  "notification:reply": {
    payload: { parentId: string; commentId: string; userId: string; type: "reply" };
    response: void;
  };
  "notification:collab-request": {
    payload: { ideaId: string; requestId: string; userId: string; type: "idea:collab-request" };
    response: void;
  };
  "notification:collab-accepted": {
    payload: { ideaId: string; requestId: string; userId: string; type: "idea:collab-accepted" };
    response: void;
  };

  // Comment|Project events
  "project:like": {
    payload: { projectId: string; userId: string };
    response: void;
  };
  "project:comment": {
    payload: { projectId: string; commentId: string; userId: string };
    response: void;
  };
  "comment:like": {
    payload: { commentId: string; userId: string; projectId: string };
    response: void;
  };
  "comment:reply": {
    payload: { parentId: string; commentId: string; projectId: string; userId: string };
    response: void;
  };
  "idea:collab-request": {
    payload: { ideaId: string; requestId: string };
    response: void;
  };
  "idea:collab-accepted": {
    payload: { ideaId: string; requestId: string; userId: string };
    response: void;
  };
  // Message events
  "message:send": {
    payload: { content: string; attachmentUrl: string | null; conversationId: string; tempId?: string };
    response: MessageSendResponse;
  };
  "message:new": {
    payload: MessageEventPayload;
    response: void;
  };
  "message:read": {
    payload: ReadReceiptPayload;
    response: void;
  };
  "join:conversation": {
    payload: string;
    response: void;
  };
  "leave:conversation": {
    payload: string;
    response: void;
  };
  "typing:start": {
    payload: { conversationId: string };
    response: void;
  };
  "typing:stop": {
    payload: { conversationId: string };
    response: void;
  };
  "messages:read:all": {
    payload: { conversationId: string; userId: string; count: number; readAt: Date };
    response: void;
  };
  "user:typing": {
    payload: { userId: string; conversationId: string; typing: boolean };
    response: void;
  };
}
