import { Socket } from "socket.io-client";
import { Message } from "@prisma/client";

type MessageEventPayload = Message & { conversationId: string };
type ReadReceiptPayload = { conversationId: string; userId: string };

type MessageSendResponse =
  | { success: true; message: Message }
  | { success: false; error: string };

export interface AppSocket extends Socket {
    emit(event: "message:send", payload: { content: string | null; attachmentUrl: string | null; conversationId: string }): this;
    emit(event: "message:new", payload: MessageEventPayload): this;
    emit(event: "message:read", payload: ReadReceiptPayload): this;
  

    emit(event: "join:conversation", conversationId: string): this;
    emit(event: "leave:conversation", conversationId: string): this;
  

    on(event: "connect", listener: () => void): this;
    on(event: "connect_error", listener: (error: Error) => void): this;
    on(event: "disconnect", listener: (reason: string) => void): this;
  
  

  on(event: "message:new", listener: (payload: MessageEventPayload) => void): this;
  on(event: "message:read", listener: (payload: ReadReceiptPayload) => void): this;

  off(event: "message:new", listener?: (payload: MessageEventPayload) => void): this;
  off(event: "message:read", listener?: (payload: ReadReceiptPayload) => void): this;
}

export interface SocketEventMap {
  "message:send": {
    payload: Message;
    response: MessageSendResponse;
  };
  "message:new": MessageEventPayload;
  "message:read": ReadReceiptPayload;
  "join:conversation": string;
  "leave:conversation": string;
}