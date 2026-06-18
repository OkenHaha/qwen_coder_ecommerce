"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

export async function getAddresses() {
  const user = await requireAuth();
  return prisma.address.findMany({
    where: { userId: user.id },
    orderBy: { isDefault: "desc" },
  });
}

export async function createAddress(data: {
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  isDefault?: boolean;
}) {
  const user = await requireAuth();

  // If set to default, unset other defaults first
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId: user.id,
      label: data.label,
      line1: data.line1,
      line2: data.line2,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      phone: data.phone,
      isDefault: data.isDefault ?? false,
    },
  });

  revalidatePath("/account/addresses");
  return address;
}

export async function deleteAddress(addressId: string) {
  const user = await requireAuth();

  await prisma.address.delete({
    where: { id: addressId, userId: user.id },
  });

  revalidatePath("/account/addresses");
}

export async function setDefaultAddress(addressId: string) {
  const user = await requireAuth();

  // Unset all first
  await prisma.address.updateMany({
    where: { userId: user.id },
    data: { isDefault: false },
  });

  // Set selected
  await prisma.address.update({
    where: { id: addressId, userId: user.id },
    data: { isDefault: true },
  });

  revalidatePath("/account/addresses");
}
