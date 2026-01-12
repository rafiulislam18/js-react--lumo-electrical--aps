import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2, Loader } from "lucide-react";
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

interface WishlistResponse extends Array<WishlistItem> {}

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
    onSuccess: (data, wishlistId) => {
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
    onSuccess: (data, productId) => {
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
    <div className="min-h-screen bg-gray-50/30 flex flex-col font-sans">
      <section className="flex-1 py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-12 animate-in fade-in slide-in-from-top-10 duration-700">
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
              My Wishlist
            </h1>
            <p className="text-gray-500">{wishlistItems.length} items saved</p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center min-h-96">
              <Loader className="w-8 h-8 text-primary animate-spin" />
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
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sign In Required</h3>
              <p className="text-gray-500 mb-6">Please sign in to view your wishlist</p>
              <Button onClick={() => navigate('/login')} className="bg-primary-gradient text-white">
                Sign In
              </Button>
            </div>
          )}

          {/* Wishlist Items */}
          {isAuthenticated && !isLoading && wishlistItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in" style={{animationDelay: '0.1s'}}>
              {wishlistItems.map((item, index) => {
                const product = item.product;
                const discountPercent = product.discount_percentage > 0 ? product.discount_percentage : null;
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow animate-in fade-in slide-in-from-bottom-5"
                    style={{animationDelay: `${0.15 + (index * 0.03)}s`}}
                  >
                    {/* Image Container */}
                    <div className="relative overflow-hidden h-48">
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 cursor-pointer"
                        onClick={() => navigate(`/product-details/${product.id}`)}
                      />
                      {product.badge && (
                        <span className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                          {product.badge}
                        </span>
                      )}
                      {discountPercent !== null && (
                        <span className="absolute top-4 left-4 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                          Save {Math.round(discountPercent)}%
                        </span>
                      )}
                      <button
                        onClick={() => handleRemoveFromWishlist(item.id)}
                        disabled={removingIds.has(item.id)}
                        className="absolute bottom-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {removingIds.has(item.id) ? (
                          <Loader className="w-5 h-5 text-gray-600 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5 text-red-500" />
                        )}
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        {product.category.name}
                      </p>
                      <h3 
                        className="font-bold text-gray-900 line-clamp-2 mb-2 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => navigate(`/product-details/${product.id}`)}
                      >
                        {product.name}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < Math.floor(product.avg_rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">({product.total_reviews})</span>
                      </div>

                      {/* Pricing */}
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-lg text-primary">${parseFloat(product.price).toFixed(2)}</span>
                          {product.old_price && (
                            <span className="text-xs text-gray-400 line-through">${parseFloat(product.old_price).toFixed(2)}</span>
                          )}
                        </div>
                        {discountPercent !== null && (
                          <p className="text-xs text-green-600 font-semibold mt-1">
                            Save ${(parseFloat(product.old_price!) - parseFloat(product.price)).toFixed(2)}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-primary-gradient text-white font-semibold hover:shadow-lg disabled:opacity-50 transition-smooth"
                          onClick={() => handleAddToCart(product.id)}
                          disabled={addingIds.has(product.id) || !product.in_stock}
                        >
                          {addingIds.has(product.id) ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4" />
                              Add to Cart
                            </>
                          )}
                        </Button>

                        <Link to={`/product-details/${product.id}`} className="flex-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full border-gray-200"
                          >
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {isAuthenticated && !isLoading && wishlistItems.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Wishlist Empty</h3>
              <p className="text-gray-500 mb-6">No items in your wishlist yet. Start adding your favorites!</p>
              <Link to="/products/circuit-breakers">
                <Button className="bg-primary-gradient border-0 text-white hover:opacity-90 transition-smooth">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
