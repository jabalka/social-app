import { NextRequest, NextResponse } from "next/server";
import { getUserCommentsAndLikes } from "@/api";

export async function GET(request: NextRequest) {
  const result = await getUserCommentsAndLikes(request);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data, { status: result.status });
}