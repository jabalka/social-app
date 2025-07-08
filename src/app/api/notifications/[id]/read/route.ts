import { NextRequest, NextResponse } from "next/server";
import { markNotificationRead } from "@/lib/api/notifications";
import { auth } from "@/auth";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await markNotificationRead(id, session.user.id);
    return NextResponse.json({ success: true });

}