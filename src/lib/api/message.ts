import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";


export const sendMessage = async (
  content: string,
  conversationId: string,
  attachmentUrl?: string
) => {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }

  if (!content || !conversationId) {
    return { error: "Content and conversation ID are required", status: 400 };
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      users: {
        some: {
          id: session.user.id,
        },
      },
    },
  });

  if (!conversation) {
    return { error: "Conversation not found", status: 404 };
  }

  try {
    const message = await prisma.message.create({
      data: {
        content,
        attachmentUrl: attachmentUrl || null,
        conversationId,
        senderId: session.user.id,
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

    return { data: message, status: 201 };
  } catch (error) {
    console.error("[SEND_MESSAGE_ERROR]", error);
    return { error: "Failed to send message", status: 500 };
  }
};

export const getMessages = async (
  conversationId: string,
  cursor?: string,
  limit: number = 20
) => {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }

  if (!conversationId) {
    return { error: "Conversation ID is required", status: 400 };
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      users: {
        some: {
          id: session.user.id,
        },
      },
    },
  });

  if (!conversation) {
    return { error: "Conversation not found", status: 404 };
  }

  try {
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        ...(cursor && {
          id: {
            lt: cursor,
          },
        }),
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
      orderBy: {
        createdAt: "desc",
      },
      take: limit + 1,
    });

    const hasMore = messages.length > limit;
    const messagesToReturn = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore ? messagesToReturn[messagesToReturn.length - 1].id : null;

    const chronologicalMessages = messagesToReturn.reverse();

    return {
      data: {
        messages: chronologicalMessages,
        nextCursor,
        hasMore,
      },
      status: 200,
    };
  } catch (err) {
    console.error("[ALL_MESSAGES_FETCH_ERROR]", err);
    return { error: "Failed to fetch messages", status: 500 };
  }
};
