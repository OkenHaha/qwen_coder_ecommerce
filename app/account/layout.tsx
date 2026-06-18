import { requireAuth } from "@/lib/auth-guard";
import Link from "next/link";
import { User, Package, MapPin } from "lucide-react";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  const menuItems = [
    { href: "/account", label: "Profile", icon: User },
    { href: "/account/orders", label: "My Orders", icon: Package },
    { href: "/account/addresses", label: "Addresses", icon: MapPin },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-1">{user.name}</h2>
            <p className="text-xs text-gray-500 mb-6">{user.email}</p>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                  >
                    <Icon className="h-4 w-4 text-gray-400" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Content area */}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
