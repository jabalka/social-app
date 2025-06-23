// api/conversations/route.ts
import { getUserConversations } from "@/api";
import { NextResponse } from "next/server";


export async function GET() {
  const { data, error, status } = await getUserConversations();

  if (error) {
    return NextResponse.json({ error }, { status });
  }

  return NextResponse.json(data, { status });
}
