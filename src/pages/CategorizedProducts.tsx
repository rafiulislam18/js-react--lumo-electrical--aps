import { useState, useMemo, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, SlidersHorizontal, Loader } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface CategoryData {
  id: number;
  name: string;
  slug: string;
  is_leaf: boolean;
  children_count: number;
  children: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
}

interface CategoryBreadcrumb {
  id: number;
  name: string;
  slug: string;
}

interface CategoryProductsResponse {
  category: CategoryData;
  breadcrumb: CategoryBreadcrumb[];
  products: ProductListItem[];
  price_range: {
    min: number | null;
    max: number | null;
  };
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T;
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

export default function CategorizedProducts() {
  const { categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [minPrice, setMinPrice] = useState(parseFloat(searchParams.get('min_price') || '0'));
  const [maxPrice, setMaxPrice] = useState(parseFloat(searchParams.get('max_price') || '10000'));
  const [availability, setAvailability] = useState(searchParams.get('availability') || 'all');
  const [rating, setRating] = useState(searchParams.get('rating') || 'all');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [showFilters, setShowFilters] = useState(false);

  // Build query params
  const queryParams = new URLSearchParams();
  queryParams.append('page', currentPage.toString());
  queryParams.append('page_size', '12');
  queryParams.append('sort', sortBy);
  
  if (availability !== 'all') {
    queryParams.append('availability', availability === 'in-stock' ? 'in_stock' : 'out_of_stock');
  }
  if (rating !== 'all') {
    queryParams.append('rating', rating === 'below3' ? 'below_3' : rating);
  }
  if (minPrice > 0) {
    queryParams.append('min_price', minPrice.toString());
  }
  if (maxPrice < 10000) {
    queryParams.append('max_price', maxPrice.toString());
  }

  // Fetch products by category
  const { 
    data: response, 
    isLoading, 
    isError 
  } = useQuery<PaginatedResponse<CategoryProductsResponse>>({
    queryKey: ['products', categorySlug, queryParams.toString()],
    queryFn: async () => {
      if (!categorySlug) throw new Error('Category slug is required');
      return apiGet<PaginatedResponse<CategoryProductsResponse>>(
        `/categories/${categorySlug}/products/?${queryParams.toString()}`
      );
    },
    enabled: !!categorySlug,
  });

  const categoryData = response?.results.category;
  const breadcrumb = response?.results.breadcrumb || [];
  const products = response?.results.products || [];
  const priceRange = response?.results.price_range || { min: 0, max: 10000 };
  const totalCount = response?.count || 0;
  const totalPages = Math.ceil(totalCount / 12);

  // Transform products for ProductCard component
  const transformedProducts = useMemo(() => {
    return products.map(transformProduct);
  }, [products]);

  const MIN_PRICE = priceRange.min || 0;
  const MAX_PRICE = priceRange.max || 10000;

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    params.append('page', currentPage.toString());
    if (sortBy !== 'newest') params.append('sort', sortBy);
    if (availability !== 'all') params.append('availability', availability);
    if (rating !== 'all') params.append('rating', rating);
    if (minPrice > 0) params.append('min_price', minPrice.toString());
    if (maxPrice < 10000) params.append('max_price', maxPrice.toString());
    setSearchParams(params);
  }, [currentPage, sortBy, availability, rating, minPrice, maxPrice, setSearchParams]);

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setMinPrice(inputValue === '' ? 0 : parseFloat(inputValue) || minPrice);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setMaxPrice(inputValue === '' ? 10000 : parseFloat(inputValue) || maxPrice);
  };

  const handleMinPriceBlur = () => {
    const constrainedValue = Math.max(MIN_PRICE || 0, Math.min(minPrice, maxPrice));
    setMinPrice(constrainedValue);
    setCurrentPage(1);
  };

  const handleMaxPriceBlur = () => {
    const constrainedValue = Math.min(MAX_PRICE || 10000, Math.max(maxPrice, minPrice));
    setMaxPrice(constrainedValue);
    setCurrentPage(1);
  };

  // Initialize price range from backend when available
  useEffect(() => {
    if (priceRange.min !== null && priceRange.max !== null) {
      // Only set if they're at default values (not explicitly set by user)
      if (minPrice === 0 && !searchParams.get('min_price')) {
        setMinPrice(priceRange.min);
      }
      if (maxPrice === 10000 && !searchParams.get('max_price')) {
        setMaxPrice(priceRange.max);
      }
    }
  }, [priceRange]);

  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col font-sans">
      {/* Breadcrumb */}
      <section className="border-b border-gray-100 bg-white">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm overflow-x-auto">
            <a href="/" className="text-gray-600 hover:text-primary transition-colors whitespace-nowrap">Home</a>
            <span className="text-gray-400">/</span>
            {breadcrumb.length > 0 && (
              <>
                {/* <span className="text-gray-400">/</span> */}
                {breadcrumb.slice(0, -1).map((cat, idx) => (
                  <div key={cat.id} className="flex items-center gap-2">
                    <a href={`/${cat.slug}`} className="text-gray-600 hover:text-primary cursor-pointer transition-colors whitespace-nowrap">
                      {cat.name}
                    </a>
                    <span className="text-gray-400">/</span>
                  </div>
                ))}
              </>
            )}
            <span className="text-primary font-semibold whitespace-nowrap">{categoryData?.name || 'Products'}</span>
          </div>
        </div>
      </section>

      {/* Children Categories */}
      <section className="border-b border-gray-100 bg-white">
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{categoryData?.name} price in Cape Town, South Africa</h3>
          <p className="text-sm text-gray-900 mb-3">{categoryData?.name} price starts from ZAR {response?.results.price_range.min} to ZAR {response?.results.price_range.max} in Cape Town, South Africa; depending on brand, model, and features. Buy the Latest {categoryData?.name} from Lumo Electrical online shop. Browse below and order yours now!</p>
          {categoryData?.children && categoryData.children.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categoryData.children.map((child) => (
                <a
                  key={child.id}
                  href={`/${child.slug}`}
                  className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100 hover:bg-primary hover:text-white text-gray-700 rounded-lg transition-colors"
                >
                  {child.name}
                </a>
              ))}  
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-2 sm:px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 animate-slide-in-left ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 sticky top-32 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h3 className="font-bold text-lg">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-900"
                >
                  ✕
                </button>
              </div>

              {/* Price Range Filter */}
              <div className="mb-8 pb-6 border-b border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-4">Price Range</h4>
                
                <div className="flex gap-2 mb-4">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">Min Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500 text-sm">$</span>
                      <Input
                        type="number"
                        min={MIN_PRICE}
                        max={MAX_PRICE}
                        value={minPrice}
                        onChange={handleMinPriceChange}
                        onBlur={handleMinPriceBlur}
                        className="pl-7 h-9 text-sm border-gray-200"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">Max Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500 text-sm">$</span>
                      <Input
                        type="number"
                        min={MIN_PRICE}
                        max={MAX_PRICE}
                        value={maxPrice}
                        onChange={handleMaxPriceChange}
                        onBlur={handleMaxPriceBlur}
                        className="pl-7 h-9 text-sm border-gray-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Availability Filter */}
              <div className="mb-8 pb-8 border-b border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-4">Availability</h4>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="availability"
                      value="all"
                      checked={availability === "all"}
                      onChange={(e) => {
                        setAvailability(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-4 h-4 accent-primary cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-primary transition-colors">All</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="availability"
                      value="in-stock"
                      checked={availability === "in-stock"}
                      onChange={(e) => {
                        setAvailability(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-4 h-4 accent-primary cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-primary transition-colors">In Stock</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="availability"
                      value="out-of-stock"
                      checked={availability === "out-of-stock"}
                      onChange={(e) => {
                        setAvailability(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-4 h-4 accent-primary cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-primary transition-colors">Out of Stock</span>
                  </label>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-4">Rating</h4>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="rating"
                      value="all"
                      checked={rating === "all"}
                      onChange={(e) => {
                        setRating(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-4 h-4 accent-primary cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-primary transition-colors">All Ratings</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="rating"
                      value="5"
                      checked={rating === "5"}
                      onChange={(e) => {
                        setRating(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-4 h-4 accent-primary cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-primary transition-colors">5 Stars</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="rating"
                      value="4"
                      checked={rating === "4"}
                      onChange={(e) => {
                        setRating(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-4 h-4 accent-primary cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-primary transition-colors">4+ Stars</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="rating"
                      value="3"
                      checked={rating === "3"}
                      onChange={(e) => {
                        setRating(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-4 h-4 accent-primary cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-primary transition-colors">3+ Stars</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="rating"
                      value="below3"
                      checked={rating === "below3"}
                      onChange={(e) => {
                        setRating(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-4 h-4 accent-primary cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-primary transition-colors">Below 3 Stars</span>
                  </label>
                </div>
              </div>

              {/* Clear Filters */}
              {(availability !== 'all' || rating !== 'all' || minPrice !== (MIN_PRICE || 0) || maxPrice !== (MAX_PRICE || 10000)) && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setMinPrice(MIN_PRICE || 0);
                    setMaxPrice(MAX_PRICE || 10000);
                    setAvailability('all');
                    setRating('all');
                    setCurrentPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Header with Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 animate-fade-in line-clamp-2 sm:line-clamp-none">
                  {categoryData?.name || 'Products'}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 animate-fade-in" style={{animationDelay: '0.1s'}}>
                  {isLoading ? 'Loading products...' : `Showing ${transformedProducts.length} of ${totalCount} products`}
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                <div className="flex-1 sm:flex-none sm:w-48">
                  <Select value={sortBy} onValueChange={(value) => {
                    setSortBy(value);
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="border-gray-200 h-10 text-xs sm:text-sm">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price_low_to_high">Price: Low to High</SelectItem>
                      <SelectItem value="price_high_to_low">Price: High to Low</SelectItem>
                      <SelectItem value="highest_rated">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center min-h-96">
                <Loader className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : isError ? (
              <div className="text-center py-16 animate-fade-in">
                <p className="text-red-600 text-lg mb-4">Failed to load products. Please try again later.</p>
              </div>
            ) : transformedProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 animate-stagger mb-12">
                {transformedProducts.map(product => (
                  <div key={product.id} className="animate-slide-in-up">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 animate-fade-in">
                <p className="text-gray-600 text-lg mb-4">No products found matching your filters.</p>
                <Button
                  onClick={() => {
                    setMinPrice(MIN_PRICE || 0);
                    setMaxPrice(MAX_PRICE || 10000);
                    setAvailability('all');
                    setRating('all');
                    setSortBy('newest');
                    setCurrentPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 animate-fade-in" style={{animationDelay: '0.2s'}}>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    return pageNum <= totalPages ? pageNum : null;
                  }).filter(Boolean).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="min-w-10"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}