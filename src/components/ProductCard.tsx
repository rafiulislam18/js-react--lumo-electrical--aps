import { ShoppingCart, Heart, Star, Loader } from "lucide-react";
import { type Product } from "@/data/dummyData";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { apiPost, apiDelete } from "@/lib/api";

interface ProductCardProps {
  product: Product;
}

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

  const wishlistPending = addToWishlistMutation.isPending || removeFromWishlistMutation.isPending;

  return (
    <div className="group font-outfit relative rounded-[10px] overflow-hidden bg-white dark:bg-white/[.04] border border-black/[.08] dark:border-white/[.06] flex flex-col h-full transition-all duration-300 ease-[cubic-bezier(.25,.46,.45,.94)] hover:border-green-deep/20 dark:hover:border-lime-brand/20 hover:shadow-[0_8px_32px_rgba(168,214,62,.12)] hover:scale-[1.01]">
      {/* Image */}
      <div
        className="relative w-full aspect-square overflow-hidden bg-black/[.05] dark:bg-white/[.02] border-b border-black/[.08] dark:border-white/[.05] cursor-pointer"
        onClick={handleProductClick}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-[400ms] ease-[cubic-bezier(.25,.46,.45,.94)] group-hover:scale-[1.08]"
          loading="lazy"
        />

        {product.badge && (
          <span className={[
            "absolute top-2 left-2 z-10 text-[.65rem] font-extrabold tracking-[.05em] uppercase px-1.5 py-0.5 rounded text-[#f0f2ed] backdrop-blur-[8px]",
            product.badge.toLowerCase() === 'hot' ? "bg-red-500/90" :
            product.badge.toLowerCase() === 'new' ? "bg-blue-500/90" :
            "bg-green-brand/90"
          ].join(' ')}>
            {product.badge}
          </span>
        )}

        {discountPercent !== null && (
          <span className="absolute top-2 right-2 z-10 text-[.65rem] font-extrabold tracking-[.05em] bg-red-500/90 backdrop-blur-[8px] text-[#f0f2ed] px-1.5 py-0.5 rounded">
            -{discountPercent}%
          </span>
        )}

        <button
          className={[
            "absolute top-10 right-2 z-20 w-8 h-8 rounded-md grid place-items-center cursor-pointer",
            "opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200",
            "bg-white/[.95] border border-white/20",
            "hover:bg-red-500/10 hover:border-red-500/30",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            isWishlisted ? "[&>svg]:text-red-400 [&>svg]:fill-red-400" : "[&>svg]:text-red-500/50"
          ].join(' ')}
          onClick={(e) => { e.stopPropagation(); handleWishlistToggle(); }}
          disabled={wishlistPending}
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          {wishlistPending ? (
            <Loader size={14} className="animate-spin" />
          ) : (
            <Heart size={14} />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col gap-2">
        <div className="text-[.65rem] font-bold tracking-[.1em] uppercase text-green-deep/70 dark:text-lime-brand/70">
          {product.category}
        </div>

        <h3
          className="text-[.85rem] font-medium text-black/80 dark:text-[rgba(240,242,237,.85)] leading-[1.35] line-clamp-2 cursor-pointer transition-colors duration-200 group-hover:text-green-deep dark:group-hover:text-lime-brand"
          onClick={handleProductClick}
        >
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 text-[.75rem]">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                style={{
                  fill: i < Math.floor(product.rating) ? '#fbbf24' : 'none',
                  color: i < Math.floor(product.rating) ? '#fbbf24' : 'rgba(141, 141, 141, 0.51)',
                  strokeWidth: 1.5
                }}
              />
            ))}
          </div>
          <span className="text-black/50 dark:text-[rgba(240,242,237,.5)] font-medium">
            ({product.reviews ?? 0})
          </span>
        </div>

        {/* Price Section */}
        <div className="py-3 border-t border-b border-black/[.08] dark:border-white/[.05]">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-[.95rem] font-extrabold text-green-deep dark:text-lime-brand">
              R {product.price.toFixed(2)}
            </span>
            {product.oldPrice && (
              <span className="text-[.75rem] text-black/[.32] dark:text-[rgba(240,242,237,.3)] line-through">
                R {product.oldPrice.toFixed(2)}
              </span>
            )}
          </div>
          {discountPercent !== null && (
            <div className="text-[.7rem] text-green-deep/80 dark:text-lime-brand/80 font-semibold">
              Save R {(product.oldPrice! - product.price).toFixed(2)}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3">
          <button
            className={[
              "flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-md border text-[.75rem] font-semibold cursor-pointer transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              isWishlisted
                ? "bg-red-500/12 border-red-500/30 text-red-400"
                : "bg-green-deep/[.08] border-green-deep/20 text-green-deep dark:border-lime-brand/20 dark:bg-lime-brand/[.08] dark:text-lime-brand hover:bg-green-deep/15 dark:hover:bg-lime-brand/15 hover:shadow-[0_0_12px_rgba(57,151,70,.2)]  dark:hover:shadow-[0_0_12px_rgba(168,214,62,.2)]"
            ].join(' ')}
            onClick={handleWishlistToggle}
            disabled={wishlistPending}
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            {wishlistPending ? (
              <Loader size={12} className="animate-spin" />
            ) : (
              <Heart size={12} />
            )}
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-md border text-[.75rem] font-semibold cursor-pointer transition-all duration-200 bg-gradient-to-br from-green-brand to-lime-brand border-lime-brand/50 text-white dark:text-dark-surface hover:shadow-[0_0_16px_rgba(168,214,62,.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAddToCart}
            disabled={isAdding}
          >
            {isAdding ? (
              <Loader size={12} className="animate-spin" />
            ) : (
              <>
                <ShoppingCart size={12} />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
