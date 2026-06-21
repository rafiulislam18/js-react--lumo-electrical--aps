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
    <div className="font-outfit bg-[#f6f5f0]/[.86] dark:bg-dark-surface min-h-screen flex flex-col">
      {/* Breadcrumb Section */}
      <div className="border-b border-[rgba(22,25,26,.07)] dark:border-white/[.06]">
        <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-8 py-4 flex items-center gap-2 text-[.8rem] overflow-x-auto">
          <a href="/" className="text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] hover:text-[#2f8b3d] dark:hover:text-[#a8d63e] transition-colors whitespace-nowrap">Home</a>
          <span className="text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]">/</span>
          <span className="font-semibold text-[#2f8b3d] dark:text-[#a8d63e] whitespace-nowrap">{getDisplayTitle()}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-[1280px] mx-auto w-full px-4 sm:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-[.55rem] text-[.68rem] font-bold tracking-[.2em] uppercase text-[#2f8b3d] dark:text-[#a8d63e] mb-3 before:content-[''] before:w-[1.4rem] before:h-0.5 before:rounded-sm before:bg-[#2f8b3d] dark:before:bg-[#a8d63e] before:shrink-0">
            Shop the range
          </div>
          {!getDisplayTitle().includes('Search') && (
            <h1 className="font-bebas leading-[.9] text-[clamp(2.4rem,6vw,4rem)] text-[#16191a] dark:text-[#f1f3ea]">
              {getDisplayTitle()}
            </h1>
          )}
          {!getDisplayDescription().includes('search') && (
            <p className="mt-3 text-[.95rem] leading-relaxed max-w-[680px] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
              {getDisplayDescription()}
            </p>
          )}
          <p className="mt-4 text-[.82rem] text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]">
            {isLoading ? 'Loading products...' : `Showing ${transformedProducts.length} of ${totalCount} products`}
          </p>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-96">
            <Loader className="w-8 h-8 text-[#a8d63e] animate-spin" />
          </div>
        ) : isError ? (
          <div className="text-center py-16">
            <p className="text-red-600 dark:text-red-400 text-lg">Failed to load products. Please try again later.</p>
          </div>
        ) : transformedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-5 mb-12">
            {transformedProducts.map((product: any) => (
              <div key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] text-lg">No products found.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && transformedProducts.length > 0 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-[10px] grid place-items-center border border-[rgba(22,25,26,.1)] dark:border-white/10 text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] hover:text-[#2f8b3d] dark:hover:text-[#a8d63e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
              return pageNum <= totalPages ? pageNum : null;
            }).filter((p): p is number => p !== null).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`min-w-9 h-9 px-2 rounded-[10px] text-[.85rem] font-semibold transition-colors duration-200 ${
                  currentPage === page
                    ? 'bg-gradient-to-br from-[#399746] to-[#3aaa49] text-white'
                    : 'border border-[rgba(22,25,26,.1)] dark:border-white/10 text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] hover:text-[#2f8b3d] dark:hover:text-[#a8d63e]'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-9 h-9 rounded-[10px] grid place-items-center border border-[rgba(22,25,26,.1)] dark:border-white/10 text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] hover:text-[#2f8b3d] dark:hover:text-[#a8d63e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
