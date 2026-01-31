import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2, Loader, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiDelete, apiPost } from "@/lib/api";
import { Star } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#399746] to-[#A6CD3D] text-white py-8 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-7 h-7 fill-white" />
            <h1 className="text-3xl md:text-4xl font-bold">My Wishlist</h1>
          </div>
          <p className="text-green-50 text-sm md:text-base max-w-2xl">Save your favorite products and shop them anytime. Manage all your wishlist items in one place.</p>
        </div>
      </div>

      <section className="py-8 px-4">
        <div className="container mx-auto max-w-5xl">

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center min-h-96">
              <div className="relative w-12 h-12 mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-[#399746] to-[#A6CD3D] rounded-full animate-spin" style={{ mask: 'radial-gradient(circle, transparent 30%, black 70%)' }}></div>
              </div>
              <p className="text-gray-600 text-sm">Loading your wishlist...</p>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="text-center py-16">
              <p className="text-red-600 text-lg mb-4">Failed to load wishlist. Please try again later.</p>
              <Button onClick={() => window.location.reload()}>Reload</Button>
            </div>
          )}

          {/* Authentication Required */}
          {!isAuthenticated && (
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-16 text-center">
              <div className="mb-4 flex justify-center">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-5">
                  <Heart className="w-16 h-16 text-gray-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h3>
              <p className="text-gray-500 mb-6">Please sign in to view your wishlist</p>
              <Button onClick={() => navigate('/login')} className="bg-gradient-to-r from-[#399746] to-[#A6CD3D] text-white border-0 hover:shadow-lg transition-all px-8 py-3 text-base font-semibold">
                Sign In
              </Button>
            </div>
          )}

          {/* Wishlist Items */}
          {isAuthenticated && !isLoading && wishlistItems.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Your Saved Items</h2>
                  <p className="text-sm text-gray-500 mt-1">{wishlistItems.length} product{wishlistItems.length !== 1 ? 's' : ''} in your wishlist</p>
                </div>
                <div className="h-1 flex-1 ml-6 bg-gradient-to-r from-[#399746] to-[#A6CD3D] rounded-full"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {wishlistItems.map((item, index) => {
                  const product = item.product;
                  const discountPercent = product.discount_percentage > 0 ? product.discount_percentage : null;
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden hover:shadow-xl hover:border-[#399746] transition-all duration-300 group flex flex-col h-full"
                      style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both` }}
                    >
                      {/* Image Container */}
                      <div className="relative overflow-hidden h-52 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                          onClick={() => navigate(`/product-details/${product.id}`)}
                        />
                        {product.badge && (
                          <span className="absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full shadow-lg">
                            {product.badge}
                          </span>
                        )}
                        {discountPercent !== null && (
                          <span className="absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full shadow-lg">
                            -{Math.round(discountPercent)}%
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 flex flex-col flex-1">
                        {/* Category Badge */}
                        <div className="mb-3">
                          <span className="inline-block text-xs text-white bg-gradient-to-r from-[#399746] to-[#A6CD3D] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                            {product.category.name}
                          </span>
                        </div>

                        {/* Product Name */}
                        <h3
                          className="font-bold text-gray-900 line-clamp-2 mb-2 cursor-pointer hover:text-[#399746] transition-colors text-sm"
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
                                className={`w-3.5 h-3.5 ${i < Math.floor(product.avg_rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 font-medium">({product.total_reviews})</span>
                        </div>

                        {/* Stock Status */}
                        <div className="mb-3">
                          <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full inline-block ${
                            product.in_stock 
                              ? 'text-green-700 bg-green-100' 
                              : 'text-red-700 bg-red-100'
                          }`}>
                            {product.in_stock ? '✓ In Stock' : 'Out of Stock'}
                          </span>
                        </div>

                        {/* Pricing Box */}
                        <div className="mb-4 p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 mt-auto">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xl text-[#399746]">${parseFloat(product.price).toFixed(2)}</span>
                            {product.old_price && (
                              <span className="text-xs text-gray-500 line-through font-medium">${parseFloat(product.old_price).toFixed(2)}</span>
                            )}
                          </div>
                          {discountPercent !== null && (
                            <p className="text-xs text-green-700 font-bold">
                              Save ${(parseFloat(product.old_price!) - parseFloat(product.price)).toFixed(2)}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-[#399746] to-[#A6CD3D] text-white font-semibold hover:shadow-lg disabled:opacity-50 transition-all text-xs h-10 rounded-lg border-0"
                            onClick={() => handleAddToCart(product.id)}
                            disabled={addingIds.has(product.id) || !product.in_stock}
                          >
                            {addingIds.has(product.id) ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4" />
                                Add
                              </>
                            )}
                          </Button>

                          <Link to={`/product-details/${product.id}`} className="flex-1">
                            <Button
                              size="sm"
                              className="w-full border-2 border-[#399746] text-[#399746] text-xs h-10 font-semibold hover:bg-[#399746] hover:text-white transition-all rounded-lg"
                              variant="outline"
                            >
                              View
                            </Button>
                          </Link>

                          <button
                            onClick={() => handleRemoveFromWishlist(item.id)}
                            disabled={removingIds.has(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 border border-red-200 flex-shrink-0"
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
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-16 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-5">
                      <Heart className="w-16 h-16 text-gray-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Wishlist Empty</h3>
                  <p className="text-gray-500 mb-6 text-sm max-w-md mx-auto">No items in your wishlist yet. Start adding your favorites!</p>
                  <Link to="/products/circuit-breakers">
                    <Button className="bg-gradient-to-r from-[#399746] to-[#A6CD3D] border-0 text-white hover:shadow-lg transition-all px-8 py-3 text-base font-semibold">
                      Continue Shopping
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

      </section>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
