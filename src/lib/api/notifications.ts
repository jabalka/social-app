import { prisma } from "../prisma";

export async function createNotification(data: {
  userId: string;
  type: string;
  message: string;
  targetType: string;
  targetId: string;
  projectId?: string;
  ideaId?: string;
  commentId?: string;
}) {
  return prisma.notification.create({ data });
}

export async function getUserNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100, // limit for performance
  });
}

export async function markNotificationRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true, readAt: new Date() },
  });
}

export async function deleteNotification(notificationId: string, userId: string) {
  return prisma.notification.deleteMany({
    where: { id: notificationId, userId },
  });
}

export async function upsertNotification({
  userId,
  fromUserId,
  type,
  message,
  targetType,
  targetId,
  projectId,
  ideaId,
  commentId,
}: {
  userId: string;
  fromUserId: string;
  type: string;
  message: string;
  targetType: "project" | "comment" | "idea";
  targetId: string;
  projectId?: string;
  ideaId?: string;
  commentId?: string;
}) {
  if (targetType === "project" && projectId) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new Error("Project not found");
  } else if (targetType === "comment" && commentId) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new Error("Comment not found");
  } else if (targetType === "idea" && ideaId) {
    const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
    if (!idea) throw new Error("Idea not found");
  }

  const existing = await prisma.notification.findFirst({
    where: {
      userId,
      fromUserId,
      type,
      targetType,
      targetId,
      read: false,
    },
  });

  if (existing) {
    return prisma.notification.update({
      where: { id: existing.id },
      data: {
        message,
        createdAt: new Date(),
      },
    });
  } else {
    return prisma.notification.create({
      data: {
        userId,
        fromUserId,
        type,
        message,
        targetType,
        targetId,
        projectId,
        ideaId,
        commentId,
      },
    });
  }
}