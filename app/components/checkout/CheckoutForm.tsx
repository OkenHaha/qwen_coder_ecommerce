"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import { fetchShippingRates } from "@/actions/shipping";
import { createOrder, verifyAndConfirmOrder } from "@/actions/orders";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Loader2, Check } from "lucide-react";
import { Address } from "@/app/generated/client";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { Skeleton } from "@/app/components/ui/skeleton";

// Razorpay script type injection
declare global {
  interface Window {
    Razorpay: any;
  }
}

const CheckoutSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  line1: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(6, "Valid ZIP code is required"),
});

type CheckoutFormValues = z.infer<typeof CheckoutSchema>;

interface CheckoutFormProps {
  userId?: string;
  defaultAddress: Address | null;
}

type ShippingRate = {
  id: string;
  name: string;
  cost: number;
  currency: string;
  days: number;
};

export function CheckoutForm({ userId, defaultAddress }: CheckoutFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<"address" | "shipping" | "payment">("address");
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);

  const hasMounted = useHasMounted();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal());
  const clearCart = useCartStore((state) => state.clearCart);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(CheckoutSchema),
    defaultValues: defaultAddress
      ? {
          name: defaultAddress.label || "", // Assuming label stores name, adjust if needed
          email: "", // Fetch from user if available
          phone: defaultAddress.phone || "",
          line1: defaultAddress.line1,
          city: defaultAddress.city,
          state: defaultAddress.state,
          zipCode: defaultAddress.zipCode,
        }
      : {},
  });

  if (!hasMounted) {
    return <CheckoutFormSkeleton />;
  }

  // Step 1: Submit Address -> Fetch Shippo Rates
  const onAddressSubmit = (data: CheckoutFormValues) => {
    startTransition(async () => {
      // Mocking weight calculation (e.g., 500g per item)
      const totalWeight = items.reduce((sum, item) => sum + item.quantity * 500, 0);
      
      const response = await fetchShippingRates(
        {
          name: data.name,
          street1: data.line1,
          city: data.city,
          state: data.state,
          zip: data.zipCode,
          country: "IN", // Hardcoded for now, could be a form field
        },
        totalWeight
      );

      if ("error" in response && response.error) {
        alert(response.error);
        return;
      }

      if ("rates" in response && response.rates) {
        setShippingRates(response.rates);
        setStep("shipping");
      }
    });
  };

  // Step 2: Select Shipping Rate -> Proceed to Payment
  const handleShippingSelect = (rate: ShippingRate) => {
    setSelectedRate(rate);
    setStep("payment");
  };

  // Step 3: Trigger Razorpay Modal
  const handlePayment = () => {
    startTransition(async () => {
      const addressData = getValues();
      const shippingCost = selectedRate?.cost || 0;

      // 1. Create pending order in DB and get Razorpay Order ID
      const orderResponse = await createOrder(
        items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId || null,
          quantity: i.quantity,
        })),
        {
          name: addressData.name,
          email: addressData.email,
          line1: addressData.line1,
          city: addressData.city,
          state: addressData.state,
          zipCode: addressData.zipCode,
          phone: addressData.phone,
        },
        shippingCost
      );

      if (!orderResponse || "error" in orderResponse) {
        alert("Failed to create order.");
        return;
      }

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: orderResponse.key,
        amount: orderResponse.amount * 100, // Convert to paise
        currency: orderResponse.currency,
        name: "My Store",
        description: `Order ${orderResponse.orderId}`,
        order_id: orderResponse.razorpayOrderId,
        handler: async function (response: any) {
          // 3. Verify signature on success
          const verifyResponse = await verifyAndConfirmOrder(
            orderResponse.orderId,
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );

          if (verifyResponse) {
            clearCart();
            router.push("/account/orders");
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: addressData.name,
          email: addressData.email,
          contact: addressData.phone,
        },
        theme: { color: "#0f172a" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    });
  };

  const total = subtotal + (selectedRate?.cost || 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Left Column: Steps */}
      <div className="lg:col-span-2 space-y-8">
        {/* Step 1: Address */}
        <Card className={step !== "address" ? "opacity-50" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {step !== "address" && <Check className="h-4 w-4 text-green-500" />}
              1. Shipping Address
            </CardTitle>
          </CardHeader>
          {step === "address" && (
            <CardContent>
              <form onSubmit={handleSubmit(onAddressSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" {...register("name")} />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register("email")} />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" {...register("phone")} />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="line1">Address Line 1</Label>
                  <Input id="line1" {...register("line1")} />
                  {errors.line1 && <p className="text-xs text-red-500 mt-1">{errors.line1.message}</p>}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" {...register("city")} />
                    {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input id="state" {...register("state")} />
                    {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input id="zipCode" {...register("zipCode")} />
                    {errors.zipCode && <p className="text-xs text-red-500 mt-1">{errors.zipCode.message}</p>}
                  </div>
                </div>
                <Button type="submit" disabled={isPending} className="w-full">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue to Shipping"}
                </Button>
              </form>
            </CardContent>
          )}
        </Card>

        {/* Step 2: Shipping Method */}
        {step !== "address" && (
          <Card className={step !== "shipping" ? "opacity-50" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {step === "payment" && <Check className="h-4 w-4 text-green-500" />}
                2. Shipping Method
              </CardTitle>
            </CardHeader>
            {step === "shipping" && (
              <CardContent className="space-y-4">
                {shippingRates.map((rate) => (
                  <div 
                    key={rate.id} 
                    onClick={() => handleShippingSelect(rate)}
                    className={`flex items-center justify-between p-4 border rounded-md cursor-pointer transition-colors ${selectedRate?.id === rate.id ? "border-gray-900 bg-gray-50" : "border-gray-200"}`}
                  >
                    <div>
                      <p className="font-medium text-gray-900">{rate.name}</p>
                      <p className="text-sm text-gray-500">Estimated delivery: {rate.days} days</p>
                    </div>
                    <p className="font-medium text-gray-900">₹{rate.cost.toFixed(2)}</p>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        )}

        {/* Step 3: Payment */}
        {step === "payment" && (
          <Card>
            <CardHeader>
              <CardTitle>3. Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handlePayment} disabled={isPending} className="w-full" size="lg">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : `Pay ₹${total.toFixed(2)} with Razorpay`}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Column: Order Summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-24 bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item.variantId} className="flex justify-between text-sm">
                  <p className="text-gray-600">{item.name} <span className="text-gray-400">x{item.quantity}</span></p>
                  <p className="font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <p>Subtotal</p>
                <p className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <p>Shipping</p>
                <p className="font-medium text-gray-900">
                  {selectedRate ? `₹${selectedRate.cost.toFixed(2)}` : "Calculated at next step"}
                </p>
              </div>
              <div className="flex justify-between text-base pt-2 border-t border-gray-200">
                <p className="font-semibold text-gray-900">Total</p>
                <p className="font-bold text-gray-900">₹{total.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CheckoutFormSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>1. Shipping Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><Skeleton className="h-10 w-full" /></div>
              <div><Skeleton className="h-10 w-full" /></div>
              <div><Skeleton className="h-10 w-full" /></div>
            </div>
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-3 gap-4">
              <div><Skeleton className="h-10 w-full" /></div>
              <div><Skeleton className="h-10 w-full" /></div>
              <div><Skeleton className="h-10 w-full" /></div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1">
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}