// src/app/api/conversations/[id]/read/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> } // Note the Promise wrapper
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params; // Await the params

  try {
    const updated = await prisma.message.updateMany({
      where: {
        conversationId: id, // Use the awaited id
        senderId: { not: session.user.id },
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return NextResponse.json({ updated: updated.count });
  } catch (error) {
    console.error("[PATCH_READ_CONVERSATION_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to mark as read" },
      { status: 500 }
    );
  }
}