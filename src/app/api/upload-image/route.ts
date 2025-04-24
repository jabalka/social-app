import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("image") as File;

  if (!file) {
    return NextResponse.json({ error: "Missing image or projectId" }, { status: 400 });
  }

  const projectId = formData.get("projectId")?.toString();
  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `user-${session.user.id}/project-${projectId}/${fileName}`;

  const { error } = await supabase.storage.from("projects-images").upload(filePath, file);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/projects-images/${filePath}`;
  return NextResponse.json({ url: imageUrl });
}
