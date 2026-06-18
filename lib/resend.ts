import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

// Order confirmation email
export async function sendOrderConfirmation({
  email,
  name,
  orderNumber,
  total,
  items,
}: {
  email: string; name: string; orderNumber: string
  total: number; items: { name: string; qty: number; price: number }[]
}) {
  await resend.emails.send({
    from: `My Store <${process.env.NEXT_PUBLIC_STORE_EMAIL}>`,
    to: email,
    subject: `Order Confirmed - #${orderNumber}`,
    html: `
      <h1>Hi ${name},</h1>
      <p>Your order <strong>#${orderNumber}</strong> has been confirmed!</p>
      <table>
        <tr><th>Item</th><th>Qty</th><th>Price</th></tr>
        ${items.map(i => `
          <tr>
            <td>${i.name}</td>
            <td>${i.qty}</td>
            <td>₹${i.price}</td>
          </tr>`).join('')}
      </table>
      <p><strong>Total: ₹${total}</strong></p>
    `,
  })
}

// Shipping update email
export async function sendShippingUpdate(
  email: string,
  orderNumber: string,
  trackingNumber: string,
  trackingUrl: string
) {
  await resend.emails.send({
    from: `My Store <${process.env.NEXT_PUBLIC_STORE_EMAIL}>`,
    to: email,
    subject: `Your order #${orderNumber} has shipped!`,
    html: `
      <h1>Your order is on its way!</h1>
      <p>Order #${orderNumber} has been shipped.</p>
      <p>Tracking: <a href="${trackingUrl}">${trackingNumber}</a></p>
    `,
  })
}