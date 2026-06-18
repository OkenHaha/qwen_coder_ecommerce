import Image from "next/image";
import Link from "next/link";
import { Prisma } from "@/app/generated/client";

// Define the exact type of the product object we expect based on our getProducts include
type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    images: { where: { isPrimary: true }; take: 1 };
    variants: true;
  };
}>;

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const primaryImage = product.images[0];
  
  // Calculate display price (use salePrice if it exists and is lower)
  const displayPrice = product.salePrice && product.salePrice < product.basePrice 
    ? product.salePrice 
    : product.basePrice;

  const hasSale = product.salePrice && product.salePrice < product.basePrice;

  // Find the lowest variant price if variants exist
  const lowestVariantPrice = product.variants.length > 0
    ? Math.min(...product.variants.map(v => v.priceOverride ? Number(v.priceOverride) : Infinity))
    : Infinity;

  const finalPrice = Math.min(Number(displayPrice), lowestVariantPrice);

  return (
    <div className="group relative">
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-200 group-hover:opacity-75 transition-opacity">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.altText || product.name}
            width={600}
            height={600}
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
            No Image
          </div>
        )}
      </div>

      {hasSale && (
        <span className="absolute top-3 left-3 rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white">
          Sale
        </span>
      )}

      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">
            <Link href={`/product/${product.slug}`}>
              <span aria-hidden="true" className="absolute inset-0" />
              {product.name}
            </Link>
          </h3>
          {product.brand && (
            <p className="mt-1 text-sm text-gray-500">{product.brand}</p>
          )}
        </div>
        <p className="text-sm font-medium text-gray-900">
          ₹{finalPrice.toFixed(2)}
        </p>
      </div>
    </div>
  );
}