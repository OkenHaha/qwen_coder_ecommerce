"use client";

import { useState, useTransition } from "react";
import { createAddress, deleteAddress, setDefaultAddress } from "@/actions/addresses";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Loader2, Plus, Trash2, Home, Building, ShieldCheck } from "lucide-react";
import { Address } from "@/app/generated/client";

export function AddressList({ initialAddresses }: { initialAddresses: Address[] }) {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const [label, setLabel] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [phone, setPhone] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!line1 || !city || !state || !zipCode) {
      setError("Please fill in all required fields.");
      return;
    }

    setError("");
    startTransition(async () => {
      try {
        await createAddress({
          label: label || undefined,
          line1,
          line2: line2 || undefined,
          city,
          state,
          zipCode,
          phone: phone || undefined,
          isDefault,
        });
        
        // Reset form
        setLabel("");
        setLine1("");
        setLine2("");
        setCity("");
        setState("");
        setZipCode("");
        setPhone("");
        setIsDefault(false);
        setShowForm(false);
      } catch (err: any) {
        setError(err.message || "Failed to save address.");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this address?")) {
      startTransition(async () => {
        try {
          await deleteAddress(id);
        } catch (err: any) {
          alert(err.message || "Failed to delete address.");
        }
      });
    }
  };

  const handleSetDefault = (id: string) => {
    startTransition(async () => {
      try {
        await setDefaultAddress(id);
      } catch (err: any) {
        alert(err.message || "Failed to set default address.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Saved Addresses</h2>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Add Address
          </Button>
        )}
      </div>

      {/* New Address Form */}
      {showForm && (
        <Card className="max-w-xl bg-white border-gray-200">
          <CardHeader>
            <CardTitle>Add New Address</CardTitle>
            <CardDescription>Enter details of your shipping address.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Label (e.g. Home, Office)</Label>
                  <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Home" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="For shipping contact" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="line1">Address Line 1 *</Label>
                <Input id="line1" value={line1} onChange={(e) => setLine1(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="line2">Address Line 2 (Optional)</Label>
                <Input id="line2" value={line2} onChange={(e) => setLine2(e.target.value)} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input id="state" value={state} onChange={(e) => setState(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input id="zipCode" value={zipCode} onChange={(e) => setZipCode(e.target.value)} required />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="default"
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <Label htmlFor="default">Set as default shipping address</Label>
              </div>

              {error && <p className="text-xs text-red-500 bg-red-50 p-2.5 rounded-md">{error}</p>}

              <div className="flex gap-4 pt-2">
                <Button type="submit" disabled={isPending} className="flex-1">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Address"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={isPending}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Address cards list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {initialAddresses.map((addr) => {
          const isHome = addr.label?.toLowerCase() === "home";
          return (
            <Card key={addr.id} className={`bg-white border ${addr.isDefault ? "border-indigo-600 shadow-sm" : "border-gray-200"}`}>
              <CardContent className="pt-6 space-y-4 relative">
                {addr.isDefault && (
                  <span className="absolute top-4 right-4 inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold border border-indigo-200">
                    <ShieldCheck className="h-3 w-3 text-indigo-500" /> Default
                  </span>
                )}
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {isHome ? <Home className="h-4 w-4 text-indigo-500" /> : <Building className="h-4 w-4 text-indigo-500" />}
                    <h3 className="font-semibold text-gray-900 capitalize">{addr.label || "Address"}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{addr.line1}</p>
                  {addr.line2 && <p className="text-sm text-gray-600">{addr.line2}</p>}
                  <p className="text-sm text-gray-600">
                    {addr.city}, {addr.state} - {addr.zipCode}
                  </p>
                  {addr.phone && <p className="text-xs text-gray-400 mt-2">Phone: {addr.phone}</p>}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs">
                  {!addr.isDefault ? (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      disabled={isPending}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                    >
                      Set as Default
                    </button>
                  ) : (
                    <span className="text-gray-400 font-medium">Default shipping address</span>
                  )}
                  <button
                    onClick={() => handleDelete(addr.id)}
                    disabled={isPending}
                    className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
