import { compare, hash } from "bcryptjs";
// import prisma from "./prisma"
// import type { UserModel } from "@/hooks/use-auth"

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

// export async function getUserByField(field: string, value: string) {
//   if (!value) return null

//   try {
//     const whereClause: any = {}
//     whereClause[field] = value

//     const user = await prisma.user.findUnique({
//       where: whereClause,
//     })

//     return user
//   } catch (error) {
//     console.error("Error retrieving user:", error)
//     return null
//   }
// }

// export async function createUser(userData: UserModel) {
//   try {
//     const hashedPassword = await hashPassword(userData.password!)

//     const newUser = await prisma.user.create({
//       data: {
//         name: userData.name,
//             email: userData.email || null,
//         hashedPassword: hashedPassword,
//         image: userData.photoUrl || null,

//       },
//     })

//     // Return user without password
//     const { password, ...userWithoutPassword } = newUser
//     return userWithoutPassword
//   } catch (error) {
//     console.error("Error creating user:", error)
//     throw new Error("Failed to create user")
//   }
// }

// export async function authenticateUser(username: string, password: string) {
//   try {
//     // Find user by username, email, or phone
//     const user = await prisma.user.findFirst({
//       where: {
//         OR: [{ username }, { email: username }, { phone: username }],
//       },
//     })

//     if (!user) {
//       throw new Error("User not found")
//     }

//     const isValid = await verifyPassword(password, user.password)
//     if (!isValid) {
//       throw new Error("Invalid password")
//     }

//     // Return user without password
//     const { password: _, ...userWithoutPassword } = user
//     return userWithoutPassword
//   } catch (error) {
//     console.error("Error authenticating user:", error)
//     throw error
//   }
// }
