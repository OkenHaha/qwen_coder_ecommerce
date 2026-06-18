"use server"

import { prisma } from "@/lib/prisma"
import { signIn } from "@/lib/auth"
import { AuthError } from "next-auth"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { requireAuth } from "@/lib/auth-guard"

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function signup(formData: FormData) {
  const validated = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors }
  }

  const { name, email, password } = validated.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: { email: ["Email already registered"] } }
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: { name, email, password: hashedPassword },
  })

  await signIn("credentials", { email, password, redirectTo: "/" })
}

export async function login(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" }
        default:
          return { error: "Something went wrong" }
      }
    }
    throw error // NextAuth throws to redirect
  }
}

// Don't forget the NextAuth route handler!
// Create: src/app/api/auth/[...nextauth]/route.ts
//   import { handlers } from "@/lib/auth"
//   export const { GET, POST } = handlers

export async function updateProfile(data: { name: string; phone?: string }) {
  const user = await requireAuth()

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: data.name,
      phone: data.phone,
    },
  })

  return updatedUser
}