import { auth } from "@/auth";
import { v4 as uuid } from "uuid";
import { supabase } from "../supabase";
import { prisma } from "@/lib/prisma";

export async function uploadProjectImage(formData: FormData, userId: string) {
  const file = formData.get("image") as File;
  if (!file) {
    return { error: "Missing image or projectId", status: 400 };
  }

  const projectId = formData.get("projectId")?.toString();
  if (!projectId) {
    return { error: "Missing projectId", status: 400 };
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `user-${userId}/project-${projectId}/${fileName}`;

  const { error } = await supabase.storage.from("projects-images").upload(filePath, file);
  if (error) {
    return { error: error.message, status: 500 };
  }

  const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/projects-images/${filePath}`;
  return { data: { url: imageUrl }, status: 200 };
}


export async function uploadUserProfileImage(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }

  const formData = await req.formData();
  const file = formData.get("image") as File;

  if (!file) {
    return { error: "Missing image", status: 400 };
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `profile-${Date.now()}.${fileExt}`;
  const filePath = `user-${session.user.id}/${fileName}`;

  const { error } = await supabase.storage.from("profile-pictures").upload(filePath, file, {
    upsert: true,
  });

  if (error) {
    return { error: error.message, status: 500 };
  }

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-pictures/${filePath}`;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: publicUrl },
  });

  return { data: { url: publicUrl }, status: 200 };
}


export async function uploadMessageFile(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file || file.size > 5 * 1024 * 1024) {
    return { error: "Invalid or too large file", status: 400 };
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `message-${uuid()}.${fileExt}`;
  const filePath = `user-${session.user.id}/messages/${fileName}`;

  const { error } = await supabase.storage.from("message-attachments").upload(filePath, file, {
    contentType: file.type,
    upsert: true,
  });

  if (error) {
    return { error: "Failed to upload", status: 500 };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("message-attachments").getPublicUrl(filePath);

  return { data: { url: publicUrl }, status: 200 };
}
