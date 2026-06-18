import { NextResponse } from "next/server";
import { getShippingRates } from "@/lib/shippo";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address, totalWeight } = body;

    if (!address || !totalWeight) {
      return NextResponse.json({ error: "Missing address or totalWeight" }, { status: 400 });
    }

    // Default weight to 500g if 0
    const weight = totalWeight > 0 ? totalWeight : 500;

    const rates = await getShippingRates({
      name: address.name,
      street1: address.line1 || address.street1,
      city: address.city,
      state: address.state,
      zip: address.zipCode || address.zip,
      country: address.country || "IN",
      weight,
    });

    return NextResponse.json({ rates }, { status: 200 });
  } catch (err: any) {
    console.error("Shipping rates API error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch rates" }, { status: 500 });
  }
}
