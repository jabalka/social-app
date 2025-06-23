import { NextRequest, NextResponse } from "next/server";
import { toggleProjectLike, getProjectLikes } from "@/api";

export async function POST(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await context.params;
  const result = await toggleProjectLike(projectId);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result.data, { status: result.status });
}

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await context.params;
  const result = await getProjectLikes(projectId);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result.data, { status: result.status });
}