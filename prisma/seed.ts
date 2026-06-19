import { prisma } from "../lib/prisma";

async function main() {
  console.log("Cleaning up database...");
  
  // Clean in correct order of dependency
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  console.log("Seeding categories...");

  const footwear = await prisma.category.create({
    data: {
      name: "Footwear",
      slug: "footwear",
      description: "Sport shoes, running shoes, and casual sneakers.",
    },
  });

  const apparel = await prisma.category.create({
    data: {
      name: "Apparel",
      slug: "apparel",
      description: "Comfortable hoodies, shirts, and activewear.",
    },
  });

  const accessories = await prisma.category.create({
    data: {
      name: "Accessories",
      slug: "accessories",
      description: "Backpacks, caps, and everyday gear.",
    },
  });

  console.log("Seeding products...");

  // 1. Apex Running Shoes
  const shoes = await prisma.product.create({
    data: {
      name: "Apex Running Shoes",
      slug: "apex-running-shoes",
      description: "Lightweight and breathable running shoes designed for maximum comfort and speed on road runs.",
      basePrice: 3999.00,
      brand: "Apex",
      status: "ACTIVE",
      avgRating: 4.5,
      categoryId: footwear.id,
      variants: {
        create: [
          { sku: "APX-SH-BL-8", size: "8", color: "Blue", stock: 50 },
          { sku: "APX-SH-BL-9", size: "9", color: "Blue", stock: 40 },
          { sku: "APX-SH-RD-8", size: "8", color: "Red", stock: 30 },
          { sku: "APX-SH-RD-9", size: "9", color: "Red", stock: 25 },
        ],
      },
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600",
            altText: "Apex Running Shoes Red",
            isPrimary: true,
            sortOrder: 1,
          },
        ],
      },
    },
  });

  // 2. Classic Cotton Hoodie
  const hoodie = await prisma.product.create({
    data: {
      name: "Classic Cotton Hoodie",
      slug: "classic-cotton-hoodie",
      description: "Ultra-soft cotton blend hoodie featuring a fleece lining, adjustable drawstring hood, and front kangaroo pocket.",
      basePrice: 1999.00,
      salePrice: 1799.00,
      brand: "Cozy",
      status: "ACTIVE",
      avgRating: 4.8,
      categoryId: apparel.id,
      variants: {
        create: [
          { sku: "COZY-HD-BK-M", size: "M", color: "Black", stock: 100 },
          { sku: "COZY-HD-BK-L", size: "L", color: "Black", stock: 80 },
          { sku: "COZY-HD-GR-M", size: "M", color: "Grey", stock: 60 },
          { sku: "COZY-HD-GR-L", size: "L", color: "Grey", stock: 50 },
        ],
      },
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600",
            altText: "Classic Cotton Hoodie Grey",
            isPrimary: true,
            sortOrder: 1,
          },
        ],
      },
    },
  });

  // 3. Urban Backpack
  const backpack = await prisma.product.create({
    data: {
      name: "Urban Backpack",
      slug: "urban-backpack",
      description: "Water-resistant commuter backpack with a padded 15-inch laptop sleeve and convenient quick-access pockets.",
      basePrice: 2499.00,
      brand: "Nomad",
      status: "ACTIVE",
      avgRating: 4.2,
      categoryId: accessories.id,
      variants: {
        create: [
          { sku: "NMD-BP-GR", color: "Grey", stock: 35 },
          { sku: "NMD-BP-BK", color: "Black", stock: 20 },
        ],
      },
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600",
            altText: "Urban Backpack Grey",
            isPrimary: true,
            sortOrder: 1,
          },
        ],
      },
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
