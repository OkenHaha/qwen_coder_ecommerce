"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/actions/products";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Card, CardContent } from "@/app/components/ui/card";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";

interface Category {
  id: string;
  name: string;
}

export function ProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [name, setName] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brand, setBrand] = useState("");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState("");

  // Auto-generate slug from name
  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !basePrice || !sku || !stock) {
      setError("Please fill in all required fields.");
      return;
    }

    setError("");
    startTransition(async () => {
      try {
        const slug = generateSlug(name);
        await createProduct({
          name,
          slug,
          basePrice: Number(basePrice),
          description: description || undefined,
          categoryId: categoryId || undefined,
          brand: brand || undefined,
          imageUrl: imageUrl || undefined,
          sku,
          stock: Number(stock),
        });
        router.push("/admin/products");
      } catch (err: any) {
        setError(err.message || "Failed to create product.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md text-sm">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Running Shoes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Base Price (INR) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="e.g., 999.00"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                placeholder="e.g., Nike"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Tell customers about your product..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold text-lg">Inventory & Variant</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                placeholder="e.g., NKE-RUN-01"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Initial Stock *</Label>
              <Input
                id="stock"
                type="number"
                placeholder="e.g., 50"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold text-lg">Product Image</h3>
          
          <div className="flex flex-col items-center gap-4">
            {imageUrl ? (
              <div className="relative aspect-square w-40 overflow-hidden rounded-md border border-gray-200">
                <img
                  src={imageUrl}
                  alt="Product preview"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-square w-40 flex-col items-center justify-center rounded-md border border-dashed border-gray-300 text-gray-400">
                <ImageIcon className="h-10 w-10" />
                <span className="text-xs mt-2">No Image Uploaded</span>
              </div>
            )}

            <CldUploadWidget
              uploadPreset="ecommerce_uploads"
              onSuccess={(results: any) => {
                const url = results?.info?.secure_url;
                if (url) setImageUrl(url);
              }}
            >
              {({ open }) => (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => open()}
                  className="w-full sm:w-auto"
                >
                  Upload Image
                </Button>
              )}
            </CldUploadWidget>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Product"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
