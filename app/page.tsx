import { getProducts } from "@/actions/products";
import { ProductCard } from "@/app/components/storefront/product-card";
import Link from "next/link";

export default async function HomePage() {
  const { products } = await getProducts({ limit: 8, sort: "newest" });

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="py-16 text-center sm:py-24">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          New Season Arrivals
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500">
          Check out our latest collection of premium products designed for you.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link href="/shop" className="rounded-md bg-gray-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900">
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="pb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Trending</h2>
          <Link href="/shop" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}