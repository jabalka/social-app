import { getMessages, sendMessage } from "@/api";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { content, attachmentUrl, conversationId } = await req.json();
    const result = await sendMessage(content, conversationId, attachmentUrl);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("[SEND_MESSAGE_ERROR]", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId") || "";
    const cursor = searchParams.get("cursor") || undefined;
    const limit = Number(searchParams.get("limit")) || 20;

    const result = await getMessages(conversationId, cursor, limit);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data, { status: result.status });
  } catch (err) {
    console.error("[ALL_MESSAGES_FETCH_ERROR]", err);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}