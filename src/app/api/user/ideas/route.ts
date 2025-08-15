import { NextRequest, NextResponse } from "next/server";
import { getUserIdeas } from "@/api";

export async function GET(req: NextRequest) {
  const result = await getUserIdeas(req);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data, { status: result.status });
}