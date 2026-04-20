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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');

        .cp { font-family: 'Outfit', sans-serif; background: #f5f5f5; color: rgba(0,0,0,.7); min-height: 100vh; display: flex; flex-direction: column; }
        .dark .cp { background: #060806; color: rgba(240,242,237,.7); }

        /* ── BREADCRUMB ── */
        .cp-breadcrumb { background: rgba(168,214,62,.08); border-bottom: 1px solid rgba(168,214,62,.12); padding: 1.25rem 2rem; }
        .dark .cp-breadcrumb { background: rgba(168,214,62,.04); border-bottom-color: rgba(168,214,62,.08); }
        .cp-breadcrumb-inner { max-width: 1280px; margin: 0 auto; display: flex; align-items: center; gap: 1rem; font-size: .85rem; flex-wrap: wrap; }
        .cp-breadcrumb-link { color: rgba(0,0,0,.5); text-decoration: none; transition: color .2s; }
        .dark .cp-breadcrumb-link { color: rgba(240,242,237,.5); }
        .cp-breadcrumb-link:hover { color: #a8d63e; }
        .cp-breadcrumb-sep { color: rgba(0,0,0,.2); }
        .dark .cp-breadcrumb-sep { color: rgba(240,242,237,.2); }
        .cp-breadcrumb-active { color: #a8d63e; font-weight: 600; }

        /* ── CATEGORY SECTION ── */
        .cp-category-section { background: rgba(168,214,62,.06); border-bottom: 1px solid rgba(168,214,62,.15); padding: 2.5rem 2rem; }
        .dark .cp-category-section { background: linear-gradient(135deg, rgba(58,170,73,.08) 0%, rgba(168,214,62,.04) 100%); border-bottom-color: rgba(168,214,62,.12); }
        .cp-category-inner { max-width: 1280px; margin: 0 auto; }
        .cp-category-title { font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; letter-spacing: .08em; color: #222; margin-bottom: 1rem; }
        .dark .cp-category-title { color: #f0f2ed; }
        .cp-category-desc { font-size: .9rem; line-height: 1.8; color: rgba(0,0,0,.6); margin-bottom: 1.5rem; max-width: 800px; }
        .dark .cp-category-desc { color: rgba(240,242,237,.6); }
        .cp-children { display: flex; flex-wrap: wrap; gap: .75rem; }
        .cp-child-link { 
          display: inline-flex; align-items: center; gap: .5rem;
          padding: .65rem 1.25rem; border-radius: 6px;
          background: rgba(0,0,0,.08); border: 1px solid rgba(0,0,0,.12);
          color: rgba(0,0,0,.7); text-decoration: none; font-size: .82rem; font-weight: 500;
          transition: all .25s;
        }
        .dark .cp-child-link {
          background: rgba(168,214,62,.1);
          border-color: rgba(168,214,62,.2);
          color: #a8d63e;
        }
        .cp-child-link:hover { background: rgba(0,0,0,.12); }
        .dark .cp-child-link:hover { background: rgba(168,214,62,.2); box-shadow: 0 0 16px rgba(168,214,62,.15); }

        /* ── MAIN GRID ── */
        .cp-main { flex: 1; max-width: 1280px; margin: 0 auto; width: 100%; padding: 2rem; }
        .cp-grid { display: grid; grid-template-columns: 260px 1fr; gap: 2.5rem; }
        @media(max-width:1024px) { .cp-grid { grid-template-columns: 1fr; gap: 2rem; } }

        /* ── FILTERS SIDEBAR ── */
        .cp-filters-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.7); z-index: 49; display: none; }
        .cp-filters-overlay.show { display: block; }

        .cp-filters { background: rgba(0,0,0,.03); border: 1px solid rgba(0,0,0,.08); border-radius: 12px; padding: 1.5rem; position: sticky; top: 100px; max-height: calc(100vh - 120px); overflow-y: auto; display: block; }
        .dark .cp-filters { background: rgba(255,255,255,.03); border-color: rgba(255,255,255,.06); }
        @media(max-width:1024px) {
          .cp-filters { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 50; width: 100%; max-width: 320px; border-radius: 0; max-height: 100vh; transform: translateX(-100%); transition: transform .3s ease; background: #f5f5f5; }
          .dark .cp-filters { background: #060806; }
          .cp-filters.show-mobile { transform: translateX(0); }
        }

        .cp-filters-header { display: none; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(0,0,0,.08); }
        .dark .cp-filters-header { border-bottom-color: rgba(255,255,255,.06); }
        @media(max-width:1024px) { .cp-filters-header { display: flex; } }
        .cp-filters-title { font-family: 'Bebas Neue', sans-serif; font-size: 1.25rem; color: #222; }
        .dark .cp-filters-title { color: #f0f2ed; }
        .cp-filters-close { background: none; border: none; color: rgba(0,0,0,.5); font-size: 1.5rem; cursor: pointer; transition: color .2s; }
        .dark .cp-filters-close { color: rgba(240,242,237,.6); }
        .cp-filters-close:hover { color: #a8d63e; }

        .cp-filter-group { margin-bottom: 1.75rem; padding-bottom: 1.75rem; border-bottom: 1px solid rgba(0,0,0,.08); }
        .dark .cp-filter-group { border-bottom-color: rgba(255,255,255,.06); }
        .cp-filter-group:last-child { border-bottom: none; }
        .cp-filter-label { font-family: 'Bebas Neue', sans-serif; font-size: .95rem; letter-spacing: .06em; color: #222; margin-bottom: .85rem; display: block; }
        .dark .cp-filter-label { color: #f0f2ed; }

        .cp-filter-price-inputs { display: flex; gap: .75rem; margin-bottom: 1rem; }
        .cp-price-input { flex: 1; background: rgba(0,0,0,.04); border: 1px solid rgba(0,0,0,.1); border-radius: 6px; padding: .6rem .85rem; color: rgba(0,0,0,.8); font-size: .8rem; }
        .dark .cp-price-input { background: rgba(255,255,255,.04); border-color: rgba(255,255,255,.08); color: rgba(240,242,237,.8); }
        .cp-price-input:focus { outline: none; border-color: rgba(168,214,62,.3); background: rgba(168,214,62,.06); }

        .cp-filter-options { display: flex; flex-direction: column; gap: .7rem; }
        .cp-filter-option { display: flex; align-items: center; gap: .75rem; }
        .cp-filter-option input { accent-color: #a8d63e; cursor: pointer; }
        .cp-filter-option span { font-size: .85rem; color: rgba(0,0,0,.6); cursor: pointer; transition: color .2s; }
        .dark .cp-filter-option span { color: rgba(240,242,237,.6); }
        .cp-filter-option input:checked + span { color: #a8d63e; font-weight: 500; }
        .cp-filter-option:hover span { color: #a8d63e; }

        .cp-clear-btn { width: 100%; padding: .75rem 1rem; border-radius: 6px; border: 1px solid rgba(0,0,0,.15); background: rgba(0,0,0,.06); color: rgba(0,0,0,.7); font-weight: 600; font-size: .82rem; cursor: pointer; transition: all .25s; text-transform: uppercase; letter-spacing: .06em; }
        .dark .cp-clear-btn { border-color: rgba(168,214,62,.3); background: rgba(168,214,62,.08); color: #a8d63e; }
        .cp-clear-btn:hover { background: rgba(0,0,0,.1); }
        .dark .cp-clear-btn:hover { background: rgba(168,214,62,.15); box-shadow: 0 0 16px rgba(168,214,62,.15); }

        /* ── PRODUCTS CONTENT ── */
        .cp-products { display: flex; flex-direction: column; }

        .cp-header { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2.5rem; }
        @media(min-width:640px) { .cp-header { flex-direction: row; align-items: flex-end; justify-content: space-between; } }

        .cp-header-left h2 { font-family: 'Bebas Neue', sans-serif; font-size: 2.2rem; letter-spacing: .08em; color: #222; margin-bottom: .5rem; }
        .dark .cp-header-left h2 { color: #f0f2ed; }
        .cp-header-left p { font-size: .85rem; color: rgba(0,0,0,.5); }
        .dark .cp-header-left p { color: rgba(240,242,237,.5); }

        .cp-header-right { display: flex; align-items: center; gap: 1rem; }
        .cp-sort-select { background: rgba(0,0,0,.04); border: 1px solid rgba(0,0,0,.1); border-radius: 6px; padding: .75rem 1rem; color: rgba(0,0,0,.8); font-size: .85rem; cursor: pointer; transition: all .2s; }
        .dark .cp-sort-select { background: rgba(255,255,255,.04); border-color: rgba(255,255,255,.08); color: rgba(240,242,237,.8); }
        .cp-sort-select:focus { outline: none; border-color: rgba(168,214,62,.3); background: rgba(168,214,62,.06); }
        .cp-sort-select:hover { border-color: rgba(0,0,0,.15); }
        .dark .cp-sort-select:hover { border-color: rgba(168,214,62,.2); }

        .cp-filter-btn { background: rgba(0,0,0,.08); border: 1px solid rgba(0,0,0,.15); border-radius: 6px; padding: .65rem 1rem; color: rgba(0,0,0,.7); font-weight: 600; cursor: pointer; transition: all .2s; font-size: .8rem; display: none; align-items: center; gap: .5rem; text-transform: uppercase; letter-spacing: .06em; }
        .dark .cp-filter-btn { background: rgba(168,214,62,.1); border-color: rgba(168,214,62,.2); color: #a8d63e; }
        @media(max-width:1024px) { .cp-filter-btn { display: flex; } }
        .cp-filter-btn:hover { background: rgba(0,0,0,.12); }
        .dark .cp-filter-btn:hover { background: rgba(168,214,62,.2); box-shadow: 0 0 12px rgba(168,214,62,.15); }

        /* ── PRODUCTS GRID ── */
        .cp-grid-products { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
        @media(max-width:768px) { .cp-grid-products { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; } }
        @media(max-width:480px) { .cp-grid-products { grid-template-columns: repeat(2, 1fr); gap: .75rem; } }

        /* ── EMPTY STATE ── */
        .cp-empty { text-align: center; padding: 3rem 1rem; }
        .cp-empty-text { font-size: 1.1rem; color: rgba(0,0,0,.6); margin-bottom: 1.5rem; }
        .dark .cp-empty-text { color: rgba(240,242,237,.6); }

        /* ── PAGINATION ── */
        .cp-pagination { display: flex; align-items: center; justify-content: center; gap: .5rem; margin-top: 2rem; }
        .cp-pagination-btn { 
          background: rgba(0,0,0,.06); border: 1px solid rgba(0,0,0,.1);
          padding: .6rem 1rem; border-radius: 6px; color: rgba(0,0,0,.8);
          font-weight: 500; cursor: pointer; transition: all .2s; font-size: .85rem;
        }
        .dark .cp-pagination-btn {
          background: rgba(255,255,255,.04);
          border-color: rgba(255,255,255,.08);
          color: rgba(240,242,237,.8);
        }
        .cp-pagination-btn:hover:not(:disabled) { background: rgba(0,0,0,.1); border-color: rgba(0,0,0,.15); }
        .dark .cp-pagination-btn:hover:not(:disabled) { background: rgba(168,214,62,.15); border-color: rgba(168,214,62,.3); color: #a8d63e; }
        .cp-pagination-btn.active { background: linear-gradient(135deg, #3aaa49, #a8d63e); border-color: rgba(168,214,62,.5); color: #0a0c0a; }
        .cp-pagination-btn:disabled { opacity: .4; cursor: not-allowed; }

        /* ── LOADING ── */
        .cp-loading { display: flex; align-items: center; justify-content: center; min-height: 300px; }
        .cp-spinner { animation: spin 2s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="cp">
        {/* Breadcrumb */}
        <section className="cp-breadcrumb">
          <div className="cp-breadcrumb-inner">
            <a href="/" className="cp-breadcrumb-link">Home</a>
            <span className="cp-breadcrumb-sep">/</span>
            {breadcrumb.length > 0 && breadcrumb.slice(0, -1).map((cat, idx) => (
              <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <a href={`/${cat.slug}`} className="cp-breadcrumb-link">{cat.name}</a>
                <span className="cp-breadcrumb-sep">/</span>
              </div>
            ))}
            <span className="cp-breadcrumb-active">{categoryData?.name || 'Products'}</span>
          </div>
        </section>

        {/* Category Section */}
        <section className="cp-category-section">
          <div className="cp-category-inner">
            <div className="cp-category-title">{categoryData?.name || 'Products'}</div>
            <p className="cp-category-desc">
              {categoryData?.name} price starts from ZAR {response?.results.price_range.min || '0'} to ZAR {response?.results.price_range.max || '0'} in Cape Town, South Africa; depending on brand, model, and features. Buy the Latest {categoryData?.name} from Lumo Electrical online shop. Browse below and order yours now!
            </p>
            {categoryData?.children && categoryData.children.length > 0 && (
              <div className="cp-children">
                {categoryData.children.map((child) => (
                  <a key={child.id} href={`/${child.slug}`} className="cp-child-link">
                    {child.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Main Content */}
        <div className="cp-main">
          <div className="cp-grid">
            {/* Filters Sidebar */}
            {showFilters && <div className="cp-filters-overlay show" onClick={() => setShowFilters(false)} />}
            <div className={`cp-filters ${showFilters ? 'show-mobile' : ''}`}>
              <div className="cp-filters-header">
                <span className="cp-filters-title">Filters</span>
                <button className="cp-filters-close" onClick={() => setShowFilters(false)}>✕</button>
              </div>

              {/* Price Range */}
              <div className="cp-filter-group">
                <label className="cp-filter-label">Price Range</label>
                <div className="cp-filter-price-inputs">
                  <input
                    type="number"
                    min={MIN_PRICE}
                    max={MAX_PRICE}
                    value={minPrice}
                    onChange={handleMinPriceChange}
                    onBlur={handleMinPriceBlur}
                    placeholder="Min"
                    className="cp-price-input"
                  />
                  <input
                    type="number"
                    min={MIN_PRICE}
                    max={MAX_PRICE}
                    value={maxPrice}
                    onChange={handleMaxPriceChange}
                    onBlur={handleMaxPriceBlur}
                    placeholder="Max"
                    className="cp-price-input"
                  />
                </div>
              </div>

              {/* Availability */}
              <div className="cp-filter-group">
                <label className="cp-filter-label">Availability</label>
                <div className="cp-filter-options">
                  <label className="cp-filter-option">
                    <input
                      type="radio"
                      name="availability"
                      value="all"
                      checked={availability === "all"}
                      onChange={(e) => { setAvailability(e.target.value); setCurrentPage(1); }}
                    />
                    <span>All</span>
                  </label>
                  <label className="cp-filter-option">
                    <input
                      type="radio"
                      name="availability"
                      value="in-stock"
                      checked={availability === "in-stock"}
                      onChange={(e) => { setAvailability(e.target.value); setCurrentPage(1); }}
                    />
                    <span>In Stock</span>
                  </label>
                  <label className="cp-filter-option">
                    <input
                      type="radio"
                      name="availability"
                      value="out-of-stock"
                      checked={availability === "out-of-stock"}
                      onChange={(e) => { setAvailability(e.target.value); setCurrentPage(1); }}
                    />
                    <span>Out of Stock</span>
                  </label>
                </div>
              </div>

              {/* Rating */}
              <div className="cp-filter-group">
                <label className="cp-filter-label">Rating</label>
                <div className="cp-filter-options">
                  <label className="cp-filter-option">
                    <input
                      type="radio"
                      name="rating"
                      value="all"
                      checked={rating === "all"}
                      onChange={(e) => { setRating(e.target.value); setCurrentPage(1); }}
                    />
                    <span>All Ratings</span>
                  </label>
                  <label className="cp-filter-option">
                    <input
                      type="radio"
                      name="rating"
                      value="5"
                      checked={rating === "5"}
                      onChange={(e) => { setRating(e.target.value); setCurrentPage(1); }}
                    />
                    <span>5 Stars</span>
                  </label>
                  <label className="cp-filter-option">
                    <input
                      type="radio"
                      name="rating"
                      value="4"
                      checked={rating === "4"}
                      onChange={(e) => { setRating(e.target.value); setCurrentPage(1); }}
                    />
                    <span>4+ Stars</span>
                  </label>
                  <label className="cp-filter-option">
                    <input
                      type="radio"
                      name="rating"
                      value="3"
                      checked={rating === "3"}
                      onChange={(e) => { setRating(e.target.value); setCurrentPage(1); }}
                    />
                    <span>3+ Stars</span>
                  </label>
                  <label className="cp-filter-option">
                    <input
                      type="radio"
                      name="rating"
                      value="below3"
                      checked={rating === "below3"}
                      onChange={(e) => { setRating(e.target.value); setCurrentPage(1); }}
                    />
                    <span>Below 3 Stars</span>
                  </label>
                </div>
              </div>

              {/* Clear Filters */}
              {(availability !== 'all' || rating !== 'all' || minPrice !== (MIN_PRICE || 0) || maxPrice !== (MAX_PRICE || 10000)) && (
                <button
                  className="cp-clear-btn"
                  onClick={() => {
                    setMinPrice(MIN_PRICE || 0);
                    setMaxPrice(MAX_PRICE || 10000);
                    setAvailability('all');
                    setRating('all');
                    setCurrentPage(1);
                  }}
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Products Content */}
            <div className="cp-products">
              {/* Header */}
              <div className="cp-header">
                <div className="cp-header-left">
                  <h2>{categoryData?.name || 'Products'}</h2>
                  <p>{isLoading ? 'Loading products...' : `${transformedProducts.length} of ${totalCount} products`}</p>
                </div>
                <div className="cp-header-right">
                  <select 
                    value={sortBy} 
                    onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                    className="cp-sort-select"
                  >
                    <option value="newest">Newest</option>
                    <option value="price_low_to_high">Price: Low to High</option>
                    <option value="price_high_to_low">Price: High to Low</option>
                    <option value="highest_rated">Highest Rated</option>
                  </select>
                  <button 
                    className="cp-filter-btn"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <SlidersHorizontal size={16} /> Filters
                  </button>
                </div>
              </div>

              {/* Products Grid or Loading/Error/Empty */}
              {isLoading ? (
                <div className="cp-loading">
                  <Loader size={32} className="cp-spinner" style={{ color: '#a8d63e' }} />
                </div>
              ) : isError ? (
                <div className="cp-empty">
                  <p className="cp-empty-text">Failed to load products. Please try again later.</p>
                </div>
              ) : transformedProducts.length > 0 ? (
                <div className="cp-grid-products">
                  {transformedProducts.map(product => (
                    <div key={product.id}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="cp-empty">
                  <p className="cp-empty-text">No products found matching your filters.</p>
                  <button
                    className="cp-clear-btn"
                    onClick={() => {
                      setMinPrice(MIN_PRICE || 0);
                      setMaxPrice(MAX_PRICE || 10000);
                      setAvailability('all');
                      setRating('all');
                      setSortBy('newest');
                      setCurrentPage(1);
                    }}
                  >
                    Clear All Filters
                  </button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="cp-pagination">
                  <button
                    className="cp-pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    return pageNum <= totalPages ? pageNum : null;
                  }).filter(Boolean).map(page => (
                    <button
                      key={page}
                      className={`cp-pagination-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    className="cp-pagination-btn"
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
    </>
  );
}