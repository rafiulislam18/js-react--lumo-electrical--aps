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

  // The URL query string is the single source of truth for the filter/page
  // state. Deriving these values from `searchParams` on every render (rather
  // than mirroring them into useState) keeps the page in sync when the user
  // navigates with the browser Back/Forward buttons — which change the URL but
  // would otherwise leave stale local state behind.
  const sortBy = searchParams.get('sort') || 'newest';
  const minPrice = parseFloat(searchParams.get('min_price') || '0');
  const maxPrice = parseFloat(searchParams.get('max_price') || '10000');
  const availability = searchParams.get('availability') || 'all';
  const rating = searchParams.get('rating') || 'all';
  const currentPage = parseInt(searchParams.get('page') || '1');
  const [showFilters, setShowFilters] = useState(false);

  // Merge a set of changes into the URL query params. Pass null (or '') to drop
  // a key. Each call pushes a history entry by default so Back/Forward step
  // through filter/page changes; pass { replace: true } to edit in place.
  const updateParams = (
    changes: Record<string, string | number | null>,
    options?: { replace?: boolean }
  ) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(changes).forEach(([key, value]) => {
          if (value === null || value === '') {
            next.delete(key);
          } else {
            next.set(key, value.toString());
          }
        });
        return next;
      },
      options
    );
  };

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

  // The price inputs need a local draft so the user can type freely without
  // rewriting the URL on every keystroke. They are seeded from the URL (or the
  // category's price range) and committed to the URL on blur.
  const [minPriceInput, setMinPriceInput] = useState<string>(searchParams.get('min_price') || '');
  const [maxPriceInput, setMaxPriceInput] = useState<string>(searchParams.get('max_price') || '');

  // Keep the price drafts in sync with the URL (Back/Forward navigation) and
  // with the category's actual price range once it has loaded.
  useEffect(() => {
    const urlMin = searchParams.get('min_price');
    setMinPriceInput(urlMin ?? (priceRange.min != null ? priceRange.min.toString() : ''));
  }, [searchParams, priceRange.min]);

  useEffect(() => {
    const urlMax = searchParams.get('max_price');
    setMaxPriceInput(urlMax ?? (priceRange.max != null ? priceRange.max.toString() : ''));
  }, [searchParams, priceRange.max]);

  // Scroll back to the top when the page number changes. The global
  // ScrollToTop only reacts to pathname changes, not the ?page= query param.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleMinPriceBlur = () => {
    const parsed = parseFloat(minPriceInput);
    const value = isNaN(parsed) ? (MIN_PRICE || 0) : parsed;
    const constrained = Math.max(MIN_PRICE || 0, Math.min(value, maxPrice));
    updateParams({ min_price: constrained > (MIN_PRICE || 0) ? constrained : null, page: 1 });
  };

  const handleMaxPriceBlur = () => {
    const parsed = parseFloat(maxPriceInput);
    const value = isNaN(parsed) ? (MAX_PRICE || 10000) : parsed;
    const constrained = Math.min(MAX_PRICE || 10000, Math.max(value, minPrice));
    updateParams({ max_price: constrained < (MAX_PRICE || 10000) ? constrained : null, page: 1 });
  };

  const filtersActive =
    availability !== 'all' ||
    rating !== 'all' ||
    searchParams.has('min_price') ||
    searchParams.has('max_price');

  const clearFilters = () => {
    updateParams({
      min_price: null,
      max_price: null,
      availability: null,
      rating: null,
      page: 1,
    });
  };

  // Shared style fragments — mapped from design tokens (.tile / .field / .btn-soft / eyebrow)
  const filterLabelCls = "font-bebas text-[1.05rem] text-[#222] dark:text-[#f0f2ed] mb-3 block";
  const filterGroupCls = "mb-7 pb-7 border-b border-[rgba(22,25,26,.07)] dark:border-white/[.06] last:border-b-0 last:mb-0 last:pb-0";
  const radioOptionCls = "flex items-center gap-3 cursor-pointer text-[.85rem]";
  const radioSpanCls = "text-black/60 dark:text-[rgba(240,242,237,.6)] cursor-pointer transition-colors duration-200 peer-checked:text-[#2f8b3d] dark:peer-checked:text-lime-brand peer-checked:font-medium";
  // .field-inset
  const fieldInsetCls = "w-full px-[.9rem] py-[.7rem] text-[.85rem] bg-[#f7f6f1] dark:bg-[#171c16] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[10px] text-[#16191a] dark:text-[#f1f3ea] outline-none transition-colors duration-150 focus:border-[rgba(57,151,70,.4)] dark:focus:border-lime-brand/40";
  // .btn-soft
  const clearBtnCls = "w-full py-2.5 px-4 rounded-[10px] bg-[rgba(57,151,70,.09)] dark:bg-[rgba(168,214,62,.1)] text-[#2f8b3d] dark:text-lime-brand font-semibold text-[.78rem] cursor-pointer transition-all duration-200 uppercase tracking-wider hover:bg-green-deep/15 dark:hover:bg-lime-brand/20 hover:shadow-[0_0_12px_rgba(57,151,70,.2)] dark:hover:shadow-[0_0_16px_rgba(168,214,62,.15)]";

  return (
    <div className="font-outfit bg-[#f6f5f0]/[.86] dark:bg-dark-surface text-black/70 dark:text-[rgba(240,242,237,.7)] min-h-screen flex flex-col">
      {/* Breadcrumb */}
      <div className="border-b border-[rgba(22,25,26,.07)] dark:border-white/[.06]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-4 flex items-center gap-2 text-[.8rem] max-sm:text-[.7rem] flex-wrap">
          <a href="/" className="text-black/60 dark:text-[rgba(240,242,237,.6)] no-underline transition-colors duration-200 hover:text-[#2f8b3d] dark:hover:text-lime-brand">
            Home
          </a>
          <span className="text-black/40 dark:text-[rgba(240,242,237,.42)]">/</span>
          {breadcrumb.length > 0 && breadcrumb.slice(0, -1).map((cat) => (
            <div key={cat.id} className="flex items-center gap-2">
              <a href={`/${cat.slug}`} className="text-black/60 dark:text-[rgba(240,242,237,.6)] no-underline transition-colors duration-200 hover:text-[#2f8b3d] dark:hover:text-lime-brand">
                {cat.name}
              </a>
              <span className="text-black/40 dark:text-[rgba(240,242,237,.42)]">/</span>
            </div>
          ))}
          <span className="text-[#2f8b3d] dark:text-lime-brand font-semibold">{categoryData?.name || 'Products'}</span>
        </div>
      </div>

      {/* Category header */}
      <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-8 pt-10 pb-4 max-sm:pt-6">
        {/* Eyebrow with brand bar */}
        <div className="inline-flex items-center gap-2 text-[.68rem] font-bold tracking-[.2em] uppercase text-[#2f8b3d] dark:text-lime-brand mb-3 before:content-[''] before:w-6 before:h-0.5 before:bg-[#2f8b3d] dark:before:bg-lime-brand before:rounded-sm before:shrink-0">
          Category
        </div>
        <h1 className="font-bebas leading-[.9] tracking-[.04em] text-[#16191a] dark:text-[#f0f2ed] text-[clamp(2.2rem,5.5vw,3.4rem)] max-sm:text-[1.8rem]">
          {categoryData?.name || 'Products'}
        </h1>
        <p className="mt-3 text-[.9rem] max-sm:text-[.8rem] leading-[1.7] text-black/60 dark:text-[rgba(240,242,237,.6)] max-w-[900px]">
          {categoryData?.name} price starts from ZAR {response?.results.price_range.min || '0'} to ZAR {response?.results.price_range.max || '0'} in Cape Town, South Africa; depending on brand, model, and features. Buy the Latest {categoryData?.name} from Lumo Electrical online shop. Browse below and order yours now!
        </p>
        {categoryData?.children && categoryData.children.length > 0 && (
          <div className="flex flex-wrap gap-2.5 mt-5">
            {categoryData.children.map((child) => (
              <a
                key={child.id}
                href={`/${child.slug}`}
                className="inline-flex items-center rounded-full px-4 py-2 bg-[rgba(57,151,70,.09)] dark:bg-[rgba(168,214,62,.1)] text-[#2f8b3d] dark:text-lime-brand no-underline text-[.8rem] font-medium transition-all duration-200 hover:bg-[#2f8b3d]/15 dark:hover:bg-lime-brand/20 hover:shadow-[0_0_16px_rgba(168,214,62,.15)]"
              >
                {child.name}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-[1280px] mx-auto w-full px-8 py-8 max-sm:px-4 max-sm:py-4">
        <div className="grid grid-cols-[260px_1fr] gap-8 items-start max-lg:grid-cols-1 max-lg:gap-6">

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
              "bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[24px] p-6",
              "max-lg:fixed max-lg:top-0 max-lg:left-0 max-lg:right-0 max-lg:bottom-0 max-lg:z-50 max-lg:w-full max-lg:max-w-[320px] max-lg:rounded-none max-lg:max-h-screen max-lg:overflow-y-auto max-lg:transition-transform max-lg:duration-300 max-lg:ease-in-out max-lg:bg-white max-lg:dark:bg-dark-surface",
              "lg:sticky lg:top-[124px] lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto",
              showFilters ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"
            ].join(' ')}
          >
            {/* Mobile header */}
            <div className="hidden max-lg:flex items-center justify-between mb-6 pb-6 border-b border-[rgba(22,25,26,.07)] dark:border-white/[.06]">
              <span className="font-bebas text-[1.25rem] text-[#1a1a1a] dark:text-[#f0f2ed]">Filters</span>
              <button
                className="bg-transparent border-none text-black/50 dark:text-[rgba(240,242,237,.6)] text-2xl cursor-pointer transition-colors duration-200 hover:text-[#2f8b3d] dark:hover:text-lime-brand"
                onClick={() => setShowFilters(false)}
              >
                ✕
              </button>
            </div>

            {/* Price Range */}
            <div className={filterGroupCls}>
              <label className={filterLabelCls}>Price Range</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  min={MIN_PRICE}
                  max={MAX_PRICE}
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  onBlur={handleMinPriceBlur}
                  placeholder="Min"
                  className={`${fieldInsetCls} flex-1 min-w-0`}
                />
                <input
                  type="number"
                  min={MIN_PRICE}
                  max={MAX_PRICE}
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  onBlur={handleMaxPriceBlur}
                  placeholder="Max"
                  className={`${fieldInsetCls} flex-1 min-w-0`}
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
                      onChange={(e) => updateParams({ availability: e.target.value === 'all' ? null : e.target.value, page: 1 })}
                      className="peer accent-[#2f8b3d] dark:accent-lime-brand cursor-pointer w-[15px] h-[15px]"
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
                      onChange={(e) => updateParams({ rating: e.target.value === 'all' ? null : e.target.value, page: 1 })}
                      className="peer accent-[#2f8b3d] dark:accent-lime-brand cursor-pointer w-[15px] h-[15px]"
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
            <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-bebas text-[1.8rem] leading-none tracking-[.04em] text-[#222] dark:text-[#f0f2ed] mb-1.5">
                  {categoryData?.name || 'Products'}
                </h2>
                <p className="text-[.84rem] text-[rgba(22,25,26,.42)] dark:text-[rgba(241,243,234,.42)]">
                  {isLoading ? 'Loading products...' : `${transformedProducts.length} of ${totalCount} products`}
                </p>
              </div>
              <div className="flex items-center gap-4 flex-wrap max-sm:w-full max-sm:gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => updateParams({ sort: e.target.value === 'newest' ? null : e.target.value, page: 1 })}
                  className="min-w-[170px] max-sm:flex-1 max-sm:min-w-0 max-sm:text-[.75rem] px-[.9rem] py-[.7rem] text-[.85rem] bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[10px] text-[#16191a] dark:text-[#f1f3ea] cursor-pointer outline-none transition-colors duration-150 focus:border-[rgba(57,151,70,.4)] dark:focus:border-lime-brand/40"
                >
                  <option className="bg-white dark:bg-dark-elevated-900" value="newest">Newest</option>
                  <option className="bg-white dark:bg-dark-elevated-900" value="price_low_to_high">Price: Low to High</option>
                  <option className="bg-white dark:bg-dark-elevated-900" value="price_high_to_low">Price: High to Low</option>
                  <option className="bg-white dark:bg-dark-elevated-900" value="highest_rated">Highest Rated</option>
                </select>
                <button
                  className="hidden max-lg:flex items-center gap-2 bg-[rgba(57,151,70,.09)] dark:bg-lime-brand/10 border border-transparent dark:border-lime-brand/20 rounded-[10px] px-4 py-2.5 text-[#2f8b3d] dark:text-lime-brand font-semibold text-[.8rem] uppercase tracking-[.06em] cursor-pointer transition-all duration-200 hover:bg-green-deep/15 dark:hover:bg-lime-brand/20 dark:hover:shadow-[0_0_12px_rgba(168,214,62,.15)]"
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 lg:gap-5 mb-10">
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
                    updateParams({
                      min_price: null,
                      max_price: null,
                      availability: null,
                      rating: null,
                      sort: null,
                      page: 1,
                    });
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  className="w-9 h-9 grid place-items-center rounded-[10px] border border-[rgba(22,25,26,.1)] dark:border-white/10 text-black/60 dark:text-[rgba(241,243,234,.6)] cursor-pointer transition-all duration-200 hover:enabled:border-[rgba(57,151,70,.4)] hover:enabled:text-[#2f8b3d] dark:hover:enabled:border-lime-brand/40 dark:hover:enabled:text-lime-brand disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={() => updateParams({ page: Math.max(currentPage - 1, 1) })}
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
                      "min-w-9 h-9 px-2 rounded-[10px] font-semibold text-[.85rem] transition-all duration-200",
                      currentPage === page
                        ? "bg-gradient-to-br from-green-deep to-green-brand text-white dark:text-dark-surface cursor-default"
                        : "border border-[rgba(22,25,26,.1)] dark:border-white/10 text-black/60 dark:text-[rgba(241,243,234,.6)] cursor-pointer hover:border-[rgba(57,151,70,.4)] hover:text-[#2f8b3d] dark:hover:border-lime-brand/40 dark:hover:text-lime-brand"
                    ].join(' ')}
                    onClick={() => updateParams({ page })}
                    disabled={currentPage === page}
                  >
                    {page}
                  </button>
                ))}

                <button
                  className="w-9 h-9 grid place-items-center rounded-[10px] border border-[rgba(22,25,26,.1)] dark:border-white/10 text-black/60 dark:text-[rgba(241,243,234,.6)] cursor-pointer transition-all duration-200 hover:enabled:border-[rgba(57,151,70,.4)] hover:enabled:text-[#2f8b3d] dark:hover:enabled:border-lime-brand/40 dark:hover:enabled:text-lime-brand disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={() => updateParams({ page: Math.min(currentPage + 1, totalPages) })}
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
