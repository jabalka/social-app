
console.log("[notifyUser] socket.utils.ts loaded");
import type { Server as IOServer } from "socket.io";

export interface NotificationPayload {
  projectId?: string;
  commentId?: string;
  requestId?: string;
  userId: string;
  type: string;
  [key: string]: unknown;
}

export function notifyUser(
  io: IOServer,
  userId: string,
  event: string,
  payload: NotificationPayload
) {
  console.log(`[notifyUser] called for userId=${userId}, event=${event}`);
  for (const socket of io.of("/").sockets.values()) {
    console.log("Connected socket user id:", socket.data.user?.id);
    if (socket.data.user?.id === userId) {
      console.log(`[notifyUser] Emitting ${event} to user ${userId}`);
      socket.emit(event, payload);
    }
  }
}