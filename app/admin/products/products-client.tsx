"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { DataTable } from "@/app/components/admin/DataTable";
import { deleteProduct } from "@/actions/products";
import { toast } from "sonner";

interface ProductWithRelations {
  id: string;
  name: string;
  basePrice: any;
  status: string;
  variants: { stock: number }[];
  images: { url: string }[];
}

export function ProductsClient({ initialProducts }: { initialProducts: ProductWithRelations[] }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      startTransition(async () => {
        try {
          await deleteProduct(id);
          toast.success("Product deleted successfully");
        } catch (err: any) {
          toast.error(err.message || "Failed to delete product");
        }
      });
    }
  };

  const columns = [
    {
      header: "Image",
      accessorKey: "image",
      cell: (product: any) => {
        const url = product.images[0]?.url;
        return url ? (
          <img
            src={url}
            alt={product.name}
            className="h-10 w-10 rounded-md object-cover border border-gray-200"
          />
        ) : (
          <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
            No Image
          </div>
        );
      },
    },
    {
      header: "Name",
      accessorKey: "name",
      sortable: true,
    },
    {
      header: "Price",
      accessorKey: "basePrice",
      sortable: true,
      cell: (product: any) => `₹${Number(product.basePrice).toFixed(2)}`,
    },
    {
      header: "Stock",
      accessorKey: "stock",
      cell: (product: any) => {
        const totalStock = product.variants.reduce((sum: number, v: any) => sum + v.stock, 0);
        return totalStock;
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (product: any) => {
        const statusColors: Record<string, string> = {
          ACTIVE: "bg-green-100 text-green-800",
          DRAFT: "bg-yellow-100 text-yellow-800",
          ARCHIVED: "bg-gray-100 text-gray-800",
        };
        return (
          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusColors[product.status]}`}>
            {product.status}
          </span>
        );
      },
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (product: any) => (
        <div className="flex items-center gap-2">
          <Link href={`/admin/products/${product.id}/edit`}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-900">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            onClick={() => handleDelete(product.id)}
            variant="ghost"
            size="sm"
            disabled={isPending}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-950 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Products</h2>
          <p className="text-sm text-gray-500">Manage your store product catalog.</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <DataTable columns={columns} data={initialProducts} searchKey="name" searchPlaceholder="Search products..." />
    </div>
  );
}
