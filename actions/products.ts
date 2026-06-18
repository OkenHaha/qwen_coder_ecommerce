"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guard"
import { revalidatePath } from "next/cache"
import { serialize } from "@/lib/utils"

// Get all active products (public — no auth needed)
export async function getProducts({
  page = 1,
  limit = 12,
  categorySlug,
  sort = "newest",
  minPrice,
  maxPrice,
}: {
  page?: number; limit?: number
  categorySlug?: string; sort?: string
  minPrice?: number; maxPrice?: number
}) {
  const where: any = { status: "ACTIVE" }

  if (categorySlug) {
    where.category = { slug: categorySlug }
  }
  if (minPrice || maxPrice) {
    where.basePrice = {}
    if (minPrice) where.basePrice.gte = minPrice
    if (maxPrice) where.basePrice.lte = maxPrice
  }

  const orderBy: any = {
    newest: { createdAt: "desc" },
    price_asc: { basePrice: "asc" },
    price_desc: { basePrice: "desc" },
    rating: { avgRating: "desc" },
  }[sort] ?? { createdAt: "desc" }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: true,
        images: { where: { isPrimary: true }, take: 1 },
        variants: true,
      },
    }),
    prisma.product.count({ where }),
  ])

  return { products, total, pages: Math.ceil(total / limit) }
}

// Get single product by slug (public)
export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
      reviews: {
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  })
}

// Create product (admin only)
export async function createProduct(data: {
  name: string; slug: string; basePrice: number
  description?: string; categoryId?: string; brand?: string
  imageUrl?: string; sku: string; stock: number
}) {
  await requireAdmin() // throws if not admin

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      basePrice: data.basePrice,
      description: data.description,
      brand: data.brand,
      categoryId: data.categoryId,
      status: "ACTIVE",
      images: data.imageUrl
        ? {
            create: [
              {
                url: data.imageUrl,
                isPrimary: true,
                altText: data.name,
              },
            ],
          }
        : undefined,
      variants: {
        create: [
          {
            sku: data.sku,
            stock: data.stock,
            priceOverride: data.basePrice,
          },
        ],
      },
    },
  })

  revalidatePath("/shop")
  revalidatePath("/admin/products")
  return serialize(product)
}

export async function deleteProduct(productId: string) {
  await requireAdmin()
  await prisma.product.delete({ where: { id: productId } })
  revalidatePath("/admin/products")
}