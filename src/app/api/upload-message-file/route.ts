import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";

import { v4 as uuid } from "uuid";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file || file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Invalid or too large file" }, { status: 400 });
  }


  const fileExt = file.name.split(".").pop();
  const fileName = `message-${uuid()}.${fileExt}`;
  const filePath = `user-${session.user.id}/messages/${fileName}`;

  const { error } = await supabase.storage
    .from("message-attachments")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    console.error("[UPLOAD_ERROR]", error.message);
    return NextResponse.json({ error: "Failed to upload" }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("message-attachments").getPublicUrl(filePath);

  return NextResponse.json({ url: publicUrl });
}
