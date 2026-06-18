"use server"

import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { requireAuth, requireAdmin, getCurrentUser } from "@/lib/auth-guard"
import { createRazorpayOrder, verifyPaymentSignature } from "@/lib/razorpay"
import { sendOrderConfirmation } from "@/lib/resend"
import { revalidatePath } from "next/cache"
import { serialize } from "@/lib/utils"

// Get user's orders
export async function getMyOrders() {
  const user = await requireAuth()
  return prisma.order.findMany({
    where: { userId: user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  })
}

// Create order + Razorpay payment
export async function createOrder(
  cartItems: { productId: string; variantId: string | null; quantity: number }[],
  shippingAddress: any,
  shippingCost: number
) {
  const user = await getCurrentUser()

  // Look up actual prices from the database (prevents client-side price tampering)
  const productIds = [...new Set(cartItems.map(i => i.productId))]
  const variantIds = cartItems.map(i => i.variantId).filter(Boolean) as string[]

  const [products, variants] = await Promise.all([
    prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, basePrice: true },
    }),
    variantIds.length > 0
      ? prisma.productVariant.findMany({
          where: { id: { in: variantIds } },
          select: { id: true, priceOverride: true, size: true, color: true },
        })
      : Promise.resolve([]),
  ])

  const productMap = new Map(products.map(p => [p.id, p]))
  const variantMap = new Map(variants.map(v => [v.id, v]))

  // Build order items with verified prices
  const orderItems = cartItems.map(item => {
    const product = productMap.get(item.productId)
    if (!product) throw new Error(`Product not found: ${item.productId}`)

    const variant = item.variantId ? variantMap.get(item.variantId) : null
    const unitPrice = variant?.priceOverride
      ? Number(variant.priceOverride)
      : Number(product.basePrice)

    return {
      product: { connect: { id: item.productId } },
      ...(item.variantId ? { variant: { connect: { id: item.variantId } } } : {}),
      productName: product.name,
      variantInfo: variant ? { size: variant.size, color: variant.color } : Prisma.JsonNull,
      quantity: item.quantity,
      unitPrice,
      total: unitPrice * item.quantity,
    }
  })

  const subtotal = orderItems.reduce((sum, i) => sum + i.total, 0)
  const total = subtotal + shippingCost

  // Create Razorpay order first
  const razorpayOrder = await createRazorpayOrder(total, "receipt_" + Date.now())

  // Create order in DB
  const order = await prisma.order.create({
    data: {
      userId: user?.id,
      subtotal,
      shippingCost,
      total,
      shippingAddress,
      razorpayOrderId: razorpayOrder.id,
      orderNumber: `ORD-${Date.now()}`,
      items: {
        create: orderItems,
      },
    },
  })

  return {
    orderId: order.id,
    razorpayOrderId: razorpayOrder.id,
    amount: total,
    currency: "INR",
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  }
}

// Verify payment & confirm order
export async function verifyAndConfirmOrder(
  orderId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string
) {
  const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, signature)
  if (!isValid) throw new Error("Payment verification failed")

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "CONFIRMED",
      razorpayPaymentId,
    },
    include: { items: true },
  })

  // Decrement stock
  for (const item of order.items) {
    if (item.variantId) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      })
    }
  }

  // Send confirmation email
  try {
    const shippingAddress = order.shippingAddress as any
    await sendOrderConfirmation({
      email: shippingAddress?.email || "",
      name: shippingAddress?.name || "",
      orderNumber: order.orderNumber,
      total: Number(order.total),
      items: order.items.map(i => ({
        name: i.productName, qty: i.quantity, price: Number(i.unitPrice),
      })),
    })
  } catch { 
    // don't fail order if email fails
  }

  revalidatePath("/account/orders")
  return serialize(order)
}

// Admin: update order status
export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdmin()
  await prisma.order.update({
    where: { id: orderId },
    data: { status: status as any },
  })
  revalidatePath("/admin/orders")
}