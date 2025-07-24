import { createIssueReport, getAllIssueReport } from "@/api";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { data, error, status } = await createIssueReport(req);
  if (error) return NextResponse.json({ error }, { status });
  return NextResponse.json(data, { status });
}

export async function GET(req: NextRequest) {
  const { data, error, status } = await getAllIssueReport(req);
  if (error) return NextResponse.json({ error }, { status });
  return NextResponse.json(data, { status });
}