// src/app/api/conversations/with/[userId]/route.ts
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId: otherUserId } = await context.params
    const currentUserId = session.user.id

    if (currentUserId === otherUserId) {
      return NextResponse.json({ error: "Cannot create conversation with yourself" }, { status: 400 })
    }

    const users = await prisma.user.findMany({
      where: {
        id: {
          in: [currentUserId, otherUserId],
        },
      },
    })

    if (users.length !== 2) {
      return NextResponse.json({ error: "One or both users not found" }, { status: 404 })
    }

    // Check for existing conversation
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            users: {
              some: {
                id: currentUserId,
              },
            },
          },
          {
            users: {
              some: {
                id: otherUserId,
              },
            },
          },
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
        // Remove messages from here since we fetch them separately
        // This makes the response faster and more focused
      },
    })

    if (existingConversation) {
      return NextResponse.json(existingConversation)
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
        // No messages included here either since we fetch them separately
      },
    })

    return NextResponse.json(newConversation)
  } catch (error) {
    console.error("[CONVERSATION_CREATION_ERROR]", error)
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
  }
}
