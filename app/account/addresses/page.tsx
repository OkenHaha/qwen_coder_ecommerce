import { getAddresses } from "@/actions/addresses";
import { AddressList } from "./address-list";
import { serialize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AccountAddressesPage() {
  const addresses = await getAddresses();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Shipping Addresses</h1>
        <p className="text-sm text-gray-500">Add, edit, or delete shipping addresses for checkout.</p>
      </div>

      <AddressList initialAddresses={serialize(addresses)} />
    </div>
  );
}
