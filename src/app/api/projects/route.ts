// app/api/projects/route.ts
import { createProject, getProjects } from "@/api";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { data, error, status } = await createProject(req);
  if (error) return NextResponse.json({ error }, { status });
  return NextResponse.json(data, { status });
}

export async function GET(req: NextRequest) {
  const { data, error, status } = await getProjects(req);
  if (error) return NextResponse.json({ error }, { status });
  return NextResponse.json(data, { status });
}
