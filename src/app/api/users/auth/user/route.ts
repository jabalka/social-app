import { type NextRequest, NextResponse } from "next/server"
import { getUserByField } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const field = searchParams.get("field")
    const value = searchParams.get("value")

    if (!field || !value) {
      return NextResponse.json({ error: "Field and value parameters are required" }, { status: 400 })
    }

    const user = await getUserByField(field, value)

    if (!user) {
      return NextResponse.json(null)
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword)
  } catch (error: any) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: error.message || "Failed to retrieve user" }, { status: 500 })
  }
}

