// /app/api/auth/login/route.ts
import prisma from "@/lib/prisma";
import { verifyPassword } from "@/utils/crypto.utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: {
      //   OR: [{ email: username }, { phone: username }], add when phone functionality is add
      OR: [{ email: username }],
    },
  });

  if (!user || !user.hashedPassword) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const isValid = await verifyPassword(user.hashedPassword, password);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    // username: user.email || user.phone,
    username: user.email,
  });
}
