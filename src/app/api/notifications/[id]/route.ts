import { auth } from "@/auth";
import { deleteNotification } from "@/lib/api/notifications";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await deleteNotification(id, session.user.id);
  return NextResponse.json({ success: true });
}
