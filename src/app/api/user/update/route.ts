import { NextRequest, NextResponse } from "next/server";
import { updateUserProfile } from "@/api";

export async function POST(req: NextRequest) {
  const result = await updateUserProfile(req);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data, { status: result.status });
}