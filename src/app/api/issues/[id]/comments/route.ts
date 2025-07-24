import { NextRequest, NextResponse } from "next/server";
import {
  createIssueComment,
  getIssueComments,
} from "@/api";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: issueId } = await context.params;
  const { content, parentId } = await request.json();
  const result = await createIssueComment(issueId, content, parentId);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result.data, { status: result.status });
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: issueId } = await context.params;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

  const result = await getIssueComments(issueId, page, pageSize);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result.data, { status: result.status });
}