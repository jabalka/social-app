import { toggleCommentLike } from "@/api";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ projectId: string; commentId: string }> },
) {
  const { commentId } = await context.params;
  const result = await toggleCommentLike(commentId);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data, { status: result.status });
}