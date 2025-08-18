import { auth } from "@/auth";
import { createIdea, getIdeasForRequest } from "@/lib/api/ideas";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const result = await getIdeasForRequest(req);
    return NextResponse.json({ data: result.ideas, totalCount: result.totalCount });
  } catch (err) {
    console.error("[IDEAS_GET_ERROR]", err);
    return NextResponse.json({ error: "Failed to fetch ideas" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, content, allowCollab, latitude, longitude, postcode, what3words } = await req.json();
    const idea = await createIdea(
      { title, content, allowCollab, latitude, longitude, postcode, what3words },
      session.user.id,
    );
    return NextResponse.json({ data: idea }, { status: 201 });
  } catch (err) {
    console.error("[IDEAS_CREATE_ERROR]", err);
    return NextResponse.json({ error: "Failed to create idea" }, { status: 500 });
  }
}
