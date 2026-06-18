import { prisma } from "@/lib/prisma";
import { StatsCard } from "@/app/admin/StatsCard";

export default async function AdminDashboard() {
  // Run queries concurrently for performance
  const [userCount, orderCount, revenueAgg] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: "CONFIRMED" },
    }),
  ]);

  const totalRevenue = revenueAgg._sum.total || 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h2>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard 
          title="Total Revenue" 
          value={`₹${Number(totalRevenue).toFixed(2)}`} 
        />
        <StatsCard 
          title="Total Orders" 
          value={orderCount.toString()} 
        />
        <StatsCard 
          title="Total Customers" 
          value={userCount.toString()} 
        />
      </div>
      
      {/* TODO: Add Recharts analytics graph here */}
    </div>
  );
}