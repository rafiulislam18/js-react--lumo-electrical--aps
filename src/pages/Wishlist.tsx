import { Heart, Loader, ArrowRight, Package } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiGet } from "@/lib/api";
import { WishlistProductCard } from "@/components/WishlistProductCard";

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

  // Fetch wishlist items
  const { data: wishlistItems = [], isLoading, isError } = useQuery<WishlistResponse>({
    queryKey: ['wishlist'],
    queryFn: async () => {
      return apiGet<WishlistResponse>('/wishlist/');
    },
    enabled: isAuthenticated,
  });

  return (
    <div className="font-outfit bg-white dark:bg-dark-surface min-h-screen flex flex-col">
      {/* Header Section with Background Image */}
      <section className="relative bg-cover bg-center bg-no-repeat before:absolute before:inset-0 before:bg-lime-brand/[.02]">
        <img
          src="https://images.pexels.com/photos/3621796/pexels-photo-3621796.jpeg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover animate-[zoomOut_14s_ease-out_forwards]"
        />
        {/* Light mode overlay */}
        <div className="absolute inset-0 dark:hidden"
          style={{ background: 'linear-gradient(to right, rgba(20,28,20,.85) 0%, rgba(20,28,20,.55) 55%, rgba(20,28,20,.3) 100%), linear-gradient(to top, rgba(20,28,20,.7) 0%, transparent 50%)' }}
        />
        {/* Dark mode overlay */}
        <div className="absolute inset-0 hidden dark:block"
          style={{ background: 'linear-gradient(to right, rgba(4,8,4,.92) 0%, rgba(4,8,4,.6) 55%, rgba(4,8,4,.25) 100%), linear-gradient(to top, rgba(4,8,4,.8) 0%, transparent 50%)' }}
        />

        {/* Header Content */}
        <div className="relative z-10 px-8 py-12 max-sm:px-4 max-sm:py-8">
          <div className="max-w-[1280px] mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-lime-brand/20 rounded-lg p-2">
                <Heart className="w-8 h-8 text-lime-brand fill-lime-brand" />
              </div>
              <h1 className="font-bebas text-[clamp(2rem,5vw,3rem)] tracking-[.08em] text-[#f0f2ed] max-sm:text-[2rem]">My Wishlist</h1>
            </div>
            <p className="text-[.95rem] max-sm:text-[.85rem] leading-[1.8] text-[rgba(240,242,237,.7)] max-w-2xl">
              Save your favorite products and shop them anytime. Manage all your wishlist items in one place.
            </p>
          </div>
        </div>
      </section>

      <section className="flex-1 py-12 px-4">
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
                className="bg-gradient-to-br from-green-brand to-lime-brand text-white dark:text-dark-surface font-semibold py-2 px-6 rounded-lg transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)]"
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
                className="bg-gradient-to-br from-green-brand to-lime-brand text-white dark:text-dark-surface font-semibold py-3 px-8 rounded-lg transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)]"
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
              <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] max-md:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] max-sm:grid-cols-2 max-[360px]:grid-cols-1 gap-6 max-md:gap-5 max-sm:gap-4 max-[360px]:gap-3">
                {wishlistItems.map((item) => (
                  <div key={item.id}>
                    <WishlistProductCard wishlistId={item.id} product={item.product} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {isAuthenticated && !isLoading && wishlistItems.length === 0 && (
            <div className="bg-white dark:bg-black/[.02] rounded-xl border border-black/[.08] dark:border-white/[.06] p-12 text-center">
              <div className="mb-6 flex justify-center">
                <div className="bg-black/[.05] dark:bg-white/[.05] rounded-full p-5">
                  <Package className="w-16 h-16 text-black/30 dark:text-white/[.2]" />
                </div>
              </div>
              <h3 className="font-bebas text-2xl tracking-[.08em] text-black/85 dark:text-[#f0f2ed] mb-2">Wishlist Empty</h3>
              <p className="text-[.9rem] text-black/60 dark:text-[rgba(240,242,237,.6)] mb-8 max-w-md mx-auto">No items in your wishlist yet. Start adding your favorites!</p>
              <Link to="/products/circuit-breakers">
                <button className="bg-gradient-to-br from-green-brand to-lime-brand text-white dark:text-dark-surface font-semibold py-3 px-8 rounded-lg transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)] inline-flex items-center gap-2">
                  Continue Shopping
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          )}
        </div>

      </section>
    </div>
  );
}
