import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { ChevronLeft, ChevronRight, Loader } from "lucide-react";
import { apiGet } from "@/lib/api";

interface ProductListItem {
  id: number;
  name: string;
  price: string;
  old_price: string | null;
  image: string;
  avg_rating: number;
  total_reviews: number;
  badge: string;
  in_stock: boolean;
  discount_percentage: number;
  created_at: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProductListItem[] | {
    featured_products?: Array<{ product: ProductListItem; created_at: string }>;
    new_arrivals?: ProductListItem[];
    best_sellers?: ProductListItem[];
  };
}

// Helper to get full image URL
const getImageUrl = (imagePath: string | undefined) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:8000';
  return `${baseUrl}${imagePath}`;
};

// Transform backend product to match ProductCard format
const transformProduct = (product: ProductListItem) => ({
  id: product.id.toString(),
  name: product.name,
  price: parseFloat(product.price),
  oldPrice: product.old_price ? parseFloat(product.old_price) : undefined,
  image: getImageUrl(product.image),
  category: product.category.name,
  categoryId: product.category.id.toString(),
  rating: product.avg_rating,
  reviews: product.total_reviews,
  badge: product.badge || undefined,
  inStock: product.in_stock,
  isFeatured: false,
  isNewArrival: product.badge === "New",
  isBestSeller: false,
});

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  
  // Get the search or "q" query parameter
  const searchQuery = searchParams.get('search');
  const q = searchParams.get('q') || 'featured-products';

  // Determine which endpoint to call based on parameters
  const getEndpoint = () => {
    if (searchQuery) {
      return '/products/';
    }
    switch (q) {
      case 'new-arrivals':
        return '/products/new-arrivals/';
      case 'best-sellers':
        return '/products/best-sellers/';
      case 'featured-products':
      default:
        return '/products/featured/';
    }
  };

  // Get display title based on parameters
  const getDisplayTitle = () => {
    if (searchQuery) {
      return `Search Results for "${searchQuery}"`;
    }
    switch (q) {
      case 'new-arrivals':
        return 'New Arrivals';
      case 'best-sellers':
        return 'Best Sellers';
      case 'featured-products':
      default:
        return 'Featured Products';
    }
  };

  // Get display description based on parameters
  const getDisplayDescription = () => {
    if (searchQuery) {
      return `Showing search results for products matching "${searchQuery}"`;
    }
    switch (q) {
      case 'new-arrivals':
        return 'Discover the latest products just added to our collection. Stay updated with fresh electrical components and solutions.';
      case 'best-sellers':
        return 'Shop the most popular electrical products trusted by professionals and DIY enthusiasts.';
      case 'featured-products':
      default:
        return 'Explore our carefully curated selection of premium electrical products and components.';
    }
  };

  // Build query params for API
  const queryParams = new URLSearchParams();
  queryParams.append('page', currentPage.toString());
  queryParams.append('page_size', '15');
  if (searchQuery) {
    queryParams.append('search', searchQuery);
  }

  // Fetch products
  const { 
    data: response, 
    isLoading, 
    isError 
  } = useQuery<PaginatedResponse>({
    queryKey: ['products', searchQuery, q, currentPage],
    queryFn: () => apiGet<PaginatedResponse>(
      `${getEndpoint()}?${queryParams.toString()}`
    ),
  });

  const products = (() => {
    // If search query exists, results are directly in the results array
    if (searchQuery && Array.isArray(response?.results)) {
      return response.results as ProductListItem[];
    }
    // Otherwise, handle the special response format
    const results = response?.results as any;
    if (results?.new_arrivals && q === 'new-arrivals') {
      return results.new_arrivals;
    } else if (results?.best_sellers && q === 'best-sellers') {
      return results.best_sellers;
    } else if (results?.featured_products) {
      // Extract the 'product' field from featured products wrapper
      return results.featured_products.map((fp: any) => fp.product);
    }
    return [];
  })();
  const totalCount = response?.count || 0;
  const totalPages = Math.ceil(totalCount / 15);

  // Transform products for ProductCard component
  const transformedProducts = useMemo(() => {
    return products.map(transformProduct);
  }, [products]);

  // Update URL params when page changes
  useEffect(() => {
    const params = new URLSearchParams();
    params.append('page', currentPage.toString());
    if (searchQuery) {
      params.append('search', searchQuery);
    } else if (q !== 'featured-products') {
      params.append('q', q);
    }
    setSearchParams(params);
  }, [currentPage, q, searchQuery, setSearchParams]);

  return (
    <div className="font-outfit bg-white dark:bg-dark-surface min-h-screen flex flex-col">
      {/* Header Section */}
      <section className="border-b border-black/[.08] dark:border-white/[.06] bg-white dark:bg-black/[.02]">
        <div className="max-w-[1280px] mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center gap-2 text-[.8rem] overflow-x-auto">
            <a href="/" className="text-black/60 dark:text-[rgba(240,242,237,.6)] hover:text-lime-brand dark:hover:text-lime-brand transition-colors whitespace-nowrap">Home</a>
            <span className="text-black/40 dark:text-[rgba(240,242,237,.4)]">/</span>
            <span className="text-lime-brand font-semibold whitespace-nowrap">{getDisplayTitle()}</span>
          </div>

          {!getDisplayDescription().includes('search') && (
            <p className="text-[.9rem] text-black/60 dark:text-[rgba(240,242,237,.6)] mt-4">
              {getDisplayDescription()}
            </p>
          )}
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 max-w-[1280px] mx-auto w-full px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex-1 min-w-0">
            {!getDisplayTitle().includes('Search') && (
              <h2 className="font-bebas text-[2rem] tracking-[.08em] text-black/85 dark:text-[#f0f2ed] line-clamp-2 sm:line-clamp-none">
                {getDisplayTitle()}
              </h2>
            )}
            <p className="text-[.85rem] text-black/60 dark:text-[rgba(240,242,237,.6)] mt-2">
              {isLoading ? 'Loading products...' : `Showing ${transformedProducts.length} of ${totalCount} products`}
            </p>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-96">
            <Loader className="w-8 h-8 text-lime-brand animate-spin" />
          </div>
        ) : isError ? (
          <div className="text-center py-16">
            <p className="text-red-600 dark:text-red-400 text-lg">Failed to load products. Please try again later.</p>
          </div>
        ) : transformedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-6 mb-12">
            {transformedProducts.map((product: any) => (
              <div key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-black/60 dark:text-[rgba(240,242,237,.6)] text-lg">No products found.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && transformedProducts.length > 0 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-black/[.1] dark:border-white/[.08] text-black/60 dark:text-[rgba(240,242,237,.6)] hover:border-lime-brand/30 dark:hover:border-lime-brand/20 hover:text-lime-brand dark:hover:text-lime-brand disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                return pageNum <= totalPages ? pageNum : null;
              }).filter((p): p is number => p !== null).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-10 py-2 px-2 rounded-lg text-[.85rem] font-semibold transition-all duration-200 ${
                    currentPage === page
                      ? 'bg-gradient-to-br from-green-brand to-lime-brand text-dark-surface'
                      : 'border border-black/[.1] dark:border-white/[.08] text-black/60 dark:text-[rgba(240,242,237,.6)] hover:border-lime-brand/30 dark:hover:border-lime-brand/20 hover:text-lime-brand dark:hover:text-lime-brand'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-black/[.1] dark:border-white/[.08] text-black/60 dark:text-[rgba(240,242,237,.6)] hover:border-lime-brand/30 dark:hover:border-lime-brand/20 hover:text-lime-brand dark:hover:text-lime-brand disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
