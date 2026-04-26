import { ShoppingCart, Trash2, Star, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { apiPost, apiDelete } from "@/lib/api";

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
  category: {
    id: number;
    name: string;
    slug: string;
  };
}

interface WishlistProductCardProps {
  wishlistId: number;
  product: WishlistProduct;
}

const calculateDiscountPercentage = (oldPrice: number | undefined, currentPrice: number): number | null => {
  if (!oldPrice || oldPrice <= currentPrice) return null;
  return Math.round(((oldPrice - currentPrice) / oldPrice) * 100);
};

const getImageUrl = (imagePath: string | undefined) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:8000';
  return `${baseUrl}${imagePath}`;
};

export function WishlistProductCard({ wishlistId, product }: WishlistProductCardProps) {
  const discountPercent = calculateDiscountPercentage(
    product.old_price ? parseFloat(product.old_price) : undefined,
    parseFloat(product.price)
  );
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleProductClick = () => {
    navigate(`/product-details/${product.id}`);
  };

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return apiPost('/cart/add/', {
        product_id: product.id,
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

  const removeFromWishlistMutation = useMutation({
    mutationFn: async () => {
      return apiDelete(`/wishlist/${wishlistId}/`);
    },
    onSuccess: () => {
      toast({
        title: 'Removed from wishlist',
        description: `${product.name} has been removed from your wishlist.`,
        className: "bg-blue-600 text-white border-blue-700",
        duration: 2000,
      });
      setIsRemoving(false);
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
        duration: 3000,
      });
      setIsRemoving(false);
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

  const handleRemoveFromWishlist = () => {
    setIsRemoving(true);
    removeFromWishlistMutation.mutate();
  };

  return (
    <div className="group font-outfit relative rounded-[10px] overflow-hidden bg-white dark:bg-white/[.04] border border-black/[.08] dark:border-white/[.06] flex flex-col h-full transition-all duration-300 ease-[cubic-bezier(.25,.46,.45,.94)] hover:border-green-deep/20 dark:hover:border-lime-brand/20 hover:shadow-[0_8px_32px_rgba(168,214,62,.12)] hover:scale-[1.01]">
      {/* Image */}
      <div
        className="relative w-full aspect-square overflow-hidden bg-black/[.05] dark:bg-white/[.02] border-b border-black/[.08] dark:border-white/[.05] cursor-pointer"
        onClick={handleProductClick}
      >
        <img
          src={getImageUrl(product.image)}
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
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col gap-2">
        <div className="text-[.65rem] font-bold tracking-[.1em] uppercase text-green-deep/70 dark:text-lime-brand/70">
          {product.category.name}
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
                  fill: i < Math.floor(product.avg_rating) ? '#fbbf24' : 'none',
                  color: i < Math.floor(product.avg_rating) ? '#fbbf24' : 'rgba(141, 141, 141, 0.51)',
                  strokeWidth: 1.5
                }}
              />
            ))}
          </div>
          <span className="text-black/50 dark:text-[rgba(240,242,237,.5)] font-medium">
            ({product.total_reviews})
          </span>
        </div>

        {/* Price Section */}
        <div className="py-3 border-t border-b border-black/[.08] dark:border-white/[.05]">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-[.95rem] font-extrabold text-green-deep dark:text-lime-brand">
              R {parseFloat(product.price).toFixed(2)}
            </span>
            {product.old_price && (
              <span className="text-[.75rem] text-black/[.32] dark:text-[rgba(240,242,237,.3)] line-through">
                R {parseFloat(product.old_price).toFixed(2)}
              </span>
            )}
          </div>
          {discountPercent !== null && (
            <div className="text-[.7rem] text-green-deep/80 dark:text-lime-brand/80 font-semibold">
              Save R {(parseFloat(product.old_price!) - parseFloat(product.price)).toFixed(2)}
            </div>
          )}
        </div>

        {/* Stock Status */}
        <div className="mb-2">
          <span className={`text-[.75rem] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full inline-block ${
            product.in_stock
              ? 'bg-green-brand/[.1] dark:bg-green-brand/[.15] text-green-700 dark:text-green-300'
              : 'bg-red-500/[.1] dark:bg-red-500/[.15] text-red-700 dark:text-red-300'
          }`}>
            {product.in_stock ? '✓ In Stock' : 'Out of Stock'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3">
          <button
            className={[
              "flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-md border text-[.75rem] font-semibold cursor-pointer transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "bg-gradient-to-br from-green-brand to-lime-brand border-lime-brand/50 text-white dark:text-dark-surface hover:shadow-[0_0_16px_rgba(168,214,62,.4)]"
            ].join(' ')}
            onClick={handleAddToCart}
            disabled={isAdding}
            title="Add to Cart"
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
          <button
            className="flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-md border text-[.75rem] font-semibold cursor-pointer transition-all duration-200 bg-red-500/12 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleRemoveFromWishlist}
            disabled={isRemoving}
            title="Remove from Wishlist"
          >
            {isRemoving ? (
              <Loader size={12} className="animate-spin" />
            ) : (
              <>
                <Trash2 size={12} />
                <span>Remove</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
