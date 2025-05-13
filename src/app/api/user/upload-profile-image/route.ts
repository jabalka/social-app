import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("image") as File;

  if (!file) {
    return NextResponse.json({ error: "Missing image" }, { status: 400 });
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `profile-${Date.now()}.${fileExt}`;
  const filePath = `user-${session.user.id}/${fileName}`;

  const { error } = await supabase.storage.from("profile-pictures").upload(filePath, file, {
    upsert: true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-pictures/${filePath}`;

  // update  user in DB
  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: publicUrl },
  });

  return NextResponse.json({ url: publicUrl });
}
