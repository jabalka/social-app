import { type NextRequest, NextResponse } from "next/server"
import { createUser, getUserByField } from "@/lib/auth"
import type { UserModel } from "@/hooks/use-auth"

export async function POST(request: NextRequest) {
  try {
    const userData: UserModel = await request.json()

    // Check if user already exists
    const existingUser = await getUserByField("username", userData.username)
    if (existingUser) {
      return NextResponse.json({ error: "User with this username already exists" }, { status: 400 })
    }

    if (userData.email) {
      const emailUser = await getUserByField("email", userData.email)
      if (emailUser) {
        return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
      }
    }

    if (userData.phone) {
      const phoneUser = await getUserByField("phone", userData.phone.toString())
      if (phoneUser) {
        return NextResponse.json({ error: "User with this phone already exists" }, { status: 400 })
      }
    }

    // Create new user
    const newUser = await createUser(userData)

    return NextResponse.json(newUser, { status: 201 })
  } catch (error: any) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: error.message || "Failed to create user" }, { status: 500 })
  }
}

