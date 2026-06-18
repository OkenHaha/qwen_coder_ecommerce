import { prisma } from "@/lib/prisma";
import { ProductsClient } from "./products-client";
import { serialize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      variants: true,
      images: { where: { isPrimary: true }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ProductsClient initialProducts={serialize(products) as any[]} />
  );
}
