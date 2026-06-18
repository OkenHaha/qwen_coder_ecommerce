import { getMyOrders } from "@/actions/orders";
import { Package, Truck, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AccountOrdersPage() {
  const orders = await getMyOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Order History</h1>
        <p className="text-sm text-gray-500">Track and manage your past store orders.</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center bg-white shadow-sm">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-sm font-semibold text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">You haven&apos;t placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusColors: Record<string, string> = {
              PENDING: "bg-yellow-50 text-yellow-800 border-yellow-200",
              CONFIRMED: "bg-blue-50 text-blue-800 border-blue-200",
              PROCESSING: "bg-indigo-50 text-indigo-800 border-indigo-200",
              SHIPPED: "bg-purple-50 text-purple-800 border-purple-200",
              DELIVERED: "bg-green-50 text-green-800 border-green-200",
              CANCELLED: "bg-red-50 text-red-800 border-red-200",
            };

            const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
              >
                {/* Header */}
                <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-8 text-xs text-gray-500">
                    <div>
                      <p className="font-semibold uppercase tracking-wider text-gray-400">Date Placed</p>
                      <p className="mt-1 font-medium text-gray-900">{formattedDate}</p>
                    </div>
                    <div>
                      <p className="font-semibold uppercase tracking-wider text-gray-400">Order Number</p>
                      <p className="mt-1 font-medium text-gray-900">{order.orderNumber}</p>
                    </div>
                    <div>
                      <p className="font-semibold uppercase tracking-wider text-gray-400">Total Amount</p>
                      <p className="mt-1 font-semibold text-indigo-600">₹{Number(order.total).toFixed(2)}</p>
                    </div>
                  </div>
                  <div>
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="divide-y divide-gray-100 px-6">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex py-6 items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 flex-shrink-0 rounded-md border border-gray-100 bg-gray-50 flex items-center justify-center text-[10px] text-gray-400 font-semibold">
                          Item
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          {item.variantInfo && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {Object.entries(item.variantInfo as Record<string, string>)
                                .filter(([_, v]) => !!v)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(" | ")}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium text-gray-900">₹{(Number(item.unitPrice) * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                {/* Tracking section if shipped */}
                {order.trackingNumber && (
                  <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center gap-2 text-xs text-gray-600">
                    <Truck className="h-4 w-4 text-indigo-500" />
                    <span>Tracking Number: <strong className="text-gray-900">{order.trackingNumber}</strong></span>
                    {order.trackingUrl && (
                      <a
                        href={order.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-0.5 text-indigo-600 hover:text-indigo-800 font-medium ml-2"
                      >
                        Track Order <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
