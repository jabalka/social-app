import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, attachmentUrl, conversationId } = await req.json();

    if (!content || !conversationId) {
      return NextResponse.json({ error: "Content and conversation ID are required" }, { status: 400 });
    }

    // Verify user has access to this conversation
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
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

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

    return NextResponse.json(message);
  } catch (error) {
    console.error("[SEND_MESSAGE_ERROR]", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");
    const cursor = searchParams.get("cursor");
    const limit = Number(searchParams.get("limit") || "50");

    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 });
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
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }
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
      take: limit + 1, // Take one extra to check if there are more
    });

    const hasMore = messages.length > limit;
    const messagesToReturn = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore ? messagesToReturn[messagesToReturn.length - 1].id : null;

    // Reverse the order to get chronological order
    const chronologicalMessages = messagesToReturn.reverse();

    return NextResponse.json({
      messages: chronologicalMessages,
      nextCursor,
      hasMore,
    });
  } catch (err) {
    console.error("[ALL_MESSAGES_FETCH_ERROR]", err);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}
