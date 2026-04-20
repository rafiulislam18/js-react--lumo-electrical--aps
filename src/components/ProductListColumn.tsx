import { ArrowRight, ShoppingCart, Heart, Loader } from "lucide-react";
import { type Product } from "@/data/dummyData";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiPost, apiDelete } from "@/lib/api";
import { useState } from "react";

interface ProductListColumnProps {
  title: string;
  products: Product[];
  linkTo: string;
}

const calcDiscount = (oldPrice: number | undefined, price: number) => {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
};

export function ProductListColumn({ title, products, linkTo }: ProductListColumnProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [wishlistStates, setWishlistStates] = useState<{ [key: string]: { isWishlisted: boolean; id: number | null } }>({});

  const addToCartMutation = useMutation({
    mutationFn: async (productId: string) =>
      apiPost('/cart/add/', { product_id: productId, quantity: 1 }),
    onSuccess: (_, productId) => {
      toast({
        title: 'Added to cart',
        description: `${products.find(p => p.id === productId)?.name} added.`,
        className: "bg-green-700 text-white border-green-800",
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message, duration: 3000 });
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async (productId: string) =>
      apiPost('/wishlist/', { product_id: parseInt(productId) }),
    onSuccess: (data: any, productId: string) => {
      setWishlistStates(prev => ({ ...prev, [productId]: { isWishlisted: true, id: data.id } }));
      toast({
        title: 'Saved to wishlist',
        className: "bg-green-700 text-white border-green-800",
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error?.response?.data?.detail || error.message, duration: 3000 });
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      const id = wishlistStates[productId]?.id;
      if (!id) throw new Error('Not found');
      return apiDelete(`/wishlist/${id}/`);
    },
    onSuccess: (_, productId) => {
      setWishlistStates(prev => ({ ...prev, [productId]: { isWishlisted: false, id: null } }));
      toast({ title: 'Removed from wishlist', duration: 2000 });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message, duration: 3000 });
    },
  });

  const handleCart = (e: React.MouseEvent<HTMLButtonElement>, productId: string) => {
    e.stopPropagation();
    if (!isAuthenticated) { toast({ title: 'Login required', duration: 2500 }); navigate('/login'); return; }
    addToCartMutation.mutate(productId);
  };

  const handleWishlist = (e: React.MouseEvent<HTMLButtonElement>, productId: string) => {
    e.stopPropagation();
    if (!isAuthenticated) { toast({ title: 'Login required', duration: 2500 }); navigate('/login'); return; }
    wishlistStates[productId]?.isWishlisted
      ? removeFromWishlistMutation.mutate(productId)
      : addToWishlistMutation.mutate(productId);
  };

  return (
    <div className="flex flex-col h-full">
      {products.slice(0, 4).map((product) => {
        const discount = calcDiscount(product.oldPrice, product.price);
        const wishlisted = wishlistStates[product.id]?.isWishlisted;
        const cartPending = addToCartMutation.isPending;
        const wishPending = addToWishlistMutation.isPending || removeFromWishlistMutation.isPending;

        return (
          <div
            key={product.id}
            className={[
              "group flex items-center gap-[0.9rem] py-[0.85rem] px-2 -mx-2",
              "rounded-md cursor-pointer transition-colors duration-150",
              "bg-white/[0.02] dark:bg-white/[0.01]",
              "border-b border-black/[0.06] dark:border-white/[0.1]",
              "last:border-b-0",
              "hover:bg-[#a8d63e]/[0.08] dark:hover:bg-[#a8d63e]/[0.04]",
            ].join(' ')}
            onClick={() => navigate(`/product-details/${product.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && navigate(`/product-details/${product.id}`)}
          >
            {/* Image */}
            <div className="relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-black/[0.05] dark:bg-white/[0.04] border border-black/[0.1] dark:border-white/[0.06]">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-[400ms] ease-[cubic-bezier(.25,.46,.45,.94)] group-hover:scale-[1.08]"
                loading="lazy"
              />
              {discount !== null && (
                <span className="absolute top-[3px] left-[3px] bg-red-500 text-white text-[0.52rem] font-extrabold tracking-[0.04em] px-[5px] py-[2px] rounded-[3px] leading-[1.4]">
                  -{discount}%
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-[0.62rem] font-semibold tracking-[0.12em] uppercase text-black/[0.32] dark:text-[#f0f2ed]/[0.28] mb-[0.2rem]">
                {product.category}
              </div>
              <div className="font-outfit text-[0.83rem] font-medium text-black/[0.75] dark:text-[#f0f2ed]/[0.8] leading-[1.35] line-clamp-2 transition-colors duration-150 group-hover:text-[#a8d63e]">
                {product.name}
              </div>
              <div className="flex items-baseline gap-[0.45rem] mt-[0.35rem]">
                <span className="font-outfit font-bold text-[0.9rem] text-[#a8d63e]">
                  R {product.price.toFixed(2)}
                </span>
                {product.oldPrice && (
                  <span className="text-[0.72rem] text-black/[0.28] dark:text-[#f0f2ed]/[0.25] line-through">
                    R {product.oldPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-[0.35rem] flex-shrink-0">
              <button
                className={[
                  "w-[30px] h-[30px] rounded-[5px] border grid place-items-center cursor-pointer transition-all duration-150 active:scale-[0.92]",
                  wishlisted
                    ? "bg-red-500/[0.15] text-red-400 border-red-500/[0.3]"
                    : "bg-white dark:bg-white/[0.06] text-black/[0.7] dark:text-[#f0f2ed]/[0.7] border-black/[0.2] dark:border-white/[0.2] hover:bg-red-500/[0.12] hover:text-red-400 hover:border-red-500/[0.25] dark:hover:bg-red-500/[0.12] dark:hover:text-red-400 dark:hover:border-red-500/[0.25]",
                ].join(' ')}
                onClick={e => handleWishlist(e, product.id)}
                disabled={wishPending}
                title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {wishPending
                  ? <Loader size={12} className="animate-spin" />
                  : <Heart size={12} style={{ fill: wishlisted ? 'currentColor' : 'none' }} />
                }
              </button>
              <button
                className="w-[30px] h-[30px] rounded-[5px] grid place-items-center cursor-pointer transition-all duration-150 active:scale-[0.92] bg-gradient-to-br from-[#3aaa49] to-[#a8d63e] text-white dark:text-[#0a0c0a] hover:shadow-[0_0_14px_rgba(168,214,62,0.35)] disabled:opacity-45 disabled:cursor-not-allowed"
                onClick={e => handleCart(e, product.id)}
                disabled={cartPending}
                title="Add to cart"
              >
                {cartPending
                  ? <Loader size={12} className="animate-spin" />
                  : <ShoppingCart size={12} />
                }
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
