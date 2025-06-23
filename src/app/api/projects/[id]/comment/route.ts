import { NextRequest, NextResponse } from "next/server";
import {
  createComment,
  getProjectComments,
  updateComment,
  deleteComment,
} from "@/api";

// Create a comment
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await context.params;
  const { content, parentId } = await request.json();
  const result = await createComment(projectId, content, parentId);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result.data, { status: result.status });
}

// Get paginated comments for a project
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await context.params;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

  const result = await getProjectComments(projectId, page, pageSize);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result.data, { status: result.status });
}

// Edit a comment
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: commentId } = await context.params;
  const { content } = await request.json();
  const result = await updateComment(commentId, content);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result.data, { status: result.status });
}

// Delete a comment
export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: commentId } = await context.params;
  const result = await deleteComment(commentId);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result.data, { status: result.status });
}