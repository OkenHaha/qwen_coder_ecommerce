import { prisma } from "@/lib/prisma";
import { OrdersClient } from "./orders-client";
import { serialize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <OrdersClient initialOrders={serialize(orders) as any[]} />
  );
}
