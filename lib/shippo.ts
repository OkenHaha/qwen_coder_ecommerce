import { Shippo } from 'shippo'

export const shippo = new Shippo({
  apiKeyHeader: process.env.SHIPPO_API_KEY!,
})

// Get shipping rates for checkout
export async function getShippingRates(toAddress: {
  name: string; street1: string; city: string
  state: string; zip: string; country: string
  weight: number // in grams
}) {
  const shipment = await shippo.shipments.create({
    addressFrom: process.env.SHIPPO_SENDER_ADDRESS!,
    addressTo: {
      name: toAddress.name,
      street1: toAddress.street1,
      city: toAddress.city,
      state: toAddress.state,
      zip: toAddress.zip,
      country: toAddress.country,
    },
    parcels: [{
      length: '30', width: '20', height: '10',
      distanceUnit: 'cm',
      weight: String(toAddress.weight),
      massUnit: 'g',
    }],
    async: false,
  })

  const ratesList = (shipment.rates || []) as any[]

  return ratesList.map((rate: any) => ({
    id: rate.objectId,
    name: rate.provider + ' - ' + rate.servicelevel?.name,
    cost: parseFloat(rate.amount),
    currency: rate.currency,
    days: rate.estimatedDays,
  }))
}

// Create shipping label after order confirmation
export async function createShippingLabel(
  transactionId: string,
  rateId: string
) {
  const transaction = await shippo.transactions.create({
    rate: rateId,
    labelFileType: 'PDF',
    async: false,
  })
  return {
    trackingNumber: transaction.trackingNumber,
    trackingUrl: transaction.trackingUrlProvider,
    labelUrl: transaction.labelUrl,
  }
}