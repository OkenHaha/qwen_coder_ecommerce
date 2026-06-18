import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const sessionUser = await requireAuth();

  const dbUser = await prisma.user.findUnique({
    where: { id: sessionUser.id },
  });

  if (!dbUser) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Account</h1>
        <p className="text-sm text-gray-500">Manage your profile details and settings.</p>
      </div>

      <ProfileForm
        user={{
          name: dbUser.name,
          email: dbUser.email,
          phone: dbUser.phone,
        }}
      />
    </div>
  );
}
