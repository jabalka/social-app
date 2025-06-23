import { getConversationMessages } from "@/api";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { data, error, status } = await getConversationMessages(req, id);

  if (error) {
    return NextResponse.json({ error }, { status });
  }

  return NextResponse.json(data, { status });
}
