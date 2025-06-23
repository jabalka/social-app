import { auth } from "@/auth";
import { updateIdeaCollab } from "@/lib/api/ideas";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string; collabId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { collabId } = await context.params;
  const { status } = await request.json();

  try {
    const collab = await updateIdeaCollab(collabId, status);
    return NextResponse.json({ data: collab });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update collaboration", err }, { status: 500 });
  }
}
