import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmation } from "@/lib/resend";
import { createHmac } from "crypto";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.warn("RAZORPAY_WEBHOOK_SECRET is not configured.");
      return NextResponse.json({ error: "Secret not configured" }, { status: 500 });
    }

    // Verify webhook signature
    const expectedSignature = createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // We listen for payment.captured or order.paid
    if (event === "order.paid" || event === "payment.captured") {
      const paymentEntity = payload.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      const razorpayPaymentId = paymentEntity?.id;

      if (!razorpayOrderId) {
        return NextResponse.json({ error: "No order ID in payload" }, { status: 400 });
      }

      // Find order
      const order = await prisma.order.findFirst({
        where: { razorpayOrderId },
        include: { items: true },
      });

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // If already processed, skip
      if (order.status !== "PENDING") {
        return NextResponse.json({ message: "Order already processed" }, { status: 200 });
      }

      // Update order status to CONFIRMED
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "CONFIRMED",
          razorpayPaymentId,
        },
        include: { items: true },
      });

      // Decrement stock
      for (const item of updatedOrder.items) {
        if (item.variantId) {
          await prisma.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      // Send email
      try {
        const shippingAddress = updatedOrder.shippingAddress as any;
        await sendOrderConfirmation({
          email: shippingAddress?.email || "",
          name: shippingAddress?.name || "",
          orderNumber: updatedOrder.orderNumber,
          total: Number(updatedOrder.total),
          items: updatedOrder.items.map((i) => ({
            name: i.productName,
            qty: i.quantity,
            price: Number(i.unitPrice),
          })),
        });
      } catch (err) {
        console.error("Failed to send webhook confirmation email:", err);
      }

      return NextResponse.json({ message: "Order confirmed" }, { status: 200 });
    }

    return NextResponse.json({ message: "Event ignored" }, { status: 200 });
  } catch (err: any) {
    console.error("Razorpay webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
