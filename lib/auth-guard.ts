import { auth } from "./auth"
import { redirect } from "next/navigation"

// Get current user (or null) — use in Server Components
export async function getCurrentUser() {
  const session = await auth()
  return session?.user ?? null
}

// Require authentication — redirects to login if not authed
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")
  return user
}

// Require admin role — redirects home if not admin
export async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== "ADMIN") redirect("/")
  return user
}

// Usage in Server Components:
// const user = await requireAuth()
// const admin = await requireAdmin()

// Usage in Server Actions:
// const user = await requireAuth()
// ... then use user.id to filter queries
// const orders = await prisma.order.findMany({ where: { userId: user.id } })