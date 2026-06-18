import { getProductBySlug } from "@/actions/products";
import { AddToCart } from "@/app/components/shop/AddToCart";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { serialize } from "@/lib/utils";

interface PDPProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PDPProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);
  if (!product) return { title: "Product not found" };

  return {
    title: product.name,
    description: product.description || `Buy ${product.name} online`,
    openGraph: {
      images: product.images.length > 0 ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: PDPProps) {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);

  if (!product) notFound();

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map(img => img.url),
    offers: {
      "@type": "Offer",
      price: Number(product.basePrice).toFixed(2),
      priceCurrency: "INR",
    },
  };

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          {product.images.length > 0 ? (
            product.images.map((image) => (
              <div key={image.id} className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={image.url}
                  alt={image.altText || product.name}
                  className="h-full w-full object-cover object-center"
                />
              </div>
            ))
          ) : (
            <div className="aspect-square flex items-center justify-center rounded-lg bg-gray-100 text-gray-400">
              No Image Available
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{product.name}</h1>
          {product.brand && <p className="mt-2 text-lg text-gray-500">{product.brand}</p>}
          
          <div className="mt-6">
            <h2 className="sr-only">Product information</h2>
            <p className="text-3xl tracking-tight text-gray-900">
              ₹{Number(product.basePrice).toFixed(2)}
            </p>
          </div>

          <div className="mt-6 prose prose-sm text-gray-600">
            <p>{product.description}</p>
          </div>

          <div className="mt-8">
            <AddToCart product={serialize(product)} />
          </div>
        </div>
      </div>
    </main>
  );
}