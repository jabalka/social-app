import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
import express from "express";
import { createServer } from "http";
import jwt from "jsonwebtoken";
import { Server as IOServer } from "socket.io";
import { notifyUser } from "../utils/socket.utils";
import { upsertNotification } from "../lib/api/notifications";


const prisma = new PrismaClient();
const SECRET = process.env.NEXTAUTH_SECRET!;
if (!SECRET) {
  console.error("[Socket] ERROR: NEXTAUTH_SECRET is missing!");
  process.exit(1);
}

const checkDatabaseConnection = async () => {
  try {
    await prisma.$connect();
    console.log("[Socket] Database connected successfully");

    // Test query
    const userCount = await prisma.user.count();
    console.log(`[Socket] Database test query successful. User count: ${userCount}`);
  } catch (error) {
    console.error("[Socket] Database connection failed:", error);
    process.exit(1);
  }
};

const app = express();
const httpServer = createServer(app);
const io = new IOServer(httpServer, {
  cors: { origin: "http://localhost:3000", credentials: true },
});

const typingUsers = new Map<string, Map<string, NodeJS.Timeout>>();
const activeUsers = new Map<string, Set<string>>();

const cleanupTypingStatus = (conversationId: string, userId: string) => {
  const conversationTyping = typingUsers.get(conversationId);
  if (conversationTyping) {
    const timeout = conversationTyping.get(userId);
    if (timeout) {
      clearTimeout(timeout);
      conversationTyping.delete(userId);
    }

    if (conversationTyping.size === 0) {
      typingUsers.delete(conversationId);
    }
  }
};

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    console.log("[Socket] Received token:", token);

    if (!token) {
      console.error("[Socket] Missing token in handshake.");
      return next(new Error("Unauthorized"));
    }

    const decodedToken = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as jwt.JwtPayload;

    if (!decodedToken || !decodedToken.id) {
      console.error("[Socket] Invalid token, missing user ID.");
      return next(new Error("Unauthorized"));
    }

    socket.data.user = {
      id: decodedToken.id as string,
      email: decodedToken.email as string,
      name: decodedToken.name as string,
      username: decodedToken.username as string,
    };

    console.log(`[Socket] Authenticated user: ${socket.data.user.email}`);
    next();
  } catch (error) {
    console.error("[Socket] Authentication error:", error);
    next(new Error("Authentication failed"));
  }
});

