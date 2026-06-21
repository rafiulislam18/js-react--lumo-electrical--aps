import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, Heart, Star, ChevronLeft, AlertCircle, CheckCircle, Loader, MessageCircle } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost, apiDelete } from "@/lib/api";

interface Category {
  id: number;
  name: string;
  slug: string;
  breadcrumb: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
}

interface Review {
  id: number;
  rating: string;
  comment: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  reviewed_by: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  admin_reply: string | null;
  admin_replied_at: string | null;
}

interface Question {
  id: number;
  question: string;
  answer: string | null;
  is_answered: boolean;
  asked_by: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
  answered_at: string | null;
}

interface ProductData {
  id: number;
  name: string;
  description: string;
  price: string;
  old_price: string | null;
  image: string;
  avg_rating: number;
  total_reviews: number;
  badge: string;
  in_stock: boolean;
  discount_percentage: number;
  created_at: string;
  updated_at: string;
  category: Category;
  specifications: Record<string, any>;
  reviews: Review[];
  questions: Question[];
  related_products: Array<{
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
  }>;
}

const getImageUrl = (imagePath: string | undefined) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:8000';
  return `${baseUrl}${imagePath}`;
};

const calculateDiscountPercentage = (oldPrice: string | null, currentPrice: string): number | null => {
  if (!oldPrice) return null;
  const old = parseFloat(oldPrice);
  const current = parseFloat(currentPrice);
  if (old <= current) return null;
  return Math.round(((old - current) / old) * 100);
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistId, setWishlistId] = useState<number | null>(null);
  const [selectedReviewRating, setSelectedReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  const { data: product, isLoading: productLoading, isError: productError } = useQuery<ProductData>({
    queryKey: ['product', id],
    queryFn: async () => {
      return apiGet<ProductData>(`/products/${id}/`);
    },
    enabled: !!id,
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!product) throw new Error('Product not loaded');
      return apiPost('/cart/add/', {
        product_id: product.id,
        quantity: quantity,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Added to cart',
        description: `${product?.name} has been added to your cart.`,
        className: "bg-green-600 text-white border-green-700",
        duration: 2000,
      });
      setQuantity(1);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
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

  const createReviewMutation = useMutation({
    mutationFn: async () => {
      if (!product) throw new Error('Product not loaded');
      if (selectedReviewRating === 0) throw new Error('Please select a rating');

      return apiPost(`/reviews/create/${product.id}/`, {
        rating: selectedReviewRating,
        comment: reviewComment.trim() || null,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Review submitted',
        description: 'Thank you for your review!',
        className: "bg-green-600 text-white border-green-700",
        duration: 2000,
      });
      setReviewComment('');
      setSelectedReviewRating(0);
      setShowReviewForm(false);
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail || error?.response?.data?.non_field_errors?.[0] || error.message || 'Failed to submit review';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
        duration: 3000,
      });
    },
  });

  const createQuestionMutation = useMutation({
    mutationFn: async () => {
      if (!product) throw new Error('Product not loaded');
      if (questionText.trim().length === 0) throw new Error('Please enter a question');

      return apiPost(`/questions/create/${product.id}/`, {
        question: questionText.trim(),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Question submitted',
        description: 'Thank you for your question!',
        className: "bg-green-600 text-white border-green-700",
        duration: 2000,
      });
      setQuestionText('');
      setShowQuestionForm(false);
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail || error?.response?.data?.non_field_errors?.[0] || error.message || 'Failed to submit question';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
        duration: 3000,
      });
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
    addToCartMutation.mutate();
  };

  const addToWishlistMutation = useMutation({
    mutationFn: async () => {
      if (!product) throw new Error('Product not loaded');
      return apiPost('/wishlist/', {
        product_id: product.id,
      });
    },
    onSuccess: (data: any) => {
      setIsWishlisted(true);
      setWishlistId(data.id);
      toast({
        title: 'Added to wishlist',
        description: `${product?.name} has been added to your wishlist.`,
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
        description: `${product?.name} has been removed from your wishlist.`,
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
  const discountPercent = product ? calculateDiscountPercentage(product.old_price, product.price) : null;
  const tabsTriggerCls = "relative rounded-none bg-transparent py-[.95rem] px-2 text-[.8rem] sm:text-[.85rem] font-semibold text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] transition-colors data-[state=active]:text-[#2f8b3d] dark:data-[state=active]:text-[#a8d63e] data-[state=active]:shadow-none data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:-bottom-px data-[state=active]:after:h-0.5 data-[state=active]:after:bg-[#2f8b3d] dark:data-[state=active]:after:bg-[#a8d63e]";

  return (
    <div className="font-outfit bg-[#f6f5f0]/[.86] dark:bg-[#0a0c0a] text-[rgba(22,25,26,.7)] dark:text-[rgba(241,243,234,.7)] min-h-screen flex flex-col">
      {/* Breadcrumb */}
      <section className="border-b border-[rgba(22,25,26,.1)] dark:border-white/10 px-8 py-4 max-sm:px-4 max-sm:py-3">
        <div className="max-w-[1280px] mx-auto flex items-center gap-2 text-[.8rem] max-sm:text-[.72rem] flex-wrap">
          <a href="/" className="text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] no-underline transition-colors duration-200 hover:text-[#2f8b3d] dark:hover:text-[#a8d63e]">
            Home
          </a>
          <span className="text-[rgba(22,25,26,.3)] dark:text-[rgba(241,243,234,.25)]">/</span>
          {product?.category?.breadcrumb && product.category.breadcrumb.length > 0 ? (
            <>
              {product.category.breadcrumb.map((cat) => (
                <div key={cat.id} className="flex items-center gap-2">
                  <a href={`/${cat.slug}`} className="text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] no-underline transition-colors duration-200 hover:text-[#2f8b3d] dark:hover:text-[#a8d63e]">
                    {cat.name}
                  </a>
                  <span className="text-[rgba(22,25,26,.3)] dark:text-[rgba(241,243,234,.25)]">/</span>
                </div>
              ))}
            </>
          ) : null}
          <span className="text-[#2f8b3d] dark:text-[#a8d63e] font-semibold">{product?.name || 'Loading...'}</span>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 max-w-[1280px] mx-auto w-full px-8 py-8 max-sm:px-4 max-sm:py-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] hover:text-[#2f8b3d] dark:hover:text-[#a8d63e] transition-colors duration-200 mb-7 text-[.85rem] font-medium"
        >
          <ChevronLeft size={18} />
          Back
        </button>

        {/* Loading State */}
        {productLoading && (
          <div className="flex items-center justify-center min-h-96">
            <div className="relative w-12 h-12 rounded-full border-2 border-[#a8d63e] border-t-[#2f8b3d] animate-spin" />
          </div>
        )}

        {/* Error State */}
        {productError && (
          <div className="bg-white dark:bg-[#141914] border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[24px] p-12 text-center">
            <h1 className="font-bebas text-3xl tracking-[.08em] text-[#16191a] dark:text-[#f0f2ed] mb-3">Product Not Found</h1>
            <p className="text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] mb-8">The product you're looking for doesn't exist.</p>
            <button onClick={() => navigate("/products")} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#399746] to-[#a8d63e] text-white dark:text-[#0a0c0a] font-bold rounded-full transition-transform duration-200 hover:-translate-y-0.5">
              Go Back to Products
            </button>
          </div>
        )}

        {/* Product Section */}
        {product && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 mb-12">
            {/* Main Content */}
            <div className="space-y-6">
              {/* Product Hero */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.2fr] gap-6 sm:gap-8 bg-white dark:bg-[#141914] rounded-[24px] border border-[rgba(22,25,26,.1)] dark:border-white/10 p-6 sm:p-8">
                {/* Image */}
                <div className="flex items-start justify-center">
                  <div className="relative w-full max-w-[360px] mx-auto aspect-square overflow-hidden rounded-[14px] bg-[#f7f6f1] dark:bg-[#171c16] border border-[rgba(22,25,26,.07)] dark:border-white/[.06]">
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {discountPercent !== null && (
                      <span className="absolute top-4 right-4 z-10 text-[.62rem] font-extrabold uppercase tracking-wide bg-[#e08a1e] text-white px-2 py-0.5 rounded-[7px]">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-4">
                  {/* Category & Badge */}
                  <div className="flex items-center gap-3">
                    <span className="text-[.66rem] font-bold tracking-[.12em] uppercase text-[#2f8b3d] dark:text-[#a8d63e]">
                      {product.category.name}
                    </span>
                    {product.badge && (
                      <span className={[
                        "text-[.62rem] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-[7px] text-white",
                        product.badge === 'New'
                          ? "bg-gradient-to-br from-[#399746] to-[#a8d63e]"
                          : "bg-[#e08a1e]"
                      ].join(' ')}>
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="font-bebas text-[clamp(1.9rem,4vw,2.7rem)] tracking-[.03em] text-[#16191a] dark:text-[#f0f2ed] leading-[1]">
                    {product.name}
                  </h1>

                  {/* Rating */}
                  <div className="flex items-center gap-3">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          style={{
                            fill: i < Math.floor(product.avg_rating) ? '#f5a524' : 'none',
                            color: i < Math.floor(product.avg_rating) ? '#f5a524' : 'rgba(0,0,0,.2)',
                            strokeWidth: 1.5
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[.85rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
                      ({product.total_reviews} reviews)
                    </span>
                  </div>

                  {/* Stock & Code */}
                  <div className="grid grid-cols-2 gap-3 p-4 bg-[#f7f6f1] dark:bg-[#171c16] rounded-[14px] border border-[rgba(22,25,26,.07)] dark:border-white/[.06]">
                    <div>
                      <p className="text-[.7rem] text-[rgba(22,25,26,.45)] dark:text-[rgba(241,243,234,.45)] font-medium mb-1">Stock Status</p>
                      <div className="flex items-center gap-1.5">
                        {product.in_stock ? (
                          <CheckCircle size={14} className="text-[#2f8b3d] dark:text-[#a8d63e]" />
                        ) : (
                          <AlertCircle size={14} className="text-[#e0492b]" />
                        )}
                        <span className={[
                          "text-[.8rem] font-semibold",
                          product.in_stock ? "text-[#2f8b3d] dark:text-[#a8d63e]" : "text-[#e0492b]"
                        ].join(' ')}>
                          {product.in_stock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[.7rem] text-[rgba(22,25,26,.45)] dark:text-[rgba(241,243,234,.45)] font-medium mb-1">Product ID</p>
                      <p className="text-[.8rem] font-semibold text-[#16191a] dark:text-[#f0f2ed]">{product.id}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="py-4 border-y border-[rgba(22,25,26,.1)] dark:border-white/10">
                    <div className="flex items-baseline gap-3">
                      <span className="font-bebas text-[clamp(2.4rem,5vw,3rem)] leading-[1] text-[#2f8b3d] dark:text-[#a8d63e]">
                        R {parseFloat(product.price).toFixed(2)}
                      </span>
                      {product.old_price && (
                        <span className="text-[.85rem] text-[rgba(22,25,26,.4)] dark:text-[rgba(241,243,234,.4)] line-through">
                          R {parseFloat(product.old_price).toFixed(2)}
                        </span>
                      )}
                    </div>
                    {discountPercent !== null && (
                      <p className="text-[.8rem] text-[#2f8b3d] dark:text-[#a8d63e] font-semibold mt-1.5">
                        Save R {(parseFloat(product.old_price!) - parseFloat(product.price)).toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* Quantity & Actions */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[.8rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] font-medium block mb-2">Quantity</label>
                      <div className="flex items-center border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-full w-fit overflow-hidden">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-4 py-2 text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] hover:text-[#2f8b3d] dark:hover:text-[#a8d63e] transition-colors duration-150"
                        >
                          −
                        </button>
                        <span className="px-5 py-2 font-semibold min-w-[3rem] text-center text-[#16191a] dark:text-[#f0f2ed]">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-4 py-2 text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] hover:text-[#2f8b3d] dark:hover:text-[#a8d63e] transition-colors duration-150"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        className={[
                          "flex items-center justify-center gap-2 px-4 py-3 rounded-full border font-semibold text-[.85rem] cursor-pointer transition-all duration-200",
                          isWishlisted
                ? "bg-[#e0492b]/[.12] border-[#e0492b]/30 text-[#e0492b]"
                : "border-[rgba(22,25,26,.1)] dark:border-white/10 text-[rgba(22,25,26,.7)] dark:text-[rgba(241,243,234,.7)] hover:border-[#2f8b3d] hover:text-[#2f8b3d] dark:hover:border-[#a8d63e] dark:hover:text-[#a8d63e]"
                        ].join(' ')}
                        onClick={handleWishlistToggle}
                        disabled={wishlistPending}
                        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                      >
                        {wishlistPending ? (
                          <Loader size={16} className="animate-spin" />
                        ) : (
                          <Heart size={16} style={{ fill: isWishlisted ? 'currentColor' : 'none' }} />
                        )}
                      </button>
                      <button
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-[#399746] to-[#a8d63e] text-white dark:text-[#0a0c0a] font-bold text-[.85rem] cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        onClick={handleAddToCart}
                        disabled={!product.in_stock || addToCartMutation.isPending}
                      >
                        <ShoppingCart size={16} />
                        {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white dark:bg-[#141914] rounded-[24px] border border-[rgba(22,25,26,.1)] dark:border-white/10 overflow-hidden">
                <Tabs defaultValue="specifications" className="w-full">
                  <TabsList className="w-full rounded-none border-b border-[rgba(22,25,26,.1)] dark:border-white/10 bg-[#f3f1ea] dark:bg-[#10150f] h-auto p-0 px-2 grid grid-cols-4">
                    <TabsTrigger value="specifications" className={tabsTriggerCls}>
                      <span className="hidden sm:inline">Specifications</span>
                      <span className="sm:hidden">Specs</span>
                    </TabsTrigger>
                    <TabsTrigger value="description" className={tabsTriggerCls}>
                      Description
                    </TabsTrigger>
                    <TabsTrigger value="questions" className={tabsTriggerCls}>
                      Q&A
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className={tabsTriggerCls}>
                      Reviews
                    </TabsTrigger>
                  </TabsList>

                  {/* Specifications */}
                  <TabsContent value="specifications" className="p-6 sm:p-8 space-y-4">
                    {product?.specifications && Object.keys(product.specifications).length > 0 ? (
                      <div className="grid sm:grid-cols-2 gap-3">
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key} className="p-4 bg-[#f7f6f1] dark:bg-[#171c16] rounded-[14px] border border-[rgba(22,25,26,.07)] dark:border-white/[.06]">
                            <p className="text-[.72rem] text-[rgba(22,25,26,.45)] dark:text-[rgba(241,243,234,.45)] font-medium mb-1">{key}</p>
                            <p className="text-[.86rem] font-semibold text-[#16191a] dark:text-[#f0f2ed]">{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-[#f7f6f1] dark:bg-[#171c16] rounded-[14px] border border-[rgba(22,25,26,.07)] dark:border-white/[.06]">
                        <p className="text-[.85rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] font-medium">No specifications available</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Description */}
                  <TabsContent value="description" className="p-6 sm:p-8 space-y-4">
                    {product?.description ? (
                      <p className="text-[.92rem] leading-[1.8] text-[rgba(22,25,26,.7)] dark:text-[rgba(241,243,234,.7)]">
                        {product.description}
                      </p>
                    ) : (
                      <div className="p-4 bg-[#f7f6f1] dark:bg-[#171c16] rounded-[14px] border border-[rgba(22,25,26,.07)] dark:border-white/[.06]">
                        <p className="text-[.85rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">No description available for this product.</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Questions */}
                  <TabsContent value="questions" className="p-6 sm:p-8 space-y-5">
                    {!showQuestionForm ? (
                      <button
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#399746] to-[#a8d63e] text-white dark:text-[#0a0c0a] font-bold text-[.85rem] rounded-full cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
                        onClick={() => {
                          if (!isAuthenticated) {
                            toast({
                              title: 'Authentication required',
                              description: 'Please log in to ask a question.',
                              duration: 3000,
                            });
                            navigate('/login');
                            return;
                          }
                          setShowQuestionForm(true);
                        }}
                      >
                        <MessageCircle size={16} />
                        Ask a Question
                      </button>
                    ) : (
                      <div className="p-6 border border-[rgba(22,25,26,.07)] dark:border-white/[.06] rounded-[14px] bg-[#f7f6f1] dark:bg-[#171c16] space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-[#16191a] dark:text-[#f0f2ed]">Ask a Question</h3>
                          <button
                            onClick={() => setShowQuestionForm(false)}
                            className="text-[.8rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] hover:text-[#16191a] dark:hover:text-[#f0f2ed] transition-colors duration-150"
                          >
                            Cancel
                          </button>
                        </div>
                        <div>
                          <label className="block text-[.8rem] font-medium text-[rgba(22,25,26,.7)] dark:text-[rgba(241,243,234,.7)] mb-2">Question</label>
                          <textarea
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            placeholder="Ask your question about this product..."
                            className="w-full px-4 py-3 border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[14px] bg-white dark:bg-[#0a0c0a] text-[#16191a] dark:text-[#f0f2ed] text-[.85rem] focus:outline-none focus:border-[rgba(57,151,70,.4)] focus:bg-[rgba(57,151,70,.04)] dark:focus:bg-[rgba(168,214,62,.05)] resize-none"
                            rows={4}
                          />
                          <p className="text-[.75rem] text-[rgba(22,25,26,.45)] dark:text-[rgba(241,243,234,.45)] mt-1">{questionText.length} characters</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-[#399746] to-[#a8d63e] text-white dark:text-[#0a0c0a] font-bold text-[.8rem] rounded-full cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                            disabled={createQuestionMutation.isPending || questionText.trim().length === 0}
                            onClick={() => createQuestionMutation.mutate()}
                          >
                            {createQuestionMutation.isPending ? (
                              <>
                                <Loader size={14} className="animate-spin inline mr-1" />
                                Submitting...
                              </>
                            ) : (
                              'Submit Question'
                            )}
                          </button>
                          <button
                            className="px-4 py-2 border border-[rgba(22,25,26,.1)] dark:border-white/10 text-[rgba(22,25,26,.7)] dark:text-[rgba(241,243,234,.7)] font-medium text-[.8rem] rounded-full cursor-pointer transition-colors duration-200 hover:border-[#2f8b3d] hover:text-[#2f8b3d] dark:hover:border-[#a8d63e] dark:hover:text-[#a8d63e]"
                            onClick={() => {
                              setShowQuestionForm(false);
                              setQuestionText('');
                            }}
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {product?.questions && product.questions.length > 0 ? (
                        product.questions.map(question => (
                          <div
                            key={question.id}
                            className={[
                              "p-4 rounded-[14px] border",
                              question.is_answered
                                ? "bg-[rgba(57,151,70,.09)] dark:bg-[rgba(168,214,62,.1)] border-[rgba(57,151,70,.18)]"
                                : "bg-[#f7f6f1] dark:bg-[#171c16] border-[rgba(22,25,26,.07)] dark:border-white/[.06]"
                            ].join(' ')}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <p className="font-semibold text-[.86rem] text-[#16191a] dark:text-[#f0f2ed]">{question.question}</p>
                              <span className="text-[.7rem] text-[rgba(22,25,26,.45)] dark:text-[rgba(241,243,234,.45)] whitespace-nowrap">
                                {new Date(question.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-[.76rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] mb-2">
                              Asked by <span className="font-medium">{question.asked_by.first_name + " " + question.asked_by.last_name || question.asked_by.username}</span>
                            </p>
                            {question.is_answered && question.answer ? (
                              <div className="bg-white dark:bg-[#0a0c0a] border border-[rgba(22,25,26,.07)] dark:border-white/[.06] rounded-[10px] px-3 py-2">
                                <p className="text-[.82rem] text-[rgba(22,25,26,.7)] dark:text-[rgba(241,243,234,.7)]">
                                  <span className="font-semibold text-[#2f8b3d] dark:text-[#a8d63e]">Answer: </span>
                                  {question.answer}
                                </p>
                              </div>
                            ) : (
                              <p className="text-[.76rem] font-semibold text-[#e08a1e]">Awaiting Answer</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-4 bg-[#f7f6f1] dark:bg-[#171c16] rounded-[14px] border border-[rgba(22,25,26,.07)] dark:border-white/[.06] text-center">
                          <p className="text-[.85rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">No questions yet. Be the first to ask!</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Reviews */}
                  <TabsContent value="reviews" className="p-6 sm:p-8 space-y-5">
                    {/* Rating Summary */}
                    <div className="p-6 bg-[rgba(57,151,70,.09)] dark:bg-[rgba(168,214,62,.1)] rounded-[14px] border border-[rgba(57,151,70,.18)]">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="font-bebas text-[2.6rem] leading-none text-[#2f8b3d] dark:text-[#a8d63e]">{product?.avg_rating || 0}</span>
                            <span className="text-[.85rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">/5</span>
                          </div>
                          <div className="flex gap-0.5 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                style={{
                                  fill: i < Math.floor(product?.avg_rating || 0) ? '#f5a524' : 'none',
                                  color: i < Math.floor(product?.avg_rating || 0) ? '#f5a524' : 'rgba(0,0,0,.2)',
                                  strokeWidth: 1.5
                                }}
                              />
                            ))}
                          </div>
                          <p className="text-[.85rem] font-semibold text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">{product?.total_reviews || 0} reviews</p>
                        </div>
                      </div>
                    </div>

                    {!showReviewForm ? (
                      <button
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#399746] to-[#a8d63e] text-white dark:text-[#0a0c0a] font-bold text-[.85rem] rounded-full cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
                        onClick={() => {
                          if (!isAuthenticated) {
                            toast({
                              title: 'Authentication required',
                              description: 'Please log in to submit a review.',
                              duration: 3000,
                            });
                            navigate('/login');
                            return;
                          }
                          setShowReviewForm(true);
                        }}
                      >
                        + Add Review
                      </button>
                    ) : (
                      <div className="p-6 border border-[rgba(22,25,26,.07)] dark:border-white/[.06] rounded-[14px] bg-[#f7f6f1] dark:bg-[#171c16] space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-[#16191a] dark:text-[#f0f2ed]">Write Your Review</h3>
                          <button
                            onClick={() => setShowReviewForm(false)}
                            className="text-[.8rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] hover:text-[#16191a] dark:hover:text-[#f0f2ed] transition-colors duration-150"
                          >
                            Cancel
                          </button>
                        </div>

                        {/* Rating Selection */}
                        <div>
                          <label className="block text-[.8rem] font-medium text-[rgba(22,25,26,.7)] dark:text-[rgba(241,243,234,.7)] mb-3">Rating</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                onClick={() => setSelectedReviewRating(rating)}
                                className="transition-transform hover:scale-110"
                              >
                                <Star
                                  size={28}
                                  style={{
                                    fill: selectedReviewRating >= rating ? '#f5a524' : 'none',
                                    color: selectedReviewRating >= rating ? '#f5a524' : 'rgba(0,0,0,.2)',
                                    strokeWidth: 1.5,
                                    cursor: 'pointer'
                                  }}
                                />
                              </button>
                            ))}
                          </div>
                          {selectedReviewRating > 0 && (
                            <p className="text-[.75rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] mt-2">You selected {selectedReviewRating} star{selectedReviewRating !== 1 ? 's' : ''}</p>
                          )}
                        </div>

                        {/* Comment */}
                        <div>
                          <label className="block text-[.8rem] font-medium text-[rgba(22,25,26,.7)] dark:text-[rgba(241,243,234,.7)] mb-2">Comment (optional)</label>
                          <textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Share your experience with this product..."
                            className="w-full px-4 py-3 border border-[rgba(22,25,26,.1)] dark:border-white/10 rounded-[14px] bg-white dark:bg-[#0a0c0a] text-[#16191a] dark:text-[#f0f2ed] text-[.85rem] focus:outline-none focus:border-[rgba(57,151,70,.4)] focus:bg-[rgba(57,151,70,.04)] dark:focus:bg-[rgba(168,214,62,.05)] resize-none"
                            rows={4}
                          />
                          <p className="text-[.75rem] text-[rgba(22,25,26,.45)] dark:text-[rgba(241,243,234,.45)] mt-1">{reviewComment.length} characters</p>
                        </div>

                        {/* Submit */}
                        <div className="flex gap-2">
                          <button
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-[#399746] to-[#a8d63e] text-white dark:text-[#0a0c0a] font-bold text-[.8rem] rounded-full cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                            disabled={createReviewMutation.isPending || selectedReviewRating === 0}
                            onClick={() => createReviewMutation.mutate()}
                          >
                            {createReviewMutation.isPending ? (
                              <>
                                <Loader size={14} className="animate-spin inline mr-1" />
                                Submitting...
                              </>
                            ) : (
                              'Submit Review'
                            )}
                          </button>
                          <button
                            className="px-4 py-2 border border-[rgba(22,25,26,.1)] dark:border-white/10 text-[rgba(22,25,26,.7)] dark:text-[rgba(241,243,234,.7)] font-medium text-[.8rem] rounded-full cursor-pointer transition-colors duration-200 hover:border-[#2f8b3d] hover:text-[#2f8b3d] dark:hover:border-[#a8d63e] dark:hover:text-[#a8d63e]"
                            onClick={() => {
                              setShowReviewForm(false);
                              setReviewComment('');
                              setSelectedReviewRating(0);
                            }}
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Reviews List */}
                    <div className="space-y-3">
                      {product?.reviews && product.reviews.length > 0 ? (
                        product.reviews.map(review => (
                          <div key={review.id} className="p-4 border border-[rgba(22,25,26,.07)] dark:border-white/[.06] rounded-[14px] bg-[#f7f6f1] dark:bg-[#171c16]">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <p className="font-semibold text-[.86rem] text-[#16191a] dark:text-[#f0f2ed] mb-1">{review.comment}</p>
                                <div className="flex gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={12}
                                      style={{
                                        fill: i < parseFloat(review.rating) ? '#f5a524' : 'none',
                                        color: i < parseFloat(review.rating) ? '#f5a524' : 'rgba(0,0,0,.2)',
                                        strokeWidth: 1.5
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                              <span className="text-[.7rem] text-[rgba(22,25,26,.45)] dark:text-[rgba(241,243,234,.45)] whitespace-nowrap">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-[.76rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">
                              By <span className="font-semibold">{review.reviewed_by.first_name + " " + review.reviewed_by.last_name || review.reviewed_by.username}</span>
                              {review.is_verified_purchase && <span className="ml-2 text-[#2f8b3d] dark:text-[#a8d63e] font-medium">✓ Verified Purchase</span>}
                            </p>
                            {review.admin_reply && (
                              <div className="mt-3 bg-[rgba(57,151,70,.09)] dark:bg-[rgba(168,214,62,.1)] border border-[rgba(57,151,70,.18)] rounded-[10px] px-3 py-2">
                                <p className="text-[.74rem] font-semibold text-[#2f8b3d] dark:text-[#a8d63e] mb-0.5">Lumo Electrical</p>
                                <p className="text-[.82rem] text-[rgba(22,25,26,.7)] dark:text-[rgba(241,243,234,.7)]">{review.admin_reply}</p>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-4 bg-[#f7f6f1] dark:bg-[#171c16] rounded-[14px] border border-[rgba(22,25,26,.07)] dark:border-white/[.06] text-center">
                          <p className="text-[.85rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)]">No reviews yet. Be the first to review!</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Sidebar - Related Products */}
            {product?.related_products && product.related_products.length > 0 && (
              <aside className="hidden lg:block space-y-4">
                <h3 className="text-[.95rem] font-bold text-[#16191a] dark:text-[#f0f2ed]">Related Items</h3>
                <div className="space-y-2">
                  {product.related_products.slice(0, 5).map(relatedProduct => {
                    const relatedDiscount = calculateDiscountPercentage(relatedProduct.old_price, relatedProduct.price);
                    return (
                      <button
                        key={relatedProduct.id}
                        onClick={() => navigate(`/product-details/${relatedProduct.id}`)}
                        className="w-full text-left group flex gap-2.5 p-3 bg-white dark:bg-[#141914] rounded-[14px] border border-[rgba(22,25,26,.1)] dark:border-white/10 hover:border-[#2f8b3d]/40 dark:hover:border-[#a8d63e]/30 hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <div className="relative w-16 h-16 flex-shrink-0 rounded-[10px] overflow-hidden bg-[#f7f6f1] dark:bg-[#171c16] border border-[rgba(22,25,26,.07)] dark:border-white/[.06]">
                          <img
                            src={getImageUrl(relatedProduct.image)}
                            alt={relatedProduct.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {relatedDiscount !== null && (
                            <span className="absolute top-1 left-1 bg-[#e08a1e] text-white text-[.5rem] font-extrabold uppercase tracking-wide px-1 py-0.5 rounded-[6px]">-{relatedDiscount}%</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[.74rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] font-semibold line-clamp-2 mb-1">{relatedProduct.name}</p>
                          <div className="flex items-baseline gap-1">
                            <span className="font-bold text-[.82rem] text-[#2f8b3d] dark:text-[#a8d63e]">R {parseFloat(relatedProduct.price).toFixed(2)}</span>
                            {relatedProduct.old_price && (
                              <span className="text-[.65rem] text-[rgba(22,25,26,.4)] dark:text-[rgba(241,243,234,.4)] line-through">R {parseFloat(relatedProduct.old_price).toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </aside>
            )}
          </div>
        )}

        {/* Related Items Mobile (below tabs) */}
        {product?.related_products && product.related_products.length > 0 && (
          <div className="block lg:hidden mt-12">
            <h3 className="text-[.95rem] font-bold text-[#16191a] dark:text-[#f0f2ed] mb-4">Related Items</h3>
            <div className="space-y-2">
              {product.related_products.slice(0, 5).map(relatedProduct => {
                const relatedDiscount = calculateDiscountPercentage(relatedProduct.old_price, relatedProduct.price);
                return (
                  <button
                    key={relatedProduct.id}
                    onClick={() => navigate(`/product-details/${relatedProduct.id}`)}
                    className="w-full text-left group flex gap-2.5 p-3 bg-white dark:bg-[#141914] rounded-[14px] border border-[rgba(22,25,26,.1)] dark:border-white/10 hover:border-[#2f8b3d]/40 dark:hover:border-[#a8d63e]/30 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-[10px] overflow-hidden bg-[#f7f6f1] dark:bg-[#171c16] border border-[rgba(22,25,26,.07)] dark:border-white/[.06]">
                      <img
                        src={getImageUrl(relatedProduct.image)}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {relatedDiscount !== null && (
                        <span className="absolute top-1 left-1 bg-[#e08a1e] text-white text-[.5rem] font-extrabold uppercase tracking-wide px-1 py-0.5 rounded-[6px]">-{relatedDiscount}%</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[.74rem] text-[rgba(22,25,26,.6)] dark:text-[rgba(241,243,234,.6)] font-semibold line-clamp-2 mb-1">{relatedProduct.name}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-[.82rem] text-[#2f8b3d] dark:text-[#a8d63e]">R {parseFloat(relatedProduct.price).toFixed(2)}</span>
                        {relatedProduct.old_price && (
                          <span className="text-[.65rem] text-[rgba(22,25,26,.4)] dark:text-[rgba(241,243,234,.4)] line-through">R {parseFloat(relatedProduct.old_price).toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
