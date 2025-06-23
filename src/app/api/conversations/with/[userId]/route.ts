import { createOrGetConversationWithUser } from "@/api";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    const result = await createOrGetConversationWithUser(userId);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("[CONVERSATION_CREATION_ERROR]", error);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}