io.on("connection", (socket) => {
  console.log(`[Socket Connected] ${socket.id} (user: ${socket.data.user?.email})`);
 
  // Join the conversation room on connection
  socket.on("join:conversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`[Socket] ${socket.data.user.email} joined ${conversationId}`);

    // Add user to active users for this conversation
    if (!activeUsers.has(conversationId)) {
      activeUsers.set(conversationId, new Set());
    }
    activeUsers.get(conversationId)!.add(socket.data.user.id);

    // Notify others that this user is now active
    socket.to(conversationId).emit("user:active", {
      userId: socket.data.user.id,
      conversationId,
    });

    // Send list of active users to the newly joined user
    socket.emit("active:users", {
      conversationId,
      users: Array.from(activeUsers.get(conversationId) || []),
    });
  });

  // Leave conversation room
  socket.on("leave:conversation", (conversationId) => {
    socket.leave(conversationId);
    console.log(`[Socket] ${socket.data.user.email} left ${conversationId}`);

    // Remove from active users
    const conversationActiveUsers = activeUsers.get(conversationId);
    if (conversationActiveUsers) {
      conversationActiveUsers.delete(socket.data.user.id);
      if (conversationActiveUsers.size === 0) {
        activeUsers.delete(conversationId);
      }
    }

    // Clean up typing status
    cleanupTypingStatus(conversationId, socket.data.user.id);

    // Notify others that user left
    socket.to(conversationId).emit("user:inactive", {
      userId: socket.data.user.id,
      conversationId,
    });
  });

  // LIKE NOTIFICATION
  socket.on("project:like", async ({ projectId }) => {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { authorId: true },
      });
      if (project && project.authorId !== socket.data.user.id) {
        const message = "Someone liked your project!";
        notifyUser(io, project.authorId, "notification:like", {
          projectId,
          userId: socket.data.user.id,
          type: "like",
          target: {
            id: projectId,
            type: "project",
            projectId,
          },
        });

        await upsertNotification({
          userId: project.authorId,
          fromUserId: socket.data.user.id,
          type: "like",
          message,
          targetType: "project",
          targetId: projectId,
          projectId,
        });
      }
    } catch (err) {
      console.error("[Socket] Error in project:like notification:", err);
    }
  });

  // COMMENT NOTIFICATION
  socket.on("project:comment", async ({ projectId, commentId }) => {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { authorId: true },
      });
      if (project && project.authorId !== socket.data.user.id) {
        const message = "You received a comment!";
        notifyUser(io, project.authorId, "notification:comment", {
          projectId,
          commentId,
          userId: socket.data.user.id,
          type: "comment",
          target: {
            id: commentId,
            type: "comment",
            projectId: projectId,
          },
        });

        await upsertNotification({
          userId: project.authorId,
          fromUserId: socket.data.user.id,
          type: "comment",
          message,
          targetType: "comment",
          targetId: commentId,
          commentId,
        });
      }
    } catch (err) {
      console.error("[Socket] Error in project:comment notification:", err);
    }
  });



  socket.on("message:send", async (messageData) => {
    const { conversationId, content, attachmentUrl, tempId } = messageData;

    if (!conversationId || !content) {
      socket.emit("message:error", { error: "Invalid message data" });
      return;
    }

    try {
      // Save message to database
      const message = await prisma.message.create({
        data: {
          content,
          attachmentUrl: attachmentUrl || null,
          conversationId,
          senderId: socket.data.user.id,
          readAt: null,
          deliveredAt: new Date(),
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      });
      console.log(`[Socket] Message saved successfully:`, message.id);

      // Update conversation timestamp
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      // Broadcast the message to ALL users in the conversation (including sender)
      console.log(`[Socket] Broadcasting message to conversation ${conversationId}`);
      io.to(conversationId).emit("message:new", {
        ...message,
        conversationId,
        tempId, // Include tempId for client-side handling
      });

      // Emit delivery confirmation to the sender
      socket.emit("message:delivered", {
        messageId: message.id,
        conversationId,
        deliveredAt: message.deliveredAt,
      });

      console.log(`[Socket] Message broadcasted to conversation ${conversationId}`);
    } catch (error) {
      console.error("[Socket] Error saving message:", error);

      socket.emit("message:error", { error: "Failed to save message", tempId });
    }
  });

  // Handle message read status
  socket.on("message:read", async ({ conversationId, messageId }) => {
    try {
      const message = await prisma.message.update({
        where: { id: messageId },
        data: { readAt: new Date() },
      });

      console.log(`[Socket] Message ${messageId} marked as read in ${conversationId} by ${socket.data.user.id}`);
      io.to(conversationId).emit("message:read", {
        conversationId,
        messageId,
        userId: socket.data.user.id,
        readAt: message.readAt,
      });
    } catch (error) {
      console.error("[Socket] Error marking message as read:", error);
    }
  });

  // Mark all messages in a conversation as read
  socket.on("messages:read:all", async ({ conversationId }) => {
    try {
      const result = await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: socket.data.user.id },
          readAt: null,
        },
        data: { readAt: new Date() },
      });

      if (result.count > 0) {
        console.log(`[Socket] ${result.count} messages marked as read in ${conversationId} by ${socket.data.user.id}`);
        io.to(conversationId).emit("messages:read:all", {
          conversationId,
          userId: socket.data.user.id,
          count: result.count,
          readAt: new Date(),
        });
      }
    } catch (error) {
      console.error("[Socket] Error marking all messages as read:", error);
    }
  });

  // Handle typing indicators with improved logic
  socket.on("typing:start", ({ conversationId }) => {
    console.log(`[Socket] ${socket.data.user.id} started typing in ${conversationId}`);

    // Clean up any existing timeout for this user
    cleanupTypingStatus(conversationId, socket.data.user.id);

    // Initialize conversation typing map if needed
    if (!typingUsers.has(conversationId)) {
      typingUsers.set(conversationId, new Map());
    }

    const conversationTyping = typingUsers.get(conversationId)!;

    // Set a timeout to automatically stop typing after 5 seconds
    const timeout = setTimeout(() => {
      console.log(`[Socket] Auto-stopping typing for ${socket.data.user.id} in ${conversationId}`);
      cleanupTypingStatus(conversationId, socket.data.user.id);

      // Broadcast typing stop
      socket.to(conversationId).emit("user:typing", {
        userId: socket.data.user.id,
        conversationId,
        typing: false,
      });
    }, 5000);

    conversationTyping.set(socket.data.user.id, timeout);

    // Broadcast to others in the conversation
    socket.to(conversationId).emit("user:typing", {
      userId: socket.data.user.id,
      conversationId,
      typing: true,
    });
  });

  socket.on("typing:stop", ({ conversationId }) => {
    console.log(`[Socket] ${socket.data.user.id} stopped typing in ${conversationId}`);

    // Clean up typing status
    cleanupTypingStatus(conversationId, socket.data.user.id);

    // Broadcast to others in the conversation
    socket.to(conversationId).emit("user:typing", {
      userId: socket.data.user.id,
      conversationId,
      typing: false,
    });
  });

  // Handle comment like notification
  socket.on(
    "comment:like",
    async ({
      commentId,
      userId,
      // projectId
    }) => {
      try {
        const comment = await prisma.comment.findUnique({
          where: { id: commentId },
          select: { authorId: true },
        });
        if (comment && comment.authorId !== socket.data.user.id) {
          const message = "Someone liked your comment!";
          notifyUser(io, comment.authorId, "notification:comment-like", {
            commentId,
            userId,
            type: "comment-like",
            target: {
              id: commentId,
              type: "comment",
              commentId: commentId,
            },
          });

          await upsertNotification({
            userId: comment.authorId,
            fromUserId: socket.data.user.id,
            type: "like",
            message,
            targetType: "comment",
            targetId: commentId,
            commentId,
          });
        }
      } catch (err) {
        console.error("[Socket] Error in comment:like notification:", err);
      }
    },
  );

  // Handle comment reply notification
  socket.on(
    "comment:reply",
    async ({
      parentId,
      commentId,
    }) => {
      try {
        const parentComment = await prisma.comment.findUnique({
          where: { id: parentId },
          select: { authorId: true },
        });
        if (parentComment && parentComment.authorId !== socket.data.user.id) {
          const message = "Someone replied to your comment!";
          notifyUser(io, parentComment.authorId, "notification:reply", {
            parentId,
            commentId,
            userId: socket.data.user.id,
            type: "reply",
            target: {
              id: commentId,
              type: "comment",
              commentId: commentId,
                    },
          });

          await upsertNotification({
            userId: parentComment.authorId,
            fromUserId: socket.data.user.id,
            type: "comment",
            message,
            targetType: "comment",
            targetId: commentId,
            commentId,
          });
        }
      } catch (err) {
        console.error("[Socket] Error in comment:reply notification:", err);
      }
    },
  );

    // COLLABORATION REQUEST NOTIFICATION
    socket.on("idea:collab-request", async ({ ideaId, requestId }) => {
  try {
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
      select: { authorId: true },
    });
    if (idea && idea.authorId !== socket.data.user.id) {
      const message = "You received a collaboration request!";
      notifyUser(io, idea.authorId, "notification:collab-request", {
        ideaId,
        requestId,
        userId: socket.data.user.id,
        type: "idea:collab-request",
        target: {
          id: ideaId,
          type: "idea",
          ideaId: ideaId,
        },
      });

      await upsertNotification({
        userId: idea.authorId,
        fromUserId: socket.data.user.id,
        type: "collab-request",
        message,
        targetType: "idea",
        targetId: ideaId,
        ideaId,
      });
    }
  } catch (err) {
    console.error("[So`cket] Error in idea:collab-request notification:", err);
  }
});

