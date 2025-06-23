import { auth } from "@/auth";
import { createIdeaCollab } from "@/lib/api/ideas";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: ideaId } = await context.params;

  try {
    const collab = await createIdeaCollab(ideaId, session.user.id);
    return NextResponse.json({ data: collab });
  } catch (err) {
    return NextResponse.json({ error: "Failed to request collaboration", err }, { status: 500 });
  }
}
