import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { content, conversationId, attachmentUrl } = body;

  if (!conversationId || (!content && !attachmentUrl)) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  try {
    const message = await prisma.message.create({
      data: {
        content,
        attachmentUrl,
        senderId: session.user.id,
        conversationId,
      },
      include: {
        sender: true,
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("[SEND_MESSAGE_ERROR]", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        users: {
          some: { id: session.user.id },
        },
      },
      include: {
        users: {
          select: { id: true, name: true, username: true, image: true },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: {
              select: { id: true, name: true, username: true, image: true },
            },
          },
        },
      },
    });

    return NextResponse.json(conversations);
  } catch (err) {
    console.error("[ALL_MESSAGES_FETCH_ERROR]", err);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}
