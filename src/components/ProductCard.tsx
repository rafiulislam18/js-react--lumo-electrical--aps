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
    <div className="group font-outfit relative flex flex-col h-full bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[14px] overflow-hidden transition duration-300 ease-[cubic-bezier(.25,.46,.45,.94)] hover:-translate-y-[3px] hover:border-[rgba(57,151,70,.3)] hover:shadow-[0_12px_34px_rgba(22,25,26,.1)] dark:hover:border-[rgba(168,214,62,.25)] dark:hover:shadow-[0_12px_34px_rgba(0,0,0,.55)]">
      {/* Image */}
      <div
        className="relative w-full aspect-square overflow-hidden bg-[#f7f6f1] dark:bg-[#171c16] border-b border-[rgba(22,25,26,.07)] dark:border-white/[.06] cursor-pointer"
        onClick={handleProductClick}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-[400ms] ease-[cubic-bezier(.25,.46,.45,.94)] group-hover:scale-[1.07]"
          loading="lazy"
        />

        {product.badge && (
          <span className={[
            "absolute top-2 left-2 z-10 text-[.62rem] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-[7px] backdrop-blur-[8px]",
            product.badge.toLowerCase() === 'new'
              ? "bg-gradient-to-br from-[#399746] to-[#a8d63e] text-white"
              : "bg-[#e08a1e] text-white"
          ].join(' ')}>
            {product.badge}
          </span>
        )}

        {discountPercent !== null && (
          <span className="absolute top-2 right-2 z-10 text-[.62rem] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-[7px] bg-[#e08a1e] text-white backdrop-blur-[8px]">
            -{discountPercent}%
          </span>
        )}

        <button
          className={[
            "absolute z-20 w-8 h-8 rounded-md grid place-items-center cursor-pointer right-2",
            discountPercent !== null ? "top-9" : "top-2",
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
      <div className="flex-1 p-3.5 flex flex-col gap-1.5">
        <div className="text-[.62rem] font-bold tracking-[.1em] uppercase text-[#2f8b3d]/75 dark:text-[#a8d63e]/75">
          {product.category}
        </div>

        <h3
          className="text-[.84rem] font-medium text-[#16191a]/85 dark:text-[rgba(241,243,234,.85)] leading-[1.35] line-clamp-2 cursor-pointer transition-colors duration-200 group-hover:text-[#2f8b3d] dark:group-hover:text-[#a8d63e]"
          onClick={handleProductClick}
        >
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 text-[.72rem]">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                style={{
                  fill: i < Math.floor(product.rating) ? '#f5a524' : 'none',
                  color: i < Math.floor(product.rating) ? '#f5a524' : 'rgba(141, 141, 141, 0.51)',
                  strokeWidth: 1.5
                }}
              />
            ))}
          </div>
          <span className="text-[#16191a]/42 dark:text-[rgba(241,243,234,.42)] font-medium">
            ({product.reviews ?? 0})
          </span>
        </div>

        {/* Price Section */}
        <div className="py-2.5 my-0.5 border-t border-b border-[rgba(22,25,26,.07)] dark:border-white/[.06]">
          <div className="flex items-baseline gap-2">
            <span className="text-[.95rem] font-extrabold text-[#2f8b3d] dark:text-[#a8d63e]">
              R {product.price.toFixed(2)}
            </span>
            {product.oldPrice && (
              <span className="text-[.74rem] text-[#16191a]/42 dark:text-[rgba(241,243,234,.42)] line-through">
                R {product.oldPrice.toFixed(2)}
              </span>
            )}
          </div>
          {discountPercent !== null && (
            <div className="text-[.7rem] mt-0.5 text-[#2f8b3d]/85 dark:text-[#a8d63e]/85 font-semibold">
              Save R {(product.oldPrice! - product.price).toFixed(2)}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            className={[
              "flex items-center justify-center gap-1 py-2 px-2.5 rounded-[10px] text-[.74rem] font-semibold cursor-pointer transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              isWishlisted
                ? "bg-red-500/12 text-red-400"
                : "bg-[rgba(57,151,70,.09)] dark:bg-[rgba(168,214,62,.1)] text-[#2f8b3d] dark:text-[#a8d63e] hover:-translate-y-px hover:shadow-[0_10px_30px_rgba(57,151,70,.3)]"
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
            className="flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-[10px] text-[.74rem] font-semibold cursor-pointer transition-all duration-200 bg-gradient-to-r from-[#399746] to-[#a8d63e] text-white dark:text-[#0a0c0a] hover:-translate-y-px hover:shadow-[0_10px_30px_rgba(57,151,70,.3)] disabled:opacity-50 disabled:cursor-not-allowed"
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
