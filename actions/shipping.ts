"use server";

import { getShippingRates } from "@/lib/shippo";
import { z } from "zod";

const AddressSchema = z.object({
  name: z.string(),
  street1: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  country: z.string(),
});

export async function fetchShippingRates(
  address: z.infer<typeof AddressSchema>,
  totalWeight: number
) {
  const validated = AddressSchema.safeParse(address);
  if (!validated.success) {
    return { error: "Invalid address for shipping rates" };
  }

  try {
    // If cart is empty weight, default to 500g so Shippo can return rates
    const weight = totalWeight > 0 ? totalWeight : 500; 
    
    const rates = await getShippingRates({
      ...validated.data,
      weight,
    });

    return { rates };
  } catch (error) {
    console.error("Shippo API Error (falling back to dummy rates):", error);
    const dummyRates = [
      {
        id: "dummy-standard",
        name: "Standard Shipping (Dummy)",
        cost: 50.00,
        currency: "INR",
        days: 5,
      },
      {
        id: "dummy-express",
        name: "Express Shipping (Dummy)",
        cost: 150.00,
        currency: "INR",
        days: 2,
      },
    ];
    return { rates: dummyRates };
  }
}