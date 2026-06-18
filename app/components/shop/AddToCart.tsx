"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { Prisma } from "@/app/generated/client";
import { toast } from "sonner"; // or your preferred toaster

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: { variants: true; images: { where: { isPrimary: true } } };
}>;

export function AddToCart({ product }: { product: ProductWithRelations }) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants[0]?.id || null
  );
  const [qty, setQty] = useState(1);
  
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    const variant = product.variants.find(v => v.id === selectedVariantId);
    
    if (product.variants.length > 0 && !variant) {
      toast.error("Please select a variant");
      return;
    }

    addItem({
      productId: product.id,
      variantId: variant?.id || "", // fallback if no variants exist
      name: product.name,
      image: product.images[0]?.url || "",
      price: variant?.priceOverride ? Number(variant.priceOverride) : Number(product.basePrice),
      size: variant?.size ?? undefined,
      color: variant?.color ?? undefined,
      quantity: qty,
      stock: variant?.stock || 99, // default high stock if no variants
      slug: product.slug,
    });

    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="space-y-6">
      {product.variants.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">Options</label>
          <select 
            value={selectedVariantId || ""} 
            onChange={(e) => setSelectedVariantId(e.target.value)}
            className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm border"
          >
            {product.variants.map((variant) => (
              <option key={variant.id} value={variant.id} disabled={variant.stock === 0}>
                {variant.size} {variant.color} {variant.stock === 0 ? "(Out of stock)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-4">
        <label htmlFor="quantity" className="sr-only">Quantity</label>
        <input 
          id="quantity"
          type="number" 
          min={1} 
          value={qty} 
          onChange={(e) => setQty(Math.max(1, parseInt(e.target.value)))}
          className="w-16 rounded-md border-gray-300 py-2 text-center border"
        />
        
        <Button onClick={handleAddToCart} className="flex-1 w-full">
          Add to Cart
        </Button>
      </div>
    </div>
  );
}