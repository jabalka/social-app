import { deleteProjectImage } from "@/api";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { projectId, imageUrl } = body;

    if (!projectId || !imageUrl) {
      return NextResponse.json({ error: "Project ID and image URL are required" }, { status: 400 });
    }

    const result = await deleteProjectImage(projectId, imageUrl, session.user.id);

    if (result.success) {
      return NextResponse.json({ message: "Image deleted successfully" });
    } else {
      return NextResponse.json(
        { error: result.error || "Failed to delete image" },
        { status: result.error === "Permission denied" ? 403 : 400 },
      );
    }
  } catch (error) {
    console.error("Error deleting project image:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
