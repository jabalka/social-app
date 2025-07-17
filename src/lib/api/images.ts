import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { v4 as uuid } from "uuid";
import { canEditImages } from "../role-permissions";
import { supabase } from "../supabase";

const storageUrlBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/projects-images/`;

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

  const imageUrl = `${storageUrlBase}${filePath}`;
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

export async function deleteProjectImage(
  projectId: string,
  imageUrl: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      images: true,
      author: true,
    },
  });

  if (!project) {
    return { success: false, error: "Project not found" };
  }

  if (project.authorId !== userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { roleId: true },
    });

    const hasRoleRights = canEditImages(user?.roleId) || project.authorId === userId;

    if (!hasRoleRights) {
      return { success: false, error: "Permission denied" };
    }
  }

  const projectImage = project.images.find((img) => img.url === imageUrl);
  if (!projectImage) {
    return { success: false, error: "Image not found in project" };
  }

  if (!imageUrl.startsWith(storageUrlBase)) {
    return { success: false, error: "Invalid image URL format" };
  }

  const storagePath = imageUrl.replace(storageUrlBase, "");

  const { error: storageError } = await supabase.storage.from("projects-images").remove([storagePath]);

  if (storageError) {
    console.error("Failed to delete from storage:", storageError);
  }

  await prisma.projectImage.delete({
    where: {
      id: projectImage.id,
    },
  });

  return { success: true };
}
