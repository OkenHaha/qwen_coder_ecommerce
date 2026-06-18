import { prisma } from "@/lib/prisma";
import { CustomersClient } from "./customers-client";
import { serialize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      orders: {
        select: { total: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <CustomersClient initialCustomers={serialize(customers) as any[]} />
  );
}
