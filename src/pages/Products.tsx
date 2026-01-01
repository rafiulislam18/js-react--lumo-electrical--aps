import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { allProducts, categories, MIN_PRODUCT_PRICE, MAX_PRODUCT_PRICE } from "@/data/dummyData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Combine all products and remove duplicates
const productsData = [...allProducts].reduce((acc: any, product: any) => {
  if (!acc.find((p: any) => p.id === product.id)) {
    acc.push(product);
  }
  return acc;
}, []);

const ITEMS_PER_PAGE = 12;
const MIN_PRICE = MIN_PRODUCT_PRICE;
const MAX_PRICE = MAX_PRODUCT_PRICE;

// Map special section types to their display names
const SPECIAL_SECTIONS: Record<string, { name: string; filterFn: (p: any) => boolean }> = {
  'featured-products': { 
    name: 'Featured Products', 
    filterFn: (p: any) => p.isFeatured === true 
  },
  'best-sellers': { 
    name: 'Best Sellers', 
    filterFn: (p: any) => p.isBestSeller === true 
  },
  'new-arrivals': { 
    name: 'New Arrivals', 
    filterFn: (p: any) => p.isNewArrival === true 
  },
};

export default function Products() {
  const [searchParams] = useSearchParams();
  const { categorySlug } = useParams();
  const searchQuery = searchParams.get("search") || "";
  
  // Determine if this is a special section or regular category
  const isSpecialSection = categorySlug && categorySlug in SPECIAL_SECTIONS;
  const selectedCategory = !isSpecialSection && categorySlug ? categories.find(cat => cat.slug === categorySlug) : null;
  const specialSection = isSpecialSection && categorySlug ? SPECIAL_SECTIONS[categorySlug] : null;
  
  const [sortBy, setSortBy] = useState("newest");
  const [minPrice, setMinPrice] = useState(MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [availability, setAvailability] = useState("all");
  const [rating, setRating] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [activeSlider, setActiveSlider] = useState<"min" | "max">("min");

  // Reset filters and page when search query or category changes
  useEffect(() => {
    setCurrentPage(1);
    setMinPrice(MIN_PRICE);
    setMaxPrice(MAX_PRICE);
    setAvailability("all");
    setRating("all");
    setSortBy("newest");
  }, [searchQuery, categorySlug]);

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = productsData;

    // Filter by special section if applicable
    if (isSpecialSection && specialSection) {
      filtered = filtered.filter(specialSection.filterFn);
    }
    
    // Filter by category if categorySlug is provided and not a special section
    if (categorySlug && selectedCategory) {
      filtered = filtered.filter((p: any) => p.categoryId === selectedCategory.id);
    }

    // Filter by search query - search only by product name
    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p: any) => p.name.toLowerCase().includes(queryLower)
      );
    }

    // Filter by price range
    filtered = filtered.filter((p: any) => p.price >= minPrice && p.price <= maxPrice);

    // Filter by availability
    if (availability === "in-stock") {
      filtered = filtered.filter((p: any) => p.inStock === true);
    } else if (availability === "out-of-stock") {
      filtered = filtered.filter((p: any) => p.inStock === false);
    }

    // Filter by rating
    if (rating !== "all") {
      if (rating === "below3") {
        filtered = filtered.filter((p: any) => p.rating < 3);
      } else {
        const ratingValue = parseInt(rating);
        filtered = filtered.filter((p: any) => p.rating >= ratingValue);
      }
    }

    return filtered;
  }, [minPrice, maxPrice, availability, rating, searchQuery, categorySlug, selectedCategory, isSpecialSection, specialSection]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];

    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
      default:
        sorted.reverse();
        break;
    }

    return sorted;
  }, [filteredProducts, sortBy]);

  // Paginate products
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedProducts, currentPage]);

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(MIN_PRICE, Math.min(parseInt(e.target.value) || MIN_PRICE, maxPrice));
    setMinPrice(value);
    setCurrentPage(1);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(MAX_PRICE, Math.max(parseInt(e.target.value) || MAX_PRICE, minPrice));
    setMaxPrice(value);
    setCurrentPage(1);
  };

  const handleMinSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(parseInt(e.target.value), maxPrice);
    setMinPrice(value);
    setActiveSlider("min");
    setCurrentPage(1);
  };

  const handleMaxSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(parseInt(e.target.value), minPrice);
    setMaxPrice(value);
    setActiveSlider("max");
    setCurrentPage(1);
  };

  // Handle clicking on the slider bar to move the closest thumb
  const handleSliderBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const clickValue = MIN_PRICE + (percentage * (MAX_PRICE - MIN_PRICE));

    // Calculate distances to each thumb
    const distanceToMin = Math.abs(clickValue - minPrice);
    const distanceToMax = Math.abs(clickValue - maxPrice);

    // Move the closest thumb
    if (distanceToMin < distanceToMax) {
      const newMin = Math.max(MIN_PRICE, Math.min(clickValue, maxPrice));
      setMinPrice(Math.round(newMin));
    } else {
      const newMax = Math.min(MAX_PRICE, Math.max(clickValue, minPrice));
      setMaxPrice(Math.round(newMax));
    }
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col font-sans">
      {/* Breadcrumb */}
      <section className="border-b border-gray-100 bg-white">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm overflow-x-auto">
            <a href="/" className="text-gray-600 hover:text-primary transition-colors whitespace-nowrap">Home</a>
            {searchQuery && (
              <>
                <span className="text-gray-400">/</span>
                <span className="text-primary font-semibold text-xs sm:text-sm truncate">Search - {searchQuery.substring(0, 15)}{searchQuery.length > 15 ? '...' : ''}</span>
              </>
            )}
            {selectedCategory && (
              <>
                <span className="text-gray-400">/</span>
                <span className="text-primary font-semibold">{selectedCategory.name}</span>
              </>
            )}
            {specialSection && (
              <>
                <span className="text-gray-400">/</span>
                <span className="text-primary font-semibold">{specialSection.name}</span>
              </>
            )}
            {!selectedCategory && !specialSection && !searchQuery && (
              <>
                <span className="text-gray-400">/</span>
                <span className="text-primary font-semibold">All Products</span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-2 sm:px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 animate-slide-in-left ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h3 className="font-bold text-lg">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-900"
                >
                  ✕
                </button>
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
              <div className="mb-8 pb-8 border-b border-gray-100">
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

              {/* Price Range Filter */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-4">Price Range</h4>
                
                {/* Min/Max Inputs */}
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
                        className="pl-7 h-9 text-sm border-gray-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Price Range Slider */}
                <div className="space-y-2">
                  <div 
                    className="relative h-2 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300 transition-colors"
                    onClick={handleSliderBarClick}
                  >
                    <input
                      type="range"
                      min={MIN_PRICE}
                      max={MAX_PRICE}
                      value={minPrice}
                      onChange={handleMinSliderChange}
                      onMouseDown={() => setActiveSlider("min")}
                      onTouchStart={() => setActiveSlider("min")}
                      className="absolute w-full h-2 top-0 left-0 rounded-full appearance-none bg-transparent thumb-left"
                      style={{
                        zIndex: activeSlider === "min" ? 5 : 3,
                      }}
                    />
                    <input
                      type="range"
                      min={MIN_PRICE}
                      max={MAX_PRICE}
                      value={maxPrice}
                      onChange={handleMaxSliderChange}
                      onMouseDown={() => setActiveSlider("max")}
                      onTouchStart={() => setActiveSlider("max")}
                      className="absolute w-full h-2 top-0 left-0 rounded-full appearance-none bg-transparent thumb-right"
                      style={{
                        zIndex: activeSlider === "max" ? 5 : 3,
                      }}
                    />
                    <div
                      className="absolute h-2 bg-primary rounded-full"
                      style={{
                        left: `${((minPrice - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100}%`,
                        right: `${100 - ((maxPrice - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-600 text-center">
                    ${minPrice} - ${maxPrice}
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {(availability !== 'all' || rating !== 'all' || minPrice !== MIN_PRICE || maxPrice !== MAX_PRICE) && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setMinPrice(MIN_PRICE);
                    setMaxPrice(MAX_PRICE);
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
                  {searchQuery ? `Search Results for "${searchQuery}"` : selectedCategory ? selectedCategory.name : specialSection ? specialSection.name : "All Products"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 animate-fade-in" style={{animationDelay: '0.1s'}}>
                  Showing {paginatedProducts.length} of {sortedProducts.length} products
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                {/* Sort Dropdown */}
                <div className="flex-1 sm:flex-none sm:w-48">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="border-gray-200 h-10 text-xs sm:text-sm">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filter Button (Mobile) */}
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
            {paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 animate-stagger mb-12">
                {paginatedProducts.map(product => (
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
                    setMinPrice(MIN_PRICE);
                    setMaxPrice(MAX_PRICE);
                    setAvailability('all');
                    setRating('all');
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
