import { ShoppingCart, Heart, Star, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Product } from "@/data/dummyData";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { apiPost, apiDelete } from "@/lib/api";

interface ProductCardProps {
  product: Product;
}

// Helper function to calculate discount percentage
const calculateDiscountPercentage = (oldPrice: number | undefined, currentPrice: number): number | null => {
  if (!oldPrice || oldPrice <= currentPrice) return null;
  return Math.round(((oldPrice - currentPrice) / oldPrice) * 100);
};

export function ProductCard({ product }: ProductCardProps) {
  const discountPercent = calculateDiscountPercentage(product.oldPrice, product.price);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistId, setWishlistId] = useState<number | null>(null);

  const handleProductClick = () => {
    navigate(`/product-details/${product.id}`);
  };

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return apiPost('/cart/add/', {
        product_id: parseInt(product.id),
        quantity: 1,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Added to cart',
        description: `${product.name} has been added to your cart.`,
        className: "bg-green-600 text-white border-green-700",
        duration: 2000,
      });
      setIsAdding(false);
      // Invalidate the cart query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
        duration: 3000,
      });
      setIsAdding(false);
    },
  });

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to add items to your cart.',
        duration: 3000,
      });
      navigate('/login');
      return;
    }

    setIsAdding(true);
    addToCartMutation.mutate();
  };

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: async () => {
      return apiPost('/wishlist/', {
        product_id: parseInt(product.id),
      });
    },
    onSuccess: (data: any) => {
      setIsWishlisted(true);
      setWishlistId(data.id);
      toast({
        title: 'Added to wishlist',
        description: `${product.name} has been added to your wishlist.`,
        className: "bg-green-600 text-white border-green-700",
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail || error.message || 'Failed to add to wishlist';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
        duration: 3000,
      });
    },
  });

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async () => {
      if (!wishlistId) throw new Error('Wishlist item not found');
      return apiDelete(`/wishlist/${wishlistId}/`);
    },
    onSuccess: () => {
      setIsWishlisted(false);
      setWishlistId(null);
      toast({
        title: 'Removed from wishlist',
        description: `${product.name} has been removed from your wishlist.`,
        className: "bg-blue-600 text-white border-blue-700",
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
        duration: 3000,
      });
    },
  });

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to add items to your wishlist.',
        duration: 3000,
      });
      navigate('/login');
      return;
    }

    if (isWishlisted) {
      removeFromWishlistMutation.mutate();
    } else {
      addToWishlistMutation.mutate();
    }
  };

  return (
    <div className="group relative flex flex-col p-2 sm:p-3 bg-white rounded-lg border border-transparent hover:border-green-200 hover:shadow-lg hover:shadow-green-900/5 transition-smooth">
      {/* Top Left Badge */}
      {product.badge && (
        <div className={`absolute top-2 left-2 z-20 px-2 py-1 text-xs font-bold text-white rounded-md shadow-md backdrop-blur-sm
          ${product.badge === 'New' ? 'bg-blue-500' : ''}
          ${product.badge === 'Sale' ? 'bg-red-500' : ''}
          ${product.badge === 'Hot' ? 'bg-orange-500' : ''}
        `}>
          {product.badge}
        </div>
      )}

      {/* Discount Badge - Top Right */}
      {discountPercent !== null && (
        <div className="absolute top-2 right-2 z-20 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-md">
          -{discountPercent}%
        </div>
      )}

      {/* Wishlist Button - Hidden until hover */}
      <button 
        onClick={handleWishlistToggle}
        disabled={addToWishlistMutation.isPending || removeFromWishlistMutation.isPending}
        className="absolute top-12 right-2 z-10 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-smooth border border-gray-100 hover:border-red-200 disabled:opacity-50" 
        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
      >
        {addToWishlistMutation.isPending || removeFromWishlistMutation.isPending ? (
          <Loader className="w-4 h-4 text-gray-400 animate-spin" />
        ) : (
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
        )}
      </button>

      {/* Image Container */}
      <div className="relative w-full aspect-square mb-2 overflow-hidden rounded-lg bg-gray-50 border border-gray-100 cursor-pointer" onClick={handleProductClick}>
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-smooth ease-out"
        />
      </div>

      {/* Content */}
      <div className="w-full flex flex-col gap-1">
        <div className="text-xs text-gray-400 font-bold uppercase tracking-widest line-clamp-1">{product.category}</div>
        <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[2rem] group-hover:text-primary transition-smooth text-xs leading-tight cursor-pointer" onClick={handleProductClick}>
          {product.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-200'}`} 
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 font-medium">({product.reviews ?? 0})</span>
        </div>

        {/* Price Section */}
        <div className="flex flex-col gap-0.5 py-1.5 border-t border-b border-gray-100">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-sm text-primary">${product.price.toFixed(2)}</span>
            {product.oldPrice && (
              <span className="text-xs text-gray-400 line-through">${product.oldPrice.toFixed(2)}</span>
            )}
          </div>
          {discountPercent !== null && (
            <span className="text-xs text-green-600 font-semibold">
              Save ${(product.oldPrice! - product.price).toFixed(2)}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1.5 pt-1.5">
          <Button 
            size="sm"
            variant="outline"
            className={`flex-1 rounded-lg transition-smooth text-xs font-medium h-8 ${isWishlisted ? 'border-red-300 bg-red-50 text-red-500' : 'border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-500'}`}
            onClick={handleWishlistToggle}
            disabled={addToWishlistMutation.isPending || removeFromWishlistMutation.isPending}
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            {addToWishlistMutation.isPending || removeFromWishlistMutation.isPending ? (
              <Loader className="w-3 h-3 animate-spin" />
            ) : (
              <Heart className={`w-3 h-3 ${isWishlisted ? 'fill-current' : ''}`} />
            )}
          </Button>
          <Button 
            size="sm"
            className="flex-1 rounded-lg bg-primary-gradient shadow-lg shadow-green-600/20 hover:shadow-green-600/40 transition-smooth font-medium text-white h-8 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAddToCart}
            disabled={isAdding}
            title="Add to Cart"
          >
            <ShoppingCart className="w-3 h-3" />
            <span>{isAdding ? 'Adding...' : 'Add'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
