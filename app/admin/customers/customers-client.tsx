"use client";

import { DataTable } from "@/app/components/admin/DataTable";

interface CustomerWithOrders {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  createdAt: Date;
  orders: { total: any }[];
}

export function CustomersClient({ initialCustomers }: { initialCustomers: CustomerWithOrders[] }) {
  const columns = [
    {
      header: "Name",
      accessorKey: "name",
      sortable: true,
      cell: (customer: any) => customer.name || "N/A",
    },
    {
      header: "Email",
      accessorKey: "email",
      sortable: true,
    },
    {
      header: "Phone",
      accessorKey: "phone",
      cell: (customer: any) => customer.phone || "N/A",
    },
    {
      header: "Orders Placed",
      accessorKey: "ordersCount",
      cell: (customer: any) => customer.orders.length,
    },
    {
      header: "Total Spent",
      accessorKey: "totalSpent",
      cell: (customer: any) => {
        const spent = customer.orders.reduce((sum: number, o: any) => sum + Number(o.total), 0);
        return `₹${spent.toFixed(2)}`;
      },
    },
    {
      header: "Customer Since",
      accessorKey: "createdAt",
      sortable: true,
      cell: (customer: any) => new Date(customer.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Customers</h2>
        <p className="text-sm text-gray-500">View and manage customer registrations.</p>
      </div>

      <DataTable columns={columns} data={initialCustomers} searchKey="email" searchPlaceholder="Search customer email..." />
    </div>
  );
}
