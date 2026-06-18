import { getCurrentUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { CheckoutForm } from "@/app/components/checkout/CheckoutForm";
import { serialize } from "@/lib/utils";

export default async function CheckoutPage() {
  const user = await getCurrentUser();

  // If logged in, fetch their default address to pre-fill the form
  const defaultAddress = user
    ? await prisma.address.findFirst({
        where: { userId: user.id, isDefault: true },
      })
    : null;

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">
        Checkout
      </h1>
      <CheckoutForm userId={user?.id} defaultAddress={serialize(defaultAddress)} />
    </main>
  );
}