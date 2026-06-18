"use client";

import { useTransition } from "react";
import { DataTable } from "@/app/components/admin/DataTable";
import { updateOrderStatus } from "@/actions/orders";
import { toast } from "sonner";

interface OrderWithUser {
  id: string;
  orderNumber: string;
  total: any;
  status: string;
  createdAt: Date;
  shippingAddress: any;
  user: { name: string | null; email: string } | null;
}

export function OrdersClient({ initialOrders }: { initialOrders: OrderWithUser[] }) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (orderId: string, newStatus: string) => {
    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, newStatus);
        toast.success("Order status updated successfully");
      } catch (err: any) {
        toast.error(err.message || "Failed to update order status");
      }
    });
  };

  const columns = [
    {
      header: "Order Number",
      accessorKey: "orderNumber",
      sortable: true,
    },
    {
      header: "Customer",
      accessorKey: "customer",
      cell: (order: any) => {
        const address = order.shippingAddress as any;
        return (
          <div>
            <p className="font-semibold text-gray-900">{address?.name || order.user?.name || "Guest"}</p>
            <p className="text-xs text-gray-500">{address?.email || order.user?.email || ""}</p>
          </div>
        );
      },
    },
    {
      header: "Date",
      accessorKey: "createdAt",
      sortable: true,
      cell: (order: any) => new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    },
    {
      header: "Total",
      accessorKey: "total",
      sortable: true,
      cell: (order: any) => `₹${Number(order.total).toFixed(2)}`,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (order: any) => {
        const statusColors: Record<string, string> = {
          PENDING: "bg-yellow-100 text-yellow-800",
          CONFIRMED: "bg-blue-100 text-blue-800",
          PROCESSING: "bg-indigo-100 text-indigo-800",
          SHIPPED: "bg-purple-100 text-purple-800",
          DELIVERED: "bg-green-100 text-green-800",
          CANCELLED: "bg-red-100 text-red-800",
        };
        return (
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[order.status]}`}>
            {order.status}
          </span>
        );
      },
    },
    {
      header: "Update Status",
      accessorKey: "actions",
      cell: (order: any) => (
        <select
          defaultValue={order.status}
          onChange={(e) => handleStatusChange(order.id, e.target.value)}
          disabled={isPending}
          className="block w-full rounded-md border border-gray-300 bg-white py-1 px-2 text-xs shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 disabled:opacity-50"
        >
          <option value="PENDING">PENDING</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="PROCESSING">PROCESSING</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Orders</h2>
        <p className="text-sm text-gray-500">Manage and track your customer orders.</p>
      </div>

      <DataTable columns={columns} data={initialOrders} searchKey="orderNumber" searchPlaceholder="Search order number..." />
    </div>
  );
}
