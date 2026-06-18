"use client";

import Link from 'next/link'
import { useCartStore } from '@/store/cart-store'
import { useHasMounted } from '@/hooks/use-has-mounted'
import { ShoppingCart } from 'lucide-react'

export function CartButton() {
  const hasMounted = useHasMounted()
  const count = useCartStore((state) => state.itemCount())

  return (
    <Link
      href="/cart"
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:border-gray-300 hover:text-gray-900 transition-colors"
      aria-label="View Cart"
    >
      <ShoppingCart className="h-5 w-5" />
      {hasMounted && count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-white">
          {count}
        </span>
      )}
    </Link>
  )
}
