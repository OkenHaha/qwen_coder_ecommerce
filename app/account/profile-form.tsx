"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/actions/auth";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";

interface UserProfile {
  name?: string | null;
  email: string;
  phone?: string | null;
}

export function ProfileForm({ user }: { user: UserProfile }) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError("Name is required");
      return;
    }

    setError("");
    setSuccess(false);
    
    startTransition(async () => {
      try {
        await updateProfile({ name, phone: phone || undefined });
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || "Failed to update profile.");
      }
    });
  };

  return (
    <Card className="max-w-md bg-white">
      <CardHeader>
        <CardTitle className="text-xl">Profile Details</CardTitle>
        <CardDescription>Update your account contact information.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" value={user.email} disabled className="bg-gray-50 text-gray-500 border-gray-200" />
            <p className="text-[10px] text-gray-400">Email cannot be changed.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isPending}
              placeholder="e.g., +919999999999"
            />
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 p-2.5 rounded-md">{error}</p>}
          {success && (
            <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 p-2.5 rounded-md">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Profile updated successfully!
            </div>
          )}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
