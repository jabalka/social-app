import { NextRequest, NextResponse } from "next/server";
import { uploadUserProfileImage } from "@/api";

export async function POST(req: NextRequest) {
  const result = await uploadUserProfileImage(req);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data, { status: result.status });
}