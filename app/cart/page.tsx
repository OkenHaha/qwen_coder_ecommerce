"use client";

import { useCartStore } from "@/store/cart-store";
import { useHasMounted } from "@/hooks/use-has-mounted"; // Ensure you create this hook
import { CartItem } from "@/app/components/cart/CartItem";
import { CartSummary } from "@/app/components/cart/CartSummary";
import Link from "next/link";
import { Skeleton } from "@/app/components/ui/skeleton";

export default function CartPage() {
  const hasMounted = useHasMounted();
  const items = useCartStore((state) => state.items);

  if (!hasMounted) {
    return <CartSkeleton />;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">Shopping Cart</h1>
      
      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-gray-500">Your cart is currently empty.</p>
          <Link href="/shop" className="mt-6 inline-block rounded-md bg-gray-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-700">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 divide-y divide-gray-200 border-t border-gray-200">
            {items.map((item) => (
              <CartItem key={item.variantId} item={item} />
            ))}
          </div>
          
          {/* Summary */}
          <div className="lg:col-span-1">
            <CartSummary />
          </div>
        </div>
      )}
    </main>
  );
}

function CartSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <Skeleton className="h-8 w-1/4 mb-8" />
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}