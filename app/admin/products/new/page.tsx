import { prisma } from "@/lib/prisma";
import { ProductForm } from "./product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Add New Product</h2>
        <p className="text-sm text-gray-500">Create a new item in your store inventory.</p>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
