"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-guard"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const CartItemSchema = z.object({
  productId: z.string().cuid(),
  variantId: z.string().cuid().nullable(),
  quantity: z.number().int().min(1).default(1),
})

// Get cart items (from DB for logged-in users)
export async function getCartItems() {
  try {
    const user = await requireAuth()
    return prisma.cartItem.findMany({
      where: { userId: user.id },
      include: {
        product: { include: { images: { where: { isPrimary: true } } } },
        variant: true,
      },
    })
  } catch {
    return [] // not logged in — use Zustand localStorage cart instead
  }
}

// Add to cart (DB)
export async function addToCart(data: z.infer<typeof CartItemSchema>) {
  const user = await requireAuth()
  const validated = CartItemSchema.safeParse(data)
  
  if (!validated.success) {
    return { error: "Invalid data" }
  }

  const { productId, variantId, quantity } = validated.data

  // Note: If variantId is null, Prisma's unique constraint won't prevent duplicate 
  // products without variants. We handle this by checking productId if variantId is null.
  const whereClause = variantId 
    ? { userId_variantId: { userId: user.id, variantId } }
    : { userId_productId: { userId: user.id, productId } } // Requires adding @@unique([userId, productId]) to schema for null variants

  const existing = await prisma.cartItem.findFirst({
    where: { 
      userId: user.id, 
      OR: [
        { variantId: variantId ?? undefined },
        { productId: productId, variantId: null }
      ]
    }
  })

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    })
  } else {
    await prisma.cartItem.create({
      data: { userId: user.id, productId, variantId, quantity },
    })
  }

  revalidatePath("/cart")
}

// Update quantity
export async function updateCartQuantity(cartItemId: string, quantity: number) {
  const user = await requireAuth()
  
  if (quantity < 1) {
    return { error: "Quantity must be at least 1" }
  }

  // Security: Ensure the cart item belongs to the user
  await prisma.cartItem.updateMany({
    where: { id: cartItemId, userId: user.id }, 
    data: { quantity },
  })

  revalidatePath("/cart")
}

// Remove from cart
export async function removeFromCart(cartItemId: string) {
  const user = await requireAuth()
  
  // Security: Ensure the cart item belongs to the user
  await prisma.cartItem.deleteMany({
    where: { id: cartItemId, userId: user.id },
  })
  
  revalidatePath("/cart")
}

// Clear cart (called after order placement)
export async function clearCart() {
  const user = await requireAuth()
  await prisma.cartItem.deleteMany({
    where: { userId: user.id },
  })
  revalidatePath("/cart")
}