import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    // First verify the user has access to this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: id,
        users: {
          some: {
            id: session.user.id,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found or access denied" }, { status: 404 });
    }

    // Pagination parameters
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build the query
    const whereClause = {
      conversationId: id,
    };

    const orderBy = cursor
      ? { createdAt: "desc" as const } // For pagination, get older messages
      : { createdAt: "asc" as const }; // For initial load, get chronological order

    // Fetch ALL messages for this conversation
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
      orderBy: orderBy,
      take: cursor ? limit + 1 : limit, // Get one extra for pagination
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0, // Skip the cursor itself
    });

    let messagesToReturn = messages;
    let hasMore = false;
    let nextCursor = null;

    if (cursor) {
      // For pagination requests
      hasMore = messages.length > limit;
      messagesToReturn = hasMore ? messages.slice(0, -1) : messages;
      nextCursor = hasMore ? messagesToReturn[messagesToReturn.length - 1]?.id : null;

      // Reverse to maintain chronological order
      messagesToReturn = messagesToReturn.reverse();
    } else {
      // For initial load, check if there are more messages
      const totalCount = await prisma.message.count({
        where: whereClause,
      });

      hasMore = totalCount > limit;
      nextCursor = hasMore ? messagesToReturn[0]?.id : null;

      messagesToReturn = messagesToReturn.reverse();
    }

    return NextResponse.json({
      messages: messagesToReturn,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("[GET_MESSAGES_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}
