// app/api/projects/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  const body = await req.json();
  const { imageUrls } = body;

  if (!id) {
    return NextResponse.json({ error: "Project ID missing" }, { status: 400 });
  }

  try {
    await prisma.projectImage.createMany({
      data: imageUrls.map((url: string) => ({
        url,
        projectId: id,
      })),
    });

    return NextResponse.json({ message: "Images added successfully" });
  } catch (error) {
    console.error("Image insert error", error);
    return NextResponse.json({ error: "Failed to attach images" }, { status: 500 });
  }
}
