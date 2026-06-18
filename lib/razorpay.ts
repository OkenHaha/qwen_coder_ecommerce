import Razorpay from 'razorpay'

export const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// Razorpay order creation (call from Server Action)
export async function createRazorpayOrder(
  amount: number,    // in rupees
  receipt: string    // your order ID
) {
  const order = await razorpay.orders.create({
    amount: amount * 100,  // Razorpay expects paise (₹1 = 100)
    currency: 'INR',
    receipt,
    payment_capture: true,   // auto-capture
  })
  return order as any
}

// Verify payment signature (in webhook or callback)
import { createHmac } from 'crypto'

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const expected = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(orderId + '|' + paymentId)
    .digest('hex')
  return expected === signature
}