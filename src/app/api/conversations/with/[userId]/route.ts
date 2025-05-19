// src/app/api/conversations/with/[userId]/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { userId } = await context.params;
  const currentUserId = session.user.id;

  try {
    // Check for existing conversation
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        users: {
          every: {
            id: {
              in: [currentUserId, userId],
            },
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
    });

    if (existingConversation) {
      return NextResponse.json({
        id: existingConversation.id,
        messages: existingConversation.messages || [],
      });
    }

    // Create new conversation
    const newConversation = await prisma.conversation.create({
      data: {
        users: {
          connect: [{ id: currentUserId }, { id: userId }],
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
        messages: true,
      },
    });

    return NextResponse.json(
      {
        id: newConversation.id,
        messages: newConversation.messages || [],
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("[CONVERSATION_CREATION_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}