// COLLABORATION ACCEPTED NOTIFICATION
socket.on("idea:collab-accepted", async ({ ideaId, requestId, userId }) => {
  try {
    const message = "Your collaboration request was accepted!";
    // Notify the user who requested collaboration
    notifyUser(io, userId, "notification:collab-accepted", {
      ideaId,
      requestId,
      userId,
      type: "idea:collab-accepted",
      target: {
        id: ideaId,
        type: "ideea",
        ideaId: ideaId,
      },
    });
    await upsertNotification({
      userId: userId,
      fromUserId: socket.data.user.id,
      type: "collab-accepted",
      message,
      targetType: "idea",
      targetId: ideaId,
      ideaId,
    });
  } catch (err) {
    console.error("[Socket] Error in ideaId:collab-accepted notification:", err);
  }
});

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`[Socket] Disconnected: ${socket.id} (${socket.data.user?.email})`);

    // Remove user from all typing and active user lists
    for (const [conversationId, conversationTyping] of typingUsers.entries()) {
      if (conversationTyping.has(socket.data.user.id)) {
        cleanupTypingStatus(conversationId, socket.data.user.id);

        // Notify others that user stopped typing
        socket.to(conversationId).emit("user:typing", {
          userId: socket.data.user.id,
          conversationId,
          typing: false,
        });
      }
    }

    for (const [conversationId, conversationActiveUsers] of activeUsers.entries()) {
      if (conversationActiveUsers.has(socket.data.user.id)) {
        conversationActiveUsers.delete(socket.data.user.id);

        // Clean up empty sets
        if (conversationActiveUsers.size === 0) {
          activeUsers.delete(conversationId);
        }

        // Notify others that user is no longer active
        socket.to(conversationId).emit("user:inactive", {
          userId: socket.data.user.id,
          conversationId,
        });
      }
    }
  });
});

httpServer.listen(5000, () => {
  checkDatabaseConnection();
  console.log("[WebSocket] Server running on port 5000");
});
