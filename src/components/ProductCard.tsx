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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');

        .pc { 
          font-family: 'Outfit', sans-serif; 
          position: relative; 
          border-radius: 10px; 
          overflow: hidden; 
          background: rgba(0,0,0,.03); 
          border: 1px solid rgba(0,0,0,.08); 
          display: flex; 
          flex-direction: column; 
          height: 100%; 
          transition: all .3s cubic-bezier(.25,.46,.45,.94);
        }
        .dark .pc {
          background: rgba(255,255,255,.04);
          border-color: rgba(255,255,255,.06);
        }
        .pc:hover { 
          background: rgba(0,0,0,.05); 
          border-color: rgba(168,214,62,.25); 
          box-shadow: 0 8px 32px rgba(168,214,62,.12);
        }
        .dark .pc:hover {
          background: rgba(255,255,255,.06);
          border-color: rgba(168,214,62,.2);
        }

        /* Image Container */
        .pc-img-wrap { 
          position: relative; 
          width: 100%; 
          aspect-ratio: 1; 
          overflow: hidden; 
          background: rgba(0,0,0,.05); 
          border-bottom: 1px solid rgba(0,0,0,.08);
        }
        .dark .pc-img-wrap {
          background: rgba(255,255,255,.02);
          border-bottom-color: rgba(255,255,255,.05);
        }
        .pc-img { 
          width: 100%; 
          height: 100%; 
          object-fit: cover; 
          object-position: center;
          transition: transform .4s cubic-bezier(.25,.46,.45,.94);
        }
        .pc:hover .pc-img { transform: scale(1.08); }

        /* Badges */
        .pc-badge { 
          position: absolute; 
          top: 8px; 
          left: 8px; 
          background: rgba(58,170,73,.9); 
          backdrop-filter: blur(8px);
          color: #f0f2ed; 
          font-size: .65rem; 
          font-weight: 800; 
          letter-spacing: .05em;
          padding: 3px 6px; 
          border-radius: 4px; 
          text-transform: uppercase;
          z-index: 10;
        }
        .pc-badge.hot { background: rgba(239,68,68,.9); }
        .pc-badge.new { background: rgba(59,130,246,.9); }

        .pc-discount { 
          position: absolute; 
          top: 8px; 
          right: 8px; 
          background: rgba(239,68,68,.9); 
          backdrop-filter: blur(8px);
          color: #f0f2ed; 
          font-size: .65rem; 
          font-weight: 800; 
          letter-spacing: .05em;
          padding: 3px 6px; 
          border-radius: 4px;
          z-index: 10;
        }

        /* Wishlist Button */
        .pc-wish-btn { 
          position: absolute; 
          top: 40px; 
          right: 8px; 
          width: 32px; 
          height: 32px; 
          border-radius: 6px; 
          background: rgba(0,0,0,.92); 
          border: 1px solid rgba(0,0,0,.2); 
          display: grid; 
          place-items: center; 
          cursor: pointer; 
          opacity: 0; 
          transform: translateX(8px);
          transition: all .2s;
          z-index: 20;
        }
        .dark .pc-wish-btn {
          background: rgba(255,255,255,.95);
          border-color: rgba(255,255,255,.2);
        }
        .pc:hover .pc-wish-btn { 
          opacity: 1; 
          transform: translateX(0);
        }
        .pc-wish-btn:hover { background: rgba(239,68,68,.1); border-color: rgba(239,68,68,.3); }
        .pc-wish-btn:disabled { opacity: .5; cursor: not-allowed; }
        .pc-wish-btn svg { color: rgba(0,0,0,.5); transition: all .2s; }
        .dark .pc-wish-btn svg { color: rgba(239,68,68,.5); }
        .pc-wish-btn.wishlisted svg { color: #f87171; fill: #f87171; }

        /* Content */
        .pc-content { 
          flex: 1; 
          padding: 1rem; 
          display: flex; 
          flex-direction: column; 
          gap: .5rem;
        }

        .pc-cat { 
          font-size: .65rem; 
          font-weight: 700; 
          letter-spacing: .1em; 
          text-transform: uppercase; 
          color: rgba(0,0,0,.55);
        }
        .dark .pc-cat { color: rgba(168,214,62,.7); }

        .pc-name { 
          font-size: .85rem; 
          font-weight: 500; 
          color: rgba(0,0,0,.8); 
          line-height: 1.35; 
          display: -webkit-box; 
          -webkit-line-clamp: 2; 
          -webkit-box-orient: vertical; 
          overflow: hidden; 
          cursor: pointer;
          transition: color .2s;
        }
        .dark .pc-name { color: rgba(240,242,237,.85); }
        .pc:hover .pc-name { color: #a8d63e; }

        /* Rating */
        .pc-rating { 
          display: flex; 
          align-items: center; 
          gap: .35rem; 
          font-size: .75rem;
        }
        .pc-stars { display: flex; gap: 2px; }
        .pc-stars svg { width: 12px; height: 12px; }
        .pc-rating-text { color: rgba(0,0,0,.5); font-weight: 500; }
        .dark .pc-rating-text { color: rgba(240,242,237,.5); }

        /* Price */
        .pc-price-section { 
          padding: .75rem 0; 
          border-top: 1px solid rgba(0,0,0,.08); 
          border-bottom: 1px solid rgba(0,0,0,.08);
        }
        .dark .pc-price-section {
          border-top-color: rgba(255,255,255,.05);
          border-bottom-color: rgba(255,255,255,.05);
        }
        .pc-prices { display: flex; align-items: baseline; gap: .5rem; margin-bottom: .3rem; }
        .pc-price-current { 
          font-size: .95rem; 
          font-weight: 800; 
          color: #a8d63e;
        }
        .pc-price-old { 
          font-size: .75rem; 
          color: rgba(0,0,0,.32); 
          text-decoration: line-through;
        }
        .dark .pc-price-old { color: rgba(240,242,237,.3); }
        .pc-save { 
          font-size: .7rem; 
          color: rgba(168,214,62,.8); 
          font-weight: 600;
        }

        /* Buttons */
        .pc-buttons { 
          display: flex; 
          gap: .5rem; 
          padding-top: .75rem;
        }
        .pc-btn { 
          flex: 1; 
          padding: .5rem; 
          border-radius: 6px; 
          border: 1px solid rgba(0,0,0,.12); 
          background: rgba(0,0,0,.06); 
          color: rgba(0,0,0,.7); 
          font-size: .75rem; 
          font-weight: 600; 
          cursor: pointer; 
          transition: all .2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: .3rem;
        }
        .dark .pc-btn {
          border-color: rgba(168,214,62,.2);
          background: rgba(168,214,62,.08);
          color: #a8d63e;
        }
        .pc-btn:hover:not(:disabled) { 
          background: rgba(0,0,0,.1); 
          box-shadow: 0 0 12px rgba(0,0,0,.1);
        }
        .dark .pc-btn:hover:not(:disabled) {
          background: rgba(168,214,62,.15);
          box-shadow: 0 0 12px rgba(168,214,62,.2);
        }
        .pc-btn.cart { 
          background: linear-gradient(135deg, #3aaa49, #a8d63e); 
          border-color: rgba(168,214,62,.5); 
          color: #0a0c0a;
        }
        .pc-btn.cart:hover:not(:disabled) { 
          box-shadow: 0 0 16px rgba(168,214,62,.4);
        }
        .pc-btn.wishlisted { 
          background: rgba(239,68,68,.12); 
          border-color: rgba(239,68,68,.3); 
          color: #f87171;
        }
        .pc-btn:disabled { opacity: .5; cursor: not-allowed; }
      `}</style>

      <div className="pc">
        {/* Image */}
        <div className="pc-img-wrap" onClick={handleProductClick}>
          <img src={product.image} alt={product.name} className="pc-img" loading="lazy" />
          
          {product.badge && (
            <span className={`pc-badge ${product.badge.toLowerCase()}`}>
              {product.badge}
            </span>
          )}
          
          {discountPercent !== null && (
            <span className="pc-discount">-{discountPercent}%</span>
          )}
          
          <button
            className={`pc-wish-btn ${isWishlisted ? 'wishlisted' : ''}`}
            onClick={(e) => { e.stopPropagation(); handleWishlistToggle(); }}
            disabled={addToWishlistMutation.isPending || removeFromWishlistMutation.isPending}
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            {addToWishlistMutation.isPending || removeFromWishlistMutation.isPending ? (
              <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Heart size={14} />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="pc-content">
          <div className="pc-cat">{product.category}</div>
          
          <h3 className="pc-name" onClick={handleProductClick}>
            {product.name}
          </h3>
          
          {/* Rating */}
          <div className="pc-rating">
            <div className="pc-stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} style={{ 
                  fill: i < Math.floor(product.rating) ? '#fbbf24' : 'none',
                  color: i < Math.floor(product.rating) ? '#fbbf24' : 'rgba(240,242,237,.2)',
                  strokeWidth: 1.5
                }} />
              ))}
            </div>
            <span className="pc-rating-text">({product.reviews ?? 0})</span>
          </div>

          {/* Price Section */}
          <div className="pc-price-section">
            <div className="pc-prices">
              <span className="pc-price-current">R {product.price.toFixed(2)}</span>
              {product.oldPrice && (
                <span className="pc-price-old">R {product.oldPrice.toFixed(2)}</span>
              )}
            </div>
            {discountPercent !== null && (
              <div className="pc-save">
                Save R {(product.oldPrice! - product.price).toFixed(2)}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pc-buttons">
            <button 
              className={`pc-btn ${isWishlisted ? 'wishlisted' : ''}`}
              onClick={handleWishlistToggle}
              disabled={addToWishlistMutation.isPending || removeFromWishlistMutation.isPending}
              title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              {addToWishlistMutation.isPending || removeFromWishlistMutation.isPending ? (
                <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Heart size={12} />
              )}
            </button>
            <button 
              className="pc-btn cart"
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              {isAdding ? (
                <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} />
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
    </>
  );
}
