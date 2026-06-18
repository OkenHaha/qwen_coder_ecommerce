"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";

export function CartSummary() {
  const subtotal = useCartStore((state) => state.subtotal());
  const itemCount = useCartStore((state) => state.itemCount());

  // Example static shipping cost (in a real app, this comes from Shippo during checkout)
  const estimatedShipping = subtotal > 999 ? 0 : 49; // Free shipping over ₹999
  const total = subtotal + estimatedShipping;

  return (
    <Card className="sticky top-24 bg-gray-50 border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <p>Subtotal ({itemCount} items)</p>
            <p className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</p>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <p>Estimated Shipping</p>
            <p className="font-medium text-gray-900">
              {estimatedShipping === 0 ? "FREE" : `₹${estimatedShipping.toFixed(2)}`}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between text-base">
            <p className="font-semibold text-gray-900">Total</p>
            <p className="font-bold text-gray-900">₹{total.toFixed(2)}</p>
          </div>
        </div>

        <Button asChild className="w-full mt-4" size="lg">
          <Link href="/checkout">
            Proceed to Checkout
          </Link>
        </Button>

        <div className="mt-2 text-center">
          <Link href="/shop" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Continue Shopping
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}