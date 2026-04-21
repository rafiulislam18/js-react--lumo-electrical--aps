import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, Heart, Star, ChevronLeft, AlertCircle, Loader, MessageCircle } from "lucide-react";
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

  return (
    <div className="font-outfit bg-white dark:bg-dark-surface text-black/70 dark:text-[rgba(240,242,237,.7)] min-h-screen flex flex-col">
      {/* Breadcrumb */}
      <section className="bg-black/[.03] dark:bg-lime-brand/[.02] border-b border-black/[.06] dark:border-lime-brand/[.06] px-8 py-4 max-sm:px-4 max-sm:py-3">
        <div className="max-w-[1280px] mx-auto flex items-center gap-4 text-[.8rem] max-sm:text-[.7rem] flex-wrap">
          <a href="/" className="text-black/55 dark:text-[rgba(240,242,237,.55)] no-underline transition-colors duration-200 hover:text-lime-brand">
            Home
          </a>
          <span className="text-black/25 dark:text-[rgba(240,242,237,.2)]">/</span>
          {product?.category?.breadcrumb && product.category.breadcrumb.length > 0 ? (
            <>
              {product.category.breadcrumb.map((cat) => (
                <div key={cat.id} className="flex items-center gap-4">
                  <a href={`/${cat.slug}`} className="text-black/55 dark:text-[rgba(240,242,237,.55)] no-underline transition-colors duration-200 hover:text-lime-brand">
                    {cat.name}
                  </a>
                  <span className="text-black/25 dark:text-[rgba(240,242,237,.2)]">/</span>
                </div>
              ))}
            </>
          ) : null}
          <span className="text-lime-brand font-semibold">{product?.name || 'Loading...'}</span>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 max-w-[1280px] mx-auto w-full px-8 py-8 max-sm:px-4 max-sm:py-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-black/60 dark:text-[rgba(240,242,237,.6)] hover:text-lime-brand transition-colors duration-200 mb-8 text-[.85rem] font-medium"
        >
          <ChevronLeft size={18} />
          Back
        </button>

        {/* Loading State */}
        {productLoading && (
          <div className="flex items-center justify-center min-h-96">
            <Loader className="w-8 h-8 text-lime-brand animate-spin" />
          </div>
        )}

        {/* Error State */}
        {productError && (
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-black/80 dark:text-[#f0f2ed] mb-4">Product Not Found</h1>
            <p className="text-black/60 dark:text-[rgba(240,242,237,.6)] mb-8">The product you're looking for doesn't exist.</p>
            <button onClick={() => navigate("/products")} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-green-brand to-lime-brand text-dark-surface font-semibold rounded-md hover:shadow-[0_0_16px_rgba(168,214,62,.4)] transition-all duration-200">
              Go Back to Products
            </button>
          </div>
        )}

        {/* Product Section */}
        {product && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 mb-12">
            {/* Main Content */}
            <div className="space-y-8">
              {/* Product Hero */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.2fr] gap-6 sm:gap-8 bg-white dark:bg-black/[.02] rounded-xl border border-black/[.08] dark:border-white/[.06] p-6 sm:p-8">
                {/* Image */}
                <div className="flex items-center justify-center">
                  <div className="relative w-full max-w-[360px] mx-auto aspect-square overflow-hidden rounded-lg bg-black/[.05] dark:bg-white/[.02] border border-black/[.08] dark:border-white/[.06]">
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {discountPercent !== null && (
                      <span className="absolute top-4 right-4 z-10 text-[.7rem] font-extrabold tracking-[.05em] bg-red-500 text-white px-2 py-1 rounded">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-4">
                  {/* Category & Badge */}
                  <div className="flex items-center gap-3">
                    <span className="text-[.65rem] font-bold tracking-[.1em] uppercase text-black/55 dark:text-lime-brand/70">
                      {product.category.name}
                    </span>
                    {product.badge && (
                      <span className={[
                        "text-[.65rem] font-extrabold tracking-[.05em] uppercase px-2 py-1 rounded text-white",
                        product.badge === 'Hot' ? "bg-red-500" :
                        product.badge === 'New' ? "bg-blue-500" :
                        "bg-green-brand"
                      ].join(' ')}>
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="font-bebas text-[clamp(1.8rem,4vw,2.5rem)] tracking-[.08em] text-black/85 dark:text-[#f0f2ed] leading-tight">
                    {product.name}
                  </h1>

                  {/* Rating */}
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          style={{
                            fill: i < Math.floor(product.avg_rating) ? '#fbbf24' : 'none',
                            color: i < Math.floor(product.avg_rating) ? '#fbbf24' : 'rgba(0,0,0,.2)',
                            strokeWidth: 1.5
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[.85rem] text-black/60 dark:text-[rgba(240,242,237,.6)]">
                      ({product.total_reviews} reviews)
                    </span>
                  </div>

                  {/* Stock & Code */}
                  <div className="grid grid-cols-2 gap-3 py-4 px-4 bg-black/[.03] dark:bg-white/[.02] rounded-lg border border-black/[.08] dark:border-white/[.06]">
                    <div>
                      <p className="text-[.7rem] text-black/50 dark:text-[rgba(240,242,237,.5)] font-medium mb-1">Stock Status</p>
                      <div className="flex items-center gap-1">
                        <AlertCircle size={14} className={product.in_stock ? "text-green-600" : "text-red-600"} />
                        <span className={[
                          "text-[.75rem] font-semibold",
                          product.in_stock ? "text-green-600" : "text-red-600"
                        ].join(' ')}>
                          {product.in_stock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[.7rem] text-black/50 dark:text-[rgba(240,242,237,.5)] font-medium mb-1">Product ID</p>
                      <p className="text-[.75rem] font-semibold text-black/70 dark:text-[rgba(240,242,237,.7)]">{product.id}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="space-y-2 py-4 border-y border-black/[.08] dark:border-white/[.06]">
                    <div className="flex items-baseline gap-3">
                      <span className="text-[2.5rem] sm:text-[3rem] font-extrabold text-lime-brand">
                        R {parseFloat(product.price).toFixed(2)}
                      </span>
                      {product.old_price && (
                        <span className="text-[.85rem] text-black/32 dark:text-[rgba(240,242,237,.3)] line-through">
                          R {parseFloat(product.old_price).toFixed(2)}
                        </span>
                      )}
                    </div>
                    {discountPercent !== null && (
                      <p className="text-[.8rem] text-lime-brand/80 font-semibold">
                        Save R {(parseFloat(product.old_price!) - parseFloat(product.price)).toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* Quantity & Actions */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[.8rem] text-black/60 dark:text-[rgba(240,242,237,.6)] font-medium block mb-2">Quantity</label>
                      <div className="flex items-center border border-black/[.1] dark:border-white/[.08] rounded-md w-fit">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-4 py-2 text-black/60 dark:text-[rgba(240,242,237,.6)] hover:bg-black/[.05] dark:hover:bg-white/[.05] transition-colors duration-150"
                        >
                          −
                        </button>
                        <span className="px-4 py-2 font-semibold min-w-12 text-center text-black/80 dark:text-[rgba(240,242,237,.8)]">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-4 py-2 text-black/60 dark:text-[rgba(240,242,237,.6)] hover:bg-black/[.05] dark:hover:bg-white/[.05] transition-colors duration-150"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        className={[
                          "flex items-center justify-center gap-2 px-4 py-3 rounded-md border font-semibold text-[.85rem] cursor-pointer transition-all duration-200",
                          isWishlisted
                            ? "bg-red-500/[.12] border-red-500/30 text-red-500 hover:bg-red-500/[.2]"
                            : "bg-black/[.06] dark:bg-lime-brand/[.08] border-black/[.12] dark:border-lime-brand/20 text-black/70 dark:text-lime-brand hover:bg-black/[.1] dark:hover:bg-lime-brand/[.15]"
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
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-gradient-to-br from-green-brand to-lime-brand text-dark-surface font-semibold text-[.85rem] cursor-pointer transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)] disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="bg-white dark:bg-black/[.02] rounded-xl border border-black/[.08] dark:border-white/[.06] overflow-hidden">
                <Tabs defaultValue="specifications" className="w-full">
                  <TabsList className="w-full rounded-none border-b border-black/[.08] dark:border-white/[.06] bg-black/[.02] dark:bg-white/[.02] h-auto p-0 grid grid-cols-4">
                    <TabsTrigger value="specifications" className="rounded-none text-[.8rem] sm:text-[.85rem] font-medium text-black/60 dark:text-[rgba(240,242,237,.6)] data-[state=active]:text-lime-brand data-[state=active]:border-b-2 data-[state=active]:border-lime-brand">
                      <span className="hidden sm:inline">Specifications</span>
                      <span className="sm:hidden">Specs</span>
                    </TabsTrigger>
                    <TabsTrigger value="description" className="rounded-none text-[.8rem] sm:text-[.85rem] font-medium text-black/60 dark:text-[rgba(240,242,237,.6)] data-[state=active]:text-lime-brand data-[state=active]:border-b-2 data-[state=active]:border-lime-brand">
                      Description
                    </TabsTrigger>
                    <TabsTrigger value="questions" className="rounded-none text-[.8rem] sm:text-[.85rem] font-medium text-black/60 dark:text-[rgba(240,242,237,.6)] data-[state=active]:text-lime-brand data-[state=active]:border-b-2 data-[state=active]:border-lime-brand">
                      Q&A
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className="rounded-none text-[.8rem] sm:text-[.85rem] font-medium text-black/60 dark:text-[rgba(240,242,237,.6)] data-[state=active]:text-lime-brand data-[state=active]:border-b-2 data-[state=active]:border-lime-brand">
                      Reviews
                    </TabsTrigger>
                  </TabsList>

                  {/* Specifications */}
                  <TabsContent value="specifications" className="p-6 sm:p-8 space-y-4">
                    {product?.specifications && Object.keys(product.specifications).length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key} className="p-4 bg-black/[.03] dark:bg-white/[.02] rounded-lg border border-black/[.08] dark:border-white/[.06]">
                            <p className="text-[.75rem] text-black/50 dark:text-[rgba(240,242,237,.5)] font-medium mb-1">{key}</p>
                            <p className="text-[.85rem] font-semibold text-black/80 dark:text-[rgba(240,242,237,.8)]">{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-blue-50 dark:bg-blue-500/[.08] rounded-lg border border-blue-200 dark:border-blue-500/20">
                        <p className="text-[.85rem] text-blue-700 dark:text-blue-400 font-medium">No specifications available</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Description */}
                  <TabsContent value="description" className="p-6 sm:p-8 space-y-4">
                    {product?.description ? (
                      <p className="text-[.9rem] leading-[1.8] text-black/70 dark:text-[rgba(240,242,237,.7)]">
                        {product.description}
                      </p>
                    ) : (
                      <div className="p-4 bg-black/[.03] dark:bg-white/[.02] rounded-lg border border-black/[.08] dark:border-white/[.06]">
                        <p className="text-[.85rem] text-black/60 dark:text-[rgba(240,242,237,.6)]">No description available for this product.</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Questions */}
                  <TabsContent value="questions" className="p-6 sm:p-8 space-y-6">
                    {!showQuestionForm ? (
                      <button
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-br from-green-brand to-lime-brand text-dark-surface font-semibold text-[.85rem] rounded-md cursor-pointer transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)]"
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
                      <div className="p-6 border border-black/[.08] dark:border-white/[.06] rounded-lg bg-black/[.02] dark:bg-white/[.02] space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-black/80 dark:text-[rgba(240,242,237,.8)]">Ask a Question</h3>
                          <button
                            onClick={() => setShowQuestionForm(false)}
                            className="text-[.8rem] text-black/60 dark:text-[rgba(240,242,237,.6)] hover:text-black/80 dark:hover:text-[rgba(240,242,237,.8)] transition-colors duration-150"
                          >
                            Cancel
                          </button>
                        </div>
                        <div>
                          <label className="block text-[.8rem] font-medium text-black/70 dark:text-[rgba(240,242,237,.7)] mb-2">Question</label>
                          <textarea
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            placeholder="Ask your question about this product..."
                            className="w-full px-4 py-3 border border-black/[.1] dark:border-white/[.08] rounded-lg bg-white dark:bg-black/[.05] text-black/80 dark:text-[rgba(240,242,237,.8)] text-[.85rem] focus:outline-none focus:border-lime-brand/30 focus:bg-lime-brand/[.05] dark:focus:bg-lime-brand/[.05] resize-none"
                            rows={4}
                          />
                          <p className="text-[.75rem] text-black/50 dark:text-[rgba(240,242,237,.5)] mt-1">{questionText.length} characters</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="flex-1 px-4 py-2 bg-gradient-to-br from-green-brand to-lime-brand text-dark-surface font-semibold text-[.8rem] rounded-md cursor-pointer transition-all duration-200 hover:shadow-[0_0_12px_rgba(168,214,62,.4)] disabled:opacity-50"
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
                            className="px-4 py-2 bg-black/[.06] dark:bg-white/[.05] text-black/70 dark:text-[rgba(240,242,237,.7)] font-medium text-[.8rem] rounded-md cursor-pointer transition-all duration-200 hover:bg-black/[.1] dark:hover:bg-white/[.08]"
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
                              "p-4 border rounded-lg",
                              question.is_answered
                                ? "border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-500/[.08]"
                                : "border-yellow-200 dark:border-yellow-500/20 bg-yellow-50 dark:bg-yellow-500/[.08]"
                            ].join(' ')}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <p className="font-semibold text-[.85rem] text-black/80 dark:text-[rgba(240,242,237,.8)]">{question.question}</p>
                              <span className="text-[.7rem] text-black/50 dark:text-[rgba(240,242,237,.5)] whitespace-nowrap">
                                {new Date(question.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-[.75rem] text-black/60 dark:text-[rgba(240,242,237,.6)] mb-2">
                              Asked by <span className="font-medium">{question.asked_by.first_name + " " + question.asked_by.last_name || question.asked_by.username}</span>
                            </p>
                            {question.is_answered && question.answer ? (
                              <div className="bg-white dark:bg-black/[.05] border border-green-200 dark:border-green-500/20 rounded px-3 py-2">
                                <p className="text-[.8rem] text-black/70 dark:text-[rgba(240,242,237,.7)]">
                                  <span className="font-semibold text-green-700 dark:text-green-400">Answer: </span>
                                  {question.answer}
                                </p>
                              </div>
                            ) : (
                              <p className="text-[.75rem] font-semibold text-yellow-800 dark:text-yellow-400">Awaiting Answer</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-4 bg-black/[.03] dark:bg-white/[.02] rounded-lg border border-black/[.08] dark:border-white/[.06] text-center">
                          <p className="text-[.85rem] text-black/60 dark:text-[rgba(240,242,237,.6)]">No questions yet. Be the first to ask!</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Reviews */}
                  <TabsContent value="reviews" className="p-6 sm:p-8 space-y-6">
                    {/* Rating Summary */}
                    <div className="p-6 bg-gradient-to-br from-lime-brand/[.08] to-green-brand/[.08] dark:from-lime-brand/[.05] dark:to-green-brand/[.05] rounded-lg border border-lime-brand/20 dark:border-lime-brand/10">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-4xl font-extrabold text-lime-brand">{product?.avg_rating || 0}</span>
                            <span className="text-[.85rem] text-black/60 dark:text-[rgba(240,242,237,.6)]">/5</span>
                          </div>
                          <div className="flex gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                style={{
                                  fill: i < Math.floor(product?.avg_rating || 0) ? '#fbbf24' : 'none',
                                  color: i < Math.floor(product?.avg_rating || 0) ? '#fbbf24' : 'rgba(0,0,0,.2)',
                                  strokeWidth: 1.5
                                }}
                              />
                            ))}
                          </div>
                          <p className="text-[.85rem] font-semibold text-black/70 dark:text-[rgba(240,242,237,.7)]">{product?.total_reviews || 0} reviews</p>
                        </div>
                      </div>
                    </div>

                    {!showReviewForm ? (
                      <button
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-br from-green-brand to-lime-brand text-dark-surface font-semibold text-[.85rem] rounded-md cursor-pointer transition-all duration-200 hover:shadow-[0_0_16px_rgba(168,214,62,.4)]"
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
                      <div className="p-6 border border-black/[.08] dark:border-white/[.06] rounded-lg bg-black/[.02] dark:bg-white/[.02] space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-black/80 dark:text-[rgba(240,242,237,.8)]">Write Your Review</h3>
                          <button
                            onClick={() => setShowReviewForm(false)}
                            className="text-[.8rem] text-black/60 dark:text-[rgba(240,242,237,.6)] hover:text-black/80 dark:hover:text-[rgba(240,242,237,.8)] transition-colors duration-150"
                          >
                            Cancel
                          </button>
                        </div>

                        {/* Rating Selection */}
                        <div>
                          <label className="block text-[.8rem] font-medium text-black/70 dark:text-[rgba(240,242,237,.7)] mb-3">Rating</label>
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
                                    fill: selectedReviewRating >= rating ? '#fbbf24' : 'none',
                                    color: selectedReviewRating >= rating ? '#fbbf24' : 'rgba(0,0,0,.2)',
                                    strokeWidth: 1.5,
                                    cursor: 'pointer'
                                  }}
                                />
                              </button>
                            ))}
                          </div>
                          {selectedReviewRating > 0 && (
                            <p className="text-[.75rem] text-black/60 dark:text-[rgba(240,242,237,.6)] mt-2">You selected {selectedReviewRating} star{selectedReviewRating !== 1 ? 's' : ''}</p>
                          )}
                        </div>

                        {/* Comment */}
                        <div>
                          <label className="block text-[.8rem] font-medium text-black/70 dark:text-[rgba(240,242,237,.7)] mb-2">Comment (optional)</label>
                          <textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Share your experience with this product..."
                            className="w-full px-4 py-3 border border-black/[.1] dark:border-white/[.08] rounded-lg bg-white dark:bg-black/[.05] text-black/80 dark:text-[rgba(240,242,237,.8)] text-[.85rem] focus:outline-none focus:border-lime-brand/30 focus:bg-lime-brand/[.05] dark:focus:bg-lime-brand/[.05] resize-none"
                            rows={4}
                          />
                          <p className="text-[.75rem] text-black/50 dark:text-[rgba(240,242,237,.5)] mt-1">{reviewComment.length} characters</p>
                        </div>

                        {/* Submit */}
                        <div className="flex gap-2">
                          <button
                            className="flex-1 px-4 py-2 bg-gradient-to-br from-green-brand to-lime-brand text-dark-surface font-semibold text-[.8rem] rounded-md cursor-pointer transition-all duration-200 hover:shadow-[0_0_12px_rgba(168,214,62,.4)] disabled:opacity-50"
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
                            className="px-4 py-2 bg-black/[.06] dark:bg-white/[.05] text-black/70 dark:text-[rgba(240,242,237,.7)] font-medium text-[.8rem] rounded-md cursor-pointer transition-all duration-200 hover:bg-black/[.1] dark:hover:bg-white/[.08]"
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
                          <div key={review.id} className="p-4 border border-black/[.08] dark:border-white/[.06] rounded-lg bg-black/[.02] dark:bg-white/[.02]">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <p className="font-semibold text-[.85rem] text-black/80 dark:text-[rgba(240,242,237,.8)] mb-1">{review.comment}</p>
                                <div className="flex gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={12}
                                      style={{
                                        fill: i < parseFloat(review.rating) ? '#fbbf24' : 'none',
                                        color: i < parseFloat(review.rating) ? '#fbbf24' : 'rgba(0,0,0,.2)',
                                        strokeWidth: 1.5
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                              <span className="text-[.7rem] text-black/50 dark:text-[rgba(240,242,237,.5)] whitespace-nowrap">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-[.75rem] text-black/60 dark:text-[rgba(240,242,237,.6)]">
                              By <span className="font-semibold">{review.reviewed_by.first_name + " " + review.reviewed_by.last_name || review.reviewed_by.username}</span>
                              {review.is_verified_purchase && <span className="ml-2 text-green-600 dark:text-green-400 font-medium">✓ Verified Purchase</span>}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 bg-black/[.03] dark:bg-white/[.02] rounded-lg border border-black/[.08] dark:border-white/[.06] text-center">
                          <p className="text-[.85rem] text-black/60 dark:text-[rgba(240,242,237,.6)]">No reviews yet. Be the first to review!</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Sidebar - Related Products */}
            {product?.related_products && product.related_products.length > 0 && (
              <div className="hidden lg:block space-y-4">
                <h3 className="text-[.95rem] font-bold text-black/80 dark:text-[rgba(240,242,237,.8)]">Related Items</h3>
                <div className="space-y-2">
                  {product.related_products.slice(0, 5).map(relatedProduct => {
                    const relatedDiscount = calculateDiscountPercentage(relatedProduct.old_price, relatedProduct.price);
                    return (
                      <button
                        key={relatedProduct.id}
                        onClick={() => navigate(`/product-details/${relatedProduct.id}`)}
                        className="w-full text-left group flex gap-2 p-3 bg-white dark:bg-black/[.02] rounded-lg border border-black/[.08] dark:border-white/[.06] hover:border-lime-brand/30 dark:hover:border-lime-brand/20 hover:shadow-md dark:hover:shadow-[0_4px_12px_rgba(168,214,62,.15)] transition-all duration-200"
                      >
                        <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-black/[.05] dark:bg-white/[.02] border border-black/[.08] dark:border-white/[.06]">
                          <img
                            src={getImageUrl(relatedProduct.image)}
                            alt={relatedProduct.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {relatedDiscount !== null && (
                            <span className="absolute top-1 left-1 bg-red-500 text-white text-[.5rem] font-extrabold px-1 py-0.5 rounded">-{relatedDiscount}%</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[.7rem] text-black/50 dark:text-[rgba(240,242,237,.5)] font-semibold line-clamp-2 mb-1">{relatedProduct.name}</p>
                          <div className="flex items-baseline gap-1">
                            <span className="font-bold text-[.8rem] text-lime-brand">R {parseFloat(relatedProduct.price).toFixed(2)}</span>
                            {relatedProduct.old_price && (
                              <span className="text-[.65rem] text-black/[.28] dark:text-[rgba(240,242,237,.25)] line-through">R {parseFloat(relatedProduct.old_price).toFixed(2)}</span>
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
        )}

        {/* Related Items Mobile (below tabs) */}
        {product?.related_products && product.related_products.length > 0 && (
          <div className="block lg:hidden mt-12">
            <h3 className="text-[.95rem] font-bold text-black/80 dark:text-[rgba(240,242,237,.8)] mb-4">Related Items</h3>
            <div className="space-y-2">
              {product.related_products.slice(0, 5).map(relatedProduct => {
                const relatedDiscount = calculateDiscountPercentage(relatedProduct.old_price, relatedProduct.price);
                return (
                  <button
                    key={relatedProduct.id}
                    onClick={() => navigate(`/product-details/${relatedProduct.id}`)}
                    className="w-full text-left group flex gap-2 p-3 bg-white dark:bg-black/[.02] rounded-lg border border-black/[.08] dark:border-white/[.06] hover:border-lime-brand/30 dark:hover:border-lime-brand/20 hover:shadow-md dark:hover:shadow-[0_4px_12px_rgba(168,214,62,.15)] transition-all duration-200"
                  >
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-black/[.05] dark:bg-white/[.02] border border-black/[.08] dark:border-white/[.06]">
                      <img
                        src={getImageUrl(relatedProduct.image)}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {relatedDiscount !== null && (
                        <span className="absolute top-1 left-1 bg-red-500 text-white text-[.5rem] font-extrabold px-1 py-0.5 rounded">-{relatedDiscount}%</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[.7rem] text-black/50 dark:text-[rgba(240,242,237,.5)] font-semibold line-clamp-2 mb-1">{relatedProduct.name}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-[.8rem] text-lime-brand">R {parseFloat(relatedProduct.price).toFixed(2)}</span>
                        {relatedProduct.old_price && (
                          <span className="text-[.65rem] text-black/[.28] dark:text-[rgba(240,242,237,.25)] line-through">R {parseFloat(relatedProduct.old_price).toFixed(2)}</span>
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
