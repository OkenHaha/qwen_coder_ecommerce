import { getProducts } from "@/actions/products";
import { ProductCard } from "@/app/components/storefront/product-card";
import { SortDropdown } from "@/app/components/storefront/sort-dropdown";
import { Pagination } from "@/app/components/storefront/pagination";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Suspense } from "react";

// Force dynamic rendering so searchParams are always fresh
export const dynamic = "force-dynamic";

interface ShopPageProps {
  searchParams: Promise<{
    page?: string;
    sort?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const sort = resolvedSearchParams.sort || "newest";
  const categorySlug = resolvedSearchParams.category;
  const minPrice = resolvedSearchParams.minPrice ? Number(resolvedSearchParams.minPrice) : undefined;
  const maxPrice = resolvedSearchParams.maxPrice ? Number(resolvedSearchParams.maxPrice) : undefined;

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Shop All</h1>
          <p className="mt-2 text-sm text-gray-500">
            Browse our latest collection of products.
          </p>
        </div>
        <SortDropdown currentSort={sort} />
      </div>

      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid 
          page={page} 
          sort={sort} 
          categorySlug={categorySlug} 
          minPrice={minPrice} 
          maxPrice={maxPrice} 
        />
      </Suspense>
    </main>
  );
}

// Isolated data fetching component to work cleanly with Suspense
async function ProductGrid({
  page,
  sort,
  categorySlug,
  minPrice,
  maxPrice,
}: {
  page: number;
  sort: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  const { products, total, pages } = await getProducts({
    page,
    sort,
    categorySlug,
    minPrice,
    maxPrice,
  });

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-12 text-center">
        <h2 className="text-xl font-semibold text-gray-900">No products found</h2>
        <p className="mt-2 text-sm text-gray-500">Try adjusting your search or filter to find what you are looking for.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {pages > 1 && (
        <Pagination currentPage={page} totalPages={pages} />
      )}
    </div>
  );
}

// Loading skeleton for the grid
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}