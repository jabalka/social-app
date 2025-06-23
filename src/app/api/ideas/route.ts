import { auth } from "@/auth";
import { createIdea, getAllIdeas, getIdeasNearby } from "@/lib/api/ideas";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const near = searchParams.get('near');
  const radius = parseInt(searchParams.get('radius') || "5000", 10);

  if (near) {
    const [lat, lng] = near.split(',').map(Number);
    const ideas = await getIdeasNearby(lat, lng, radius);
    return NextResponse.json({ data: ideas });
  }

  const w3w = searchParams.get('what3words');
  let ideas;
  if (w3w) {
    ideas = await prisma.idea.findMany({
      where: { what3words: w3w },
      include: { author: { select: { id: true, name: true, image: true } }, likes: true, comments: true, collaborators: true },
    });
  } else {
    ideas = await getAllIdeas();
  }
  return NextResponse.json({ data: ideas });

}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content, allowCollab, latitude, longitude, postcode, what3words  } = await req.json();
  try {
    const idea = await createIdea({ title, content, allowCollab, latitude, longitude, postcode, what3words  }, session.user.id);
    return NextResponse.json({ data: idea }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create idea", err }, { status: 500 });
  }
}
