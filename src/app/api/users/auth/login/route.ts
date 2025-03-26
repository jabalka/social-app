import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    const user = await authenticateUser(username, password)

    return NextResponse.json(user)
  } catch (error: any) {
    console.error("Login error:", error)
    return NextResponse.json({ error: error.message || "Authentication failed" }, { status: 401 })
  }
}

