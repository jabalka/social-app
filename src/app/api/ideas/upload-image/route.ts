// src/app/api/ideas/upload-image/route.ts
import { auth } from "@/auth";
import { uploadIdeaImage } from "@/lib/api/ideas";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();

  const result = await uploadIdeaImage(formData, session.user.id);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status || 500 });
  }
  return NextResponse.json({ data: result.data });
}
