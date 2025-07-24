import { NextRequest, NextResponse } from "next/server";
import { updateComment, deleteComment } from "@/api";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: commentId } = await context.params;
  const { content } = await request.json();
  const result = await updateComment(commentId, content);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result.data, { status: result.status });
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: commentId } = await context.params;
  const result = await deleteComment(commentId);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result.data, { status: result.status });
}