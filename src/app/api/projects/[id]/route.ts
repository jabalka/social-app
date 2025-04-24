// app/api/projects/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await req.json();
  const { imageUrls } = body;

  try {
    const updatedProject = await prisma.project.update({
      where: { id },
      data: { imageUrls },
    });

    return NextResponse.json(updatedProject);
  } catch (err) {
    console.error("[PROJECT_PATCH_ERROR]", err);
    return NextResponse.json({ error: "Failed to update project with image URLs" }, { status: 500 });
  }
}
