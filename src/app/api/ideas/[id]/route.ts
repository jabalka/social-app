import { auth } from "@/auth";
import { deleteIdea, getIdeaById, updateIdea } from "@/lib/api/ideas";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const idea = await getIdeaById(id);
    if (!idea) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: idea });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch idea", err }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const data = await request.json();

  try {
    const updatedIdea = await updateIdea(id, data);
    return NextResponse.json({ data: updatedIdea });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update idea", err }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  try {
    await deleteIdea(id);
    return NextResponse.json({ message: "Idea deleted" });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete idea", err }, { status: 500 });
  }
}
