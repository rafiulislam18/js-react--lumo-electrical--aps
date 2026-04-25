import { useState, useMemo, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { ChevronLeft, ChevronRight, SlidersHorizontal, Loader } from "lucide-react";
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

const getImageUrl = (imagePath: string | undefined) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  // @ts-ignore
  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:8000';
  return `${baseUrl}${imagePath}`;
};

const transformProduct = (product: ProductListItem) => {
  const badgeMap: { [key: string]: 'New' | 'Sale' | 'Hot' } = { 'New': 'New', 'Sale': 'Sale', 'Hot': 'Hot' };
  return {
    id: product.id.toString(),
    name: product.name,
    price: parseFloat(product.price),
    oldPrice: product.old_price ? parseFloat(product.old_price) : undefined,
    image: getImageUrl(product.image),
    category: product.category.name,
    categoryId: product.category.id.toString(),
    rating: product.avg_rating,
    reviews: product.total_reviews,
    badge: product.badge && badgeMap[product.badge] ? badgeMap[product.badge] : undefined,
    inStock: product.in_stock,
    isFeatured: false,
    isNewArrival: product.badge === "New",
    isBestSeller: false,
  };
};

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

  const transformedProducts = useMemo(() => {
    return products.map(transformProduct);
  }, [products]);

  const MIN_PRICE = priceRange.min || 0;
  const MAX_PRICE = priceRange.max || 10000;

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

  useEffect(() => {
    if (priceRange.min !== null && priceRange.max !== null) {
      if (minPrice === 0 && !searchParams.get('min_price')) {
        setMinPrice(priceRange.min);
      }
      if (maxPrice === 10000 && !searchParams.get('max_price')) {
        setMaxPrice(priceRange.max);
      }
    }
  }, [priceRange]);

  const filtersActive = availability !== 'all' || rating !== 'all' || minPrice !== (MIN_PRICE || 0) || maxPrice !== (MAX_PRICE || 10000);

  const clearFilters = () => {
    setMinPrice(MIN_PRICE || 0);
    setMaxPrice(MAX_PRICE || 10000);
    setAvailability('all');
    setRating('all');
    setCurrentPage(1);
  };

  // Shared style fragments
  const filterLabelCls = "font-bebas text-[.95rem] tracking-[.06em] text-[#222] dark:text-[#f0f2ed] mb-3 block";
  const filterGroupCls = "mb-7 pb-7 border-b border-black/[.08] dark:border-white/[.06] last:border-b-0";
  const radioOptionCls = "flex items-center gap-3 cursor-pointer";
  const radioSpanCls = "text-[.85rem] text-black/60 dark:text-[rgba(240,242,237,.6)] cursor-pointer transition-colors duration-200 peer-checked:text-green-deep dark:peer-checked:text-lime-brand peer-checked:font-medium";
  const clearBtnCls = "w-full py-3 px-4 rounded-md border border-green-deep/30 dark:border-lime-brand/30 bg-green-deep/[.08] dark:bg-lime-brand/[.08] text-green-deep dark:text-lime-brand font-semibold text-[.82rem] cursor-pointer transition-all duration-200 uppercase tracking-[.06em] hover:bg-green-deep/15 dark:hover:bg-lime-brand/15 hover:shadow-[0_0_12px_rgba(57,151,70,.2)] hover:shadow-[0_0_12px_rgba(57,151,70,.2)] dark:hover:shadow-[0_0_16px_rgba(168,214,62,.15)]";

  return (
    <div className="font-outfit bg-white dark:bg-dark-surface text-black/70 dark:text-[rgba(240,242,237,.7)] min-h-screen flex flex-col">
      {/* Breadcrumb & Category Section with Shared Background */}
      <section className="relative bg-cover bg-center bg-no-repeat before:absolute before:inset-0 before:bg-lime-brand/[.02]">
        <img
          src="https://images.pexels.com/photos/4276176/pexels-photo-4276176.jpeg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover animate-[zoomOut_14s_ease-out_forwards]"
        />
        {/* Light mode overlay */}
        <div className="absolute inset-0 dark:hidden"
          style={{ background: 'linear-gradient(to right, rgba(20,28,20,.85) 0%, rgba(20,28,20,.55) 55%, rgba(20,28,20,.3) 100%), linear-gradient(to top, rgba(20,28,20,.7) 0%, transparent 50%)' }}
        />
        {/* Dark mode overlay */}
        <div className="absolute inset-0 hidden dark:block"
          style={{ background: 'linear-gradient(to right, rgba(4,8,4,.92) 0%, rgba(4,8,4,.6) 55%, rgba(4,8,4,.25) 100%), linear-gradient(to top, rgba(4,8,4,.8) 0%, transparent 50%)' }}
        />
        {/* Breadcrumb */}
        <div className="relative z-10 border-b border-lime-brand/[.06] px-8 py-4 max-sm:px-4 max-sm:py-3">
          <div className="max-w-[1280px] mx-auto flex items-center gap-4 text-[.8rem] max-sm:text-[.7rem] flex-wrap">
            <a href="/" className="text-[rgba(240,242,237,.55)] no-underline transition-colors duration-200 hover:text-lime-brand">
              Home
            </a>
            <span className="text-[rgba(240,242,237,.2)]">/</span>
            {breadcrumb.length > 0 && breadcrumb.slice(0, -1).map((cat) => (
              <div key={cat.id} className="flex items-center gap-4">
                <a href={`/${cat.slug}`} className="text-[rgba(240,242,237,.55)] no-underline transition-colors duration-200 hover:text-lime-brand">
                  {cat.name}
                </a>
                <span className="text-[rgba(240,242,237,.2)]">/</span>
              </div>
            ))}
            <span className="text-lime-brand font-semibold">{categoryData?.name || 'Products'}</span>
          </div>
        </div>

        {/* Category Section */}
        <div className="relative z-10 border-b border-lime-brand/[.08] px-8 py-10 max-sm:px-4 max-sm:py-6">
          <div className="max-w-[1280px] mx-auto">
            <div className="font-bebas text-[clamp(1.6rem,4vw,2rem)] tracking-[.08em] text-[#f0f2ed] mb-4 max-sm:text-[1.3rem] max-sm:mb-3">
              {categoryData?.name || 'Products'}
            </div>
            <p className="text-[.9rem] max-sm:text-[.8rem] leading-[1.8] text-[rgba(240,242,237,.55)] mb-6 max-sm:mb-4 max-w-[900px]">
              {categoryData?.name} price starts from ZAR {response?.results.price_range.min || '0'} to ZAR {response?.results.price_range.max || '0'} in Cape Town, South Africa; depending on brand, model, and features. Buy the Latest {categoryData?.name} from Lumo Electrical online shop. Browse below and order yours now!
            </p>
            {categoryData?.children && categoryData.children.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {categoryData.children.map((child) => (
                  <a
                    key={child.id}
                    href={`/${child.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-lime-brand/10 border border-lime-brand/20 text-lime-brand no-underline text-[.82rem] font-medium transition-all duration-200 hover:bg-lime-brand/15 hover:shadow-[0_0_16px_rgba(168,214,62,.15)]"
                  >
                    {child.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 max-w-[1280px] mx-auto w-full px-8 py-8 max-sm:px-4 max-sm:py-4">
        <div className="grid grid-cols-[260px_1fr] gap-10 max-lg:grid-cols-1 max-lg:gap-8">

          {/* Overlay (mobile) */}
          {showFilters && (
            <div
              className="fixed inset-0 bg-black/70 z-[49] lg:hidden"
              onClick={() => setShowFilters(false)}
            />
          )}

          {/* Filters Sidebar */}
          <aside
            className={[
              "bg-white dark:bg-white/[.02] border border-black/[.08] dark:border-white/[.05] rounded-xl p-6",
              "max-lg:fixed max-lg:top-0 max-lg:left-0 max-lg:right-0 max-lg:bottom-0 max-lg:z-50 max-lg:w-full max-lg:max-w-[320px] max-lg:rounded-none max-lg:max-h-screen max-lg:overflow-y-auto max-lg:transition-transform max-lg:duration-300 max-lg:ease-in-out max-lg:bg-white max-lg:dark:bg-dark-surface",
              "lg:sticky lg:top-[120px] lg:max-h-[calc(100vh-300px)] lg:overflow-y-auto",
              showFilters ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"
            ].join(' ')}
          >
            {/* Mobile header */}
            <div className="hidden max-lg:flex items-center justify-between mb-6 pb-6 border-b border-black/[.08] dark:border-white/[.06]">
              <span className="font-bebas text-[1.25rem] text-[#1a1a1a] dark:text-[#f0f2ed]">Filters</span>
              <button
                className="bg-transparent border-none text-black/50 dark:text-[rgba(240,242,237,.6)] text-2xl cursor-pointer transition-colors duration-200 hover:text-lime-brand"
                onClick={() => setShowFilters(false)}
              >
                ✕
              </button>
            </div>

            {/* Price Range */}
            <div className={filterGroupCls}>
              <label className={filterLabelCls}>Price Range</label>
              <div className="flex gap-3 mb-4">
                <input
                  type="number"
                  min={MIN_PRICE}
                  max={MAX_PRICE}
                  value={minPrice}
                  onChange={handleMinPriceChange}
                  onBlur={handleMinPriceBlur}
                  placeholder="Min"
                  className="flex-1 bg-black/[.02] dark:bg-white/[.04] border border-black/10 dark:border-white/[.08] rounded-md px-3 py-2.5 text-black/80 dark:text-[rgba(240,242,237,.8)] text-[.8rem] focus:outline-none focus:border-lime-brand/30 focus:bg-lime-brand/[.06]"
                />
                <input
                  type="number"
                  min={MIN_PRICE}
                  max={MAX_PRICE}
                  value={maxPrice}
                  onChange={handleMaxPriceChange}
                  onBlur={handleMaxPriceBlur}
                  placeholder="Max"
                  className="flex-1 bg-black/[.02] dark:bg-white/[.04] border border-black/10 dark:border-white/[.08] rounded-md px-3 py-2.5 text-black/80 dark:text-[rgba(240,242,237,.8)] text-[.8rem] focus:outline-none focus:border-lime-brand/30 focus:bg-lime-brand/[.06]"
                />
              </div>
            </div>

            {/* Availability */}
            <div className={filterGroupCls}>
              <label className={filterLabelCls}>Availability</label>
              <div className="flex flex-col gap-2.5">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'in-stock', label: 'In Stock' },
                  { value: 'out-of-stock', label: 'Out of Stock' },
                ].map(({ value, label }) => (
                  <label key={value} className={radioOptionCls}>
                    <input
                      type="radio"
                      name="availability"
                      value={value}
                      checked={availability === value}
                      onChange={(e) => { setAvailability(e.target.value); setCurrentPage(1); }}
                      className="peer accent-green-deep dark:accent-lime-brand cursor-pointer"
                    />
                    <span className={radioSpanCls}>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className={filterGroupCls}>
              <label className={filterLabelCls}>Rating</label>
              <div className="flex flex-col gap-2.5">
                {[
                  { value: 'all', label: 'All Ratings' },
                  { value: '5', label: '5 Stars' },
                  { value: '4', label: '4+ Stars' },
                  { value: '3', label: '3+ Stars' },
                  { value: 'below3', label: 'Below 3 Stars' },
                ].map(({ value, label }) => (
                  <label key={value} className={radioOptionCls}>
                    <input
                      type="radio"
                      name="rating"
                      value={value}
                      checked={rating === value}
                      onChange={(e) => { setRating(e.target.value); setCurrentPage(1); }}
                      className="peer accent-green-deep dark:accent-lime-brand cursor-pointer"
                    />
                    <span className={radioSpanCls}>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {filtersActive && (
              <button className={clearBtnCls} onClick={clearFilters}>
                Clear All
              </button>
            )}
          </aside>

          {/* Products Content */}
          <div className="flex flex-col">
            {/* Header */}
            <div className="flex flex-col gap-4 mb-10 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-bebas text-[clamp(1.6rem,4vw,2.2rem)] tracking-[.08em] text-[#222] dark:text-[#f0f2ed] mb-2">
                  {categoryData?.name || 'Products'}
                </h2>
                <p className="text-[.85rem] text-black/50 dark:text-[rgba(240,242,237,.5)]">
                  {isLoading ? 'Loading products...' : `${transformedProducts.length} of ${totalCount} products`}
                </p>
              </div>
              <div className="flex items-center gap-4 flex-wrap max-sm:w-full max-sm:gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                  className="flex-1 min-w-[150px] max-sm:min-w-0 max-sm:text-[.75rem] max-sm:px-3 max-sm:py-2.5 bg-black/[.02] dark:bg-white/[.04] border border-black/10 dark:border-white/[.08] rounded-md px-4 py-3 text-black/80 dark:text-[rgba(240,242,237,.8)] text-[.85rem] cursor-pointer transition-all duration-200 focus:outline-none focus:border-lime-brand/30 focus:bg-lime-brand/[.06] hover:border-black/15 dark:hover:border-lime-brand/20"
                >
                  <option className="bg-white dark:bg-dark-elevated-900" value="newest">Newest</option>
                  <option className="bg-white dark:bg-dark-elevated-900" value="price_low_to_high">Price: Low to High</option>
                  <option className="bg-white dark:bg-dark-elevated-900" value="price_high_to_low">Price: High to Low</option>
                  <option className="bg-white dark:bg-dark-elevated-900" value="highest_rated">Highest Rated</option>
                </select>
                <button
                  className="hidden max-lg:flex items-center gap-2 bg-black/[.02] dark:bg-lime-brand/10 border border-black/15 dark:border-lime-brand/20 rounded-md px-4 py-2.5 text-black/70 dark:text-lime-brand font-semibold text-[.8rem] uppercase tracking-[.06em] cursor-pointer transition-all duration-200 hover:bg-black/12 dark:hover:bg-lime-brand/20 dark:hover:shadow-[0_0_12px_rgba(168,214,62,.15)]"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal size={16} /> Filters
                </button>
              </div>
            </div>

            {/* Products Grid / Loading / Error / Empty */}
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <Loader size={32} className="animate-spin text-lime-brand" />
              </div>
            ) : isError ? (
              <div className="text-center py-12 px-4">
                <p className="text-[1.1rem] text-black/60 dark:text-[rgba(240,242,237,.6)] mb-6">
                  Failed to load products. Please try again later.
                </p>
              </div>
            ) : transformedProducts.length > 0 ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] max-md:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] max-sm:grid-cols-2 max-[360px]:grid-cols-1 gap-6 max-md:gap-5 max-sm:gap-4 max-[360px]:gap-3 mb-12">
                {transformedProducts.map(product => (
                  <div key={product.id}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                <p className="text-[1.1rem] text-black/60 dark:text-[rgba(240,242,237,.6)] mb-6">
                  No products found matching your filters.
                </p>
                <button
                  className={clearBtnCls}
                  onClick={() => {
                    clearFilters();
                    setSortBy('newest');
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  className="bg-black/[.06] dark:bg-white/[.04] border border-black/10 dark:border-white/[.08] px-4 py-2.5 rounded-md text-black/80 dark:text-[rgba(240,242,237,.8)] font-medium text-[.85rem] cursor-pointer transition-all duration-200 hover:enabled:bg-black/10 hover:enabled:border-black/15 dark:hover:enabled:bg-lime-brand/15 dark:hover:enabled:border-lime-brand/30 dark:hover:enabled:text-lime-brand disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  return pageNum <= totalPages ? pageNum : null;
                }).filter((p): p is number => p !== null).map(page => (
                  <button
                    key={page}
                    className={[
                      "px-4 py-2.5 rounded-md border font-medium text-[.85rem] cursor-pointer transition-all duration-200",
                      currentPage === page
                        ? "bg-gradient-to-br from-green-brand to-lime-brand border-lime-brand/50 text-white dark:text-dark-surface"
                        : "bg-black/[.06] dark:bg-white/[.04] border-black/10 dark:border-white/[.08] text-black/80 dark:text-[rgba(240,242,237,.8)] hover:bg-black/10 hover:border-black/15 dark:hover:bg-lime-brand/15 dark:hover:border-lime-brand/30 dark:hover:text-lime-brand"
                    ].join(' ')}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  className="bg-black/[.06] dark:bg-white/[.04] border border-black/10 dark:border-white/[.08] px-4 py-2.5 rounded-md text-black/80 dark:text-[rgba(240,242,237,.8)] font-medium text-[.85rem] cursor-pointer transition-all duration-200 hover:enabled:bg-black/10 hover:enabled:border-black/15 dark:hover:enabled:bg-lime-brand/15 dark:hover:enabled:border-lime-brand/30 dark:hover:enabled:text-lime-brand disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
