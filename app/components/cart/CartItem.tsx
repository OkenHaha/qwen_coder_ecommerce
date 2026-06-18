"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore, CartItem as CartItemType } from "@/store/cart-store";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.variantId, item.quantity - 1);
    }
  };

  const handleIncrement = () => {
    // Prevent adding more than available stock
    if (item.quantity < item.stock) {
      updateQuantity(item.variantId, item.quantity + 1);
    }
  };

  const handleRemove = () => {
    removeItem(item.variantId);
  };

  return (
    <div className="flex flex-col py-6 sm:flex-row">
      {/* Image */}
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="96px"
            className="object-contain object-center p-2"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400 text-xs">
            No Image
          </div>
        )}
      </div>

      {/* Details */}
      <div className="ml-0 mt-4 flex flex-1 flex-col sm:ml-6 sm:mt-0">
        <div className="flex justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              <Link href={`/product/${item.slug}`} className="hover:text-gray-600">
                {item.name}
              </Link>
            </h3>
            {(item.size || item.color) && (
              <p className="mt-1 text-xs text-gray-500">
                {item.size && <span>Size: {item.size}</span>}
                {item.size && item.color && <span> | </span>}
                {item.color && <span>Color: {item.color}</span>}
              </p>
            )}
          </div>
          <p className="text-sm font-medium text-gray-900">
            ₹{(item.price * item.quantity).toFixed(2)}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          {/* Quantity Selector */}
          <div className="flex items-center border border-gray-200 rounded-md">
            <button
              onClick={handleDecrement}
              className="p-2 text-gray-500 hover:text-gray-900 disabled:opacity-50"
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-8 text-center text-sm font-medium text-gray-900">
              {item.quantity}
            </span>
            <button
              onClick={handleIncrement}
              className="p-2 text-gray-500 hover:text-gray-900 disabled:opacity-50"
              disabled={item.quantity >= item.stock}
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-gray-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}