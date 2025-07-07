import { NextRequest, NextResponse } from "next/server";
import { createNotification, getUserNotifications } from "@/lib/api/notifications";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
    const notification = await createNotification({ ...body, userId: session.user.id });
    return NextResponse.json({ data: notification });

}

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
 
      const notifications = await getUserNotifications(session.user.id);
      return NextResponse.json({ data: notifications });

  }