import { useState } from "react";
import { Heart, ShoppingCart, Trash2, Loader, ArrowRight, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiDelete, apiPost } from "@/lib/api";

interface WishlistProduct {
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

interface WishlistItem {
  id: number;
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  product: WishlistProduct;
  created_at: string;
}

interface WishlistResponse extends Array<WishlistItem> { }

// Helper to get full image URL
const getImageUrl = (imagePath: string | undefined) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:8000';
  return `${baseUrl}${imagePath}`;
};

export default function Wishlist() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());
  const [addingIds, setAddingIds] = useState<Set<number>>(new Set());

  // Fetch wishlist items
  const { data: wishlistItems = [], isLoading, isError } = useQuery<WishlistResponse>({
    queryKey: ['wishlist'],
    queryFn: async () => {
      return apiGet<WishlistResponse>('/wishlist/');
    },
    enabled: isAuthenticated,
  });

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (wishlistId: number) => {
      return apiDelete(`/wishlist/${wishlistId}/`);
    },
    onSuccess: (_data, wishlistId) => {
      setRemovingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(wishlistId);
        return newSet;
      });
      toast({
        title: 'Removed from wishlist',
        description: 'Item has been removed from your wishlist.',
        className: "bg-blue-600 text-white border-blue-700",
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error: Error) => {
      setRemovingIds(prev => new Set(prev));
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
        duration: 3000,
      });
    },
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (productId: number) => {
      return apiPost('/cart/add/', {
        product_id: productId,
        quantity: 1,
      });
    },
    onSuccess: (_data, productId) => {
      setAddingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
      const product = wishlistItems.find((item: WishlistItem) => item.product.id === productId);
      toast({
        title: 'Added to cart',
        description: `${product?.product.name} has been added to your cart.`,
        className: "bg-green-600 text-white border-green-700",
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: Error) => {
      setAddingIds(prev => new Set(prev));
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
        duration: 3000,
      });
    },
  });

  const handleRemoveFromWishlist = (wishlistId: number) => {
    setRemovingIds(prev => new Set(prev).add(wishlistId));
    removeFromWishlistMutation.mutate(wishlistId);
  };

  const handleAddToCart = (productId: number) => {
    setAddingIds(prev => new Set(prev).add(productId));
    addToCartMutation.mutate(productId);
  };

  return (
    <div className="font-outfit bg-white dark:bg-dark-surface min-h-screen">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-green-brand to-lime-brand text-dark-surface py-8 px-4">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-7 h-7 fill-current" />
            <h1 className="font-bebas text-[2.5rem] tracking-[.08em]">My Wishlist</h1>
          </div>
          <p className="text-[.95rem] opacity-90 max-w-2xl">Save your favorite products and shop them anytime. Manage all your wishlist items in one place.</p>
        </div>
      </div>

      <section className="py-12 px-4">
        <div className="max-w-[1280px] mx-auto">

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative w-12 h-12 mb-3 rounded-full border-2 border-lime-brand border-t-green-brand animate-spin" />
              <p className="text-[.9rem] text-black/60 dark:text-[rgba(240,242,237,.6)]">Loading your wishlist...</p>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="text-center py-16">
              <p className="text-red-600 text-lg mb-4">Failed to load wishlist. Please try again later.</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-br from-green-brand to-lime-brand text-dark-surface font-semibold py-2 px-6 rounded-lg transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)]"
              >
                Reload
              </button>
            </div>
          )}

          {/* Authentication Required */}
          {!isAuthenticated && (
            <div className="bg-white dark:bg-black/[.02] rounded-xl border border-black/[.08] dark:border-white/[.06] p-12 text-center">
              <div className="mb-6 flex justify-center">
                <div className="bg-black/[.05] dark:bg-white/[.05] rounded-full p-5">
                  <Heart className="w-16 h-16 text-black/30 dark:text-white/[.2]" />
                </div>
              </div>
              <h3 className="font-bebas text-2xl tracking-[.08em] text-black/85 dark:text-[#f0f2ed] mb-2">Sign In Required</h3>
              <p className="text-[.9rem] text-black/60 dark:text-[rgba(240,242,237,.6)] mb-8">Please sign in to view your wishlist</p>
              <button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-br from-green-brand to-lime-brand text-dark-surface font-semibold py-3 px-8 rounded-lg transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)]"
              >
                Sign In
              </button>
            </div>
          )}

          {/* Wishlist Items */}
          {isAuthenticated && !isLoading && wishlistItems.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-8">
                <div>
                  <h2 className="text-xl font-bold text-black/85 dark:text-[#f0f2ed]">Your Saved Items</h2>
                  <p className="text-[.85rem] text-black/60 dark:text-[rgba(240,242,237,.6)] mt-1">{wishlistItems.length} product{wishlistItems.length !== 1 ? 's' : ''} in your wishlist</p>
                </div>
                <div className="flex-1 h-px bg-lime-brand/30" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistItems.map((item) => {
                  const product = item.product;
                  const discountPercent = product.discount_percentage > 0 ? product.discount_percentage : null;
                  return (
                    <div
                      key={item.id}
                      className="group bg-white dark:bg-black/[.02] rounded-lg border border-black/[.08] dark:border-white/[.06] overflow-hidden transition-all duration-300 hover:border-lime-brand/25 dark:hover:border-lime-brand/20 hover:shadow-[0_8px_32px_rgba(168,214,62,.12)] flex flex-col h-full"
                    >
                      {/* Image Container */}
                      <div className="relative overflow-hidden h-52 bg-black/[.05] dark:bg-white/[.05] flex items-center justify-center">
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-[1.08] transition-transform duration-300 cursor-pointer"
                          onClick={() => navigate(`/product-details/${product.id}`)}
                        />
                        {product.badge && (
                          <span className="absolute top-3 right-3 px-3 py-1.5 bg-red-500 text-white text-[.75rem] font-bold rounded-full shadow-lg">
                            {product.badge}
                          </span>
                        )}
                        {discountPercent !== null && (
                          <span className="absolute top-3 left-3 px-3 py-1.5 bg-green-brand text-dark-surface text-[.75rem] font-bold rounded-full shadow-lg">
                            -{Math.round(discountPercent)}%
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 flex flex-col flex-1">
                        {/* Category Badge */}
                        <div className="mb-3">
                          <span className="inline-block text-[.7rem] text-dark-surface bg-gradient-to-br from-green-brand to-lime-brand px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                            {product.category.name}
                          </span>
                        </div>

                        {/* Product Name */}
                        <h3
                          className="font-semibold text-black/85 dark:text-[#f0f2ed] line-clamp-2 mb-2 cursor-pointer hover:text-lime-brand dark:hover:text-lime-brand transition-colors text-[.9rem]"
                          onClick={() => navigate(`/product-details/${product.id}`)}
                        >
                          {product.name}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${i < Math.floor(product.avg_rating) ? 'fill-yellow-400 text-yellow-400' : 'text-black/20 dark:text-white/[.15]'}`}
                              />
                            ))}
                          </div>
                          <span className="text-[.75rem] text-black/60 dark:text-[rgba(240,242,237,.6)] font-medium">({product.total_reviews})</span>
                        </div>

                        {/* Stock Status */}
                        <div className="mb-3">
                          <span className={`text-[.75rem] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full inline-block ${
                            product.in_stock
                              ? 'bg-green-brand/[.1] dark:bg-green-brand/[.15] text-green-700 dark:text-green-300'
                              : 'bg-red-500/[.1] dark:bg-red-500/[.15] text-red-700 dark:text-red-300'
                          }`}>
                            {product.in_stock ? '✓ In Stock' : 'Out of Stock'}
                          </span>
                        </div>

                        {/* Pricing Box */}
                        <div className="mb-4 p-3 bg-green-brand/[.05] dark:bg-green-brand/[.08] rounded-lg border border-green-brand/[.1] dark:border-green-brand/[.15] mt-auto">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-lg text-green-700 dark:text-green-300">${parseFloat(product.price).toFixed(2)}</span>
                            {product.old_price && (
                              <span className="text-[.75rem] text-black/50 dark:text-[rgba(240,242,237,.5)] line-through font-medium">${parseFloat(product.old_price).toFixed(2)}</span>
                            )}
                          </div>
                          {discountPercent !== null && (
                            <p className="text-[.75rem] text-green-700 dark:text-green-300 font-bold">
                              Save ${(parseFloat(product.old_price!) - parseFloat(product.price)).toFixed(2)}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddToCart(product.id)}
                            disabled={addingIds.has(product.id) || !product.in_stock}
                            className="flex-1 bg-gradient-to-br from-green-brand to-lime-brand text-dark-surface font-semibold text-[.8rem] py-2 rounded-lg transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)] disabled:opacity-50 flex items-center justify-center gap-1"
                          >
                            {addingIds.has(product.id) ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4" />
                                <span className="hidden sm:inline">Add</span>
                              </>
                            )}
                          </button>

                          <Link to={`/product-details/${product.id}`} className="flex-1">
                            <button className="w-full border border-lime-brand/30 dark:border-lime-brand/20 text-lime-brand dark:text-lime-brand text-[.8rem] py-2 rounded-lg font-semibold transition-all duration-200 hover:bg-lime-brand/[.05] dark:hover:bg-lime-brand/[.08]">
                              View
                            </button>
                          </Link>

                          <button
                            onClick={() => handleRemoveFromWishlist(item.id)}
                            disabled={removingIds.has(item.id)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/[.2] rounded-lg transition-all disabled:opacity-50 border border-red-200/30 dark:border-red-900/[.3] flex-shrink-0"
                            title="Remove from wishlist"
                          >
                            {removingIds.has(item.id) ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Empty State */}
              {isAuthenticated && !isLoading && wishlistItems.length === 0 && (
                <div className="bg-white dark:bg-black/[.02] rounded-xl border border-black/[.08] dark:border-white/[.06] p-12 text-center">
                  <div className="mb-6 flex justify-center">
                    <div className="bg-black/[.05] dark:bg-white/[.05] rounded-full p-5">
                      <Heart className="w-16 h-16 text-black/30 dark:text-white/[.2]" />
                    </div>
                  </div>
                  <h3 className="font-bebas text-2xl tracking-[.08em] text-black/85 dark:text-[#f0f2ed] mb-2">Wishlist Empty</h3>
                  <p className="text-[.9rem] text-black/60 dark:text-[rgba(240,242,237,.6)] mb-8 max-w-md mx-auto">No items in your wishlist yet. Start adding your favorites!</p>
                  <Link to="/products/circuit-breakers">
                    <button className="bg-gradient-to-br from-green-brand to-lime-brand text-dark-surface font-semibold py-3 px-8 rounded-lg transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)] inline-flex items-center gap-2">
                      Continue Shopping
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

      </section>
    </div>
  );
}
