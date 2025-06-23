import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";


export const createOrGetConversationWithUser = async (otherUserId: string) => {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }

  const currentUserId = session.user.id;

  if (currentUserId === otherUserId) {
    return { error: "Cannot create conversation with yourself", status: 400 };
  }

  const users = await prisma.user.findMany({
    where: {
      id: {
        in: [currentUserId, otherUserId],
      },
    },
  });

  if (users.length !== 2) {
    return { error: "One or both users not found", status: 404 };
  }

  // Check for existing conversation
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      AND: [
        { users: { some: { id: currentUserId } } },
        { users: { some: { id: otherUserId } } },
      ],
    },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
    },
  });

  if (existingConversation) {
    return { data: existingConversation, status: 200 };
  }

  // Create new conversation
  const newConversation = await prisma.conversation.create({
    data: {
      users: {
        connect: [{ id: currentUserId }, { id: otherUserId }],
      },
    },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
    },
  });

  return { data: newConversation, status: 201 };
};

export const getUserConversations = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        users: {
          some: {
            id: session.user.id,
          },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            readAt: null,
            senderId: {
              not: session.user.id,
            },
          },
        });

        return {
          ...conv,
          unreadCount,
        };
      })
    );

    return { data: conversationsWithUnread, status: 200 };
  } catch (error) {
    console.error("[GET_CONVERSATIONS_ERROR]", error);
    return { error: "Failed to fetch conversations", status: 500 };
  }
};

export const getConversationMessages = async (req: NextRequest, conversationId: string) => {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
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
      return { error: "Conversation not found or access denied", status: 404 };
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "50");

    const whereClause = { conversationId };
    const orderBy = cursor
      ? { createdAt: "desc" as const }
      : { createdAt: "asc" as const };

    const messages = await prisma.message.findMany({
      where: whereClause,
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
      orderBy,
      take: cursor ? limit + 1 : limit,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
    });

    let messagesToReturn = messages;
    let hasMore = false;
    let nextCursor = null;

    if (cursor) {
      hasMore = messages.length > limit;
      messagesToReturn = hasMore ? messages.slice(0, -1) : messages;
      nextCursor = hasMore ? messagesToReturn[messagesToReturn.length - 1]?.id : null;
      messagesToReturn = messagesToReturn.reverse();
    } else {
      const totalCount = await prisma.message.count({ where: whereClause });
      hasMore = totalCount > limit;
      nextCursor = hasMore ? messagesToReturn[0]?.id : null;
      messagesToReturn = messagesToReturn.reverse();
    }

    return {
      data: {
        messages: messagesToReturn,
        nextCursor,
        hasMore,
      },
      status: 200,
    };
  } catch (error) {
    console.error("[GET_MESSAGES_ERROR]", error);
    return { error: "Failed to fetch messages", status: 500 };
  }
};

export const markConversationAsRead = async (conversationId: string) => {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const updated = await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: session.user.id },
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return { data: { updated: updated.count }, status: 200 };
  } catch (error) {
    console.error("[PATCH_READ_CONVERSATION_ERROR]", error);
    return { error: "Failed to mark as read", status: 500 };
  }
};
// ##################### CONVERSATION ###############################