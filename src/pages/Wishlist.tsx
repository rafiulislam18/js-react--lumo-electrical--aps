import { Heart, Loader, ArrowRight } from "lucide-react";
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
    <div className="font-outfit bg-[#f6f5f0]/[.86] dark:bg-dark-surface min-h-screen flex flex-col">
      <section className="flex-1 py-14 px-4 sm:px-8">
        <div className="max-w-[1280px] mx-auto">
          {/* Header block */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 text-[.68rem] font-bold tracking-[.2em] uppercase text-[#2f8b3d] dark:text-[#a8d63e] mb-3 before:content-[''] before:w-[1.4rem] before:h-0.5 before:bg-[#2f8b3d] dark:before:bg-[#a8d63e] before:rounded-sm before:shrink-0">
              Your account
            </div>
            <h1 className="font-bebas leading-[.9] text-[clamp(2.4rem,6vw,4rem)] text-[#16191a] dark:text-[#f0f2ed]">My Wishlist</h1>
            <p className="mt-3 text-[.95rem] leading-relaxed max-w-[640px] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
              Save your favorite products and shop them anytime. Manage all your wishlist items in one place.
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative w-12 h-12 mb-3 rounded-full border-2 border-[#a8d63e] border-t-[#2f8b3d] animate-spin" />
              <p className="text-[.9rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">Loading your wishlist...</p>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[24px] p-12 text-center">
              <p className="text-red-600 dark:text-red-400 text-lg mb-6">Failed to load wishlist. Please try again later.</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#399746] to-[#a8d63e] text-white dark:text-[#0a0c0a] font-bold text-[.9rem] px-6 py-3 rounded-full transition-transform duration-200 hover:-translate-y-0.5"
              >
                Reload
              </button>
            </div>
          )}

          {/* Authentication Required */}
          {!isAuthenticated && (
            <div className="bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[24px] p-12 text-center">
              <div className="mb-6 flex justify-center">
                <div className="bg-[#f7f6f1] dark:bg-white/[.06] rounded-full p-5">
                  <Heart className="w-16 h-16 text-[rgba(22,25,26,.25)] dark:text-white/[.2]" />
                </div>
              </div>
              <h3 className="font-bebas text-2xl tracking-[.08em] text-[#16191a] dark:text-[#f0f2ed] mb-2">Sign In Required</h3>
              <p className="text-[.9rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] mb-8 max-w-md mx-auto">Please sign in to view your wishlist.</p>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#399746] to-[#a8d63e] text-white dark:text-[#0a0c0a] font-bold text-[.9rem] px-6 py-3 rounded-full transition-transform duration-200 hover:-translate-y-0.5"
              >
                Sign In
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Wishlist Items */}
          {isAuthenticated && !isLoading && wishlistItems.length > 0 && (
            <>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-[1.1rem] font-bold text-[#16191a] dark:text-[#f0f2ed]">
                  Your Saved Items ({wishlistItems.length})
                </h2>
                <div className="flex-1 h-px bg-[rgba(22,25,26,.1)] dark:bg-white/10" />
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] max-md:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] max-sm:grid-cols-2 max-[360px]:grid-cols-1 gap-6 max-md:gap-5 max-sm:gap-4 max-[360px]:gap-3">
                {wishlistItems.map((item) => (
                  <div key={item.id}>
                    <WishlistProductCard wishlistId={item.id} product={item.product} />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Empty State */}
          {isAuthenticated && !isLoading && wishlistItems.length === 0 && (
            <div className="bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[24px] p-12 text-center">
              <div className="mb-6 flex justify-center">
                <div className="bg-[#f7f6f1] dark:bg-white/[.06] rounded-full p-5">
                  <Heart className="w-16 h-16 text-[rgba(22,25,26,.25)] dark:text-white/[.2]" />
                </div>
              </div>
              <h3 className="font-bebas text-2xl tracking-[.08em] text-[#16191a] dark:text-[#f0f2ed] mb-2">Your Wishlist Is Empty</h3>
              <p className="text-[.9rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] mb-8 max-w-md mx-auto">No items in your wishlist yet. Browse our products and save your favorites to find them here.</p>
              <Link to="/products">
                <button className="inline-flex items-center gap-2 bg-gradient-to-r from-[#399746] to-[#a8d63e] text-white dark:text-[#0a0c0a] font-bold text-[.9rem] px-6 py-3 rounded-full transition-transform duration-200 hover:-translate-y-0.5">
                  Browse Products
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
