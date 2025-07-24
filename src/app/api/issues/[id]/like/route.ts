import { NextRequest, NextResponse } from "next/server";
import { toggleIssueLike, getIssueLikes } from "@/api";

export async function POST(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: issueId } = await context.params;
  const result = await toggleIssueLike(issueId);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result.data, { status: result.status });
}

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: issueId } = await context.params;
  const result = await getIssueLikes(issueId);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result.data, { status: result.status });
}