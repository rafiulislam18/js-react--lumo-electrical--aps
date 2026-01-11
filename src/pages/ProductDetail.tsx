import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Star, ChevronLeft, AlertCircle, Loader, MessageCircle } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost } from "@/lib/api";

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

// Helper to get full image URL
const getImageUrl = (imagePath: string | undefined) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:8000';
  return `${baseUrl}${imagePath}`;
};

// Helper function to calculate discount percentage
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
  const [selectedReviewRating, setSelectedReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Fetch product details with all related data
  const { data: product, isLoading: productLoading, isError: productError } = useQuery<ProductData>({
    queryKey: ['product', id],
    queryFn: async () => {
      return apiGet<ProductData>(`/products/${id}/`);
    },
    enabled: !!id,
  });

  // Add to cart mutation
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

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: async () => {
      if (!product) throw new Error('Product not loaded');
      if (selectedReviewRating === 0) throw new Error('Please select a rating');
      if (reviewComment.trim().length === 0) throw new Error('Please enter a comment');
      
      return apiPost(`/reviews/create/${product.id}/`, {
        rating: selectedReviewRating,
        comment: reviewComment.trim(),
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Review submitted',
        description: 'Thank you for your review!',
        className: "bg-green-600 text-white border-green-700",
        duration: 2000,
      });
      setReviewComment('');
      setSelectedReviewRating(0);
      setShowReviewForm(false);
      // Refresh product data to get updated reviews
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

  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col font-sans">
      {/* Breadcrumb */}
      <section className="border-b border-gray-100 bg-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm animate-fade-in overflow-x-auto">
            <button onClick={() => navigate("/")} className="text-gray-600 hover:text-primary transition-colors whitespace-nowrap">Home</button>
            <span className="text-gray-400">/</span>
            {product?.category?.breadcrumb && product.category.breadcrumb.length > 0 ? (
              <>
                {product.category.breadcrumb.map((cat, idx) => (
                  <div key={cat.id} className="flex items-center gap-2">
                    <span className="text-gray-600 hover:text-primary cursor-pointer transition-colors whitespace-nowrap">
                      {cat.name}
                    </span>
                    {idx < product.category.breadcrumb.length - 1 && <span className="text-gray-400">/</span>}
                  </div>
                ))}
              </>
            ) : (
              <span className="text-gray-600">Products</span>
            )}
            <span className="text-gray-400">/</span>
            <span className="text-primary font-semibold line-clamp-1">{product?.name || 'Loading...'}</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-6 sm:py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-6 text-sm animate-fade-in"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {/* Loading State */}
        {productLoading && (
          <div className="flex items-center justify-center min-h-96">
            <Loader className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}

        {/* Error State */}
        {productError && (
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/products")}>Go Back to Products</Button>
          </div>
        )}

        {/* Product Section - Left & Related on Right */}
        {product && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_22%] gap-6 lg:gap-8 mb-12">
            {/* Left: Product Details */}
            <div className="space-y-6 lg:space-y-8">
              {/* Product Image & Info Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-white rounded-lg border border-gray-100 p-4 sm:p-6">
                {/* Product Image */}
                <div className="animate-slide-in-left flex items-center justify-center">
                  <div className="relative bg-gray-50 rounded-lg overflow-hidden max-w-[280px] sm:max-w-[360px] mx-auto">
                    <div className="aspect-square flex items-center justify-center">
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {product.discount_percentage > 0 && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-lg font-bold text-sm">
                        -{Math.round(product.discount_percentage)}%
                      </div>
                    )}
                  </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-3 sm:space-y-4 animate-slide-in-right">
                  {/* Category & Badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Product</span>
                    {product.badge && (
                      <span className={`px-2 py-1 text-xs font-bold text-white rounded-lg ${
                        product.badge === 'New' ? 'bg-blue-500' :
                        product.badge === 'Sale' ? 'bg-red-500' :
                        'bg-orange-500'
                      }`}>
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{product.name}</h1>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(product.avg_rating) ? 'fill-current' : 'text-gray-200'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({product.total_reviews} reviews)</span>
                  </div>

                  {/* Stock & Code */}
                  <div className="grid grid-cols-2 gap-2 py-3 px-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Stock Status</p>
                      <div className="flex items-center gap-1">
                        <AlertCircle className={`w-3 h-3 ${product.in_stock ? 'text-green-600' : 'text-red-600'}`} />
                        <span className={`text-xs font-semibold ${product.in_stock ? 'text-green-600' : 'text-red-600'}`}>
                          {product.in_stock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Product ID</p>
                      <p className="text-xs font-semibold text-gray-900 line-clamp-1">{product.id}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="space-y-1 py-3 border-y border-gray-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-bold text-primary">${parseFloat(product.price).toFixed(2)}</span>
                      {product.old_price && (
                        <span className="text-sm text-gray-400 line-through">${parseFloat(product.old_price).toFixed(2)}</span>
                      )}
                    </div>
                    {product.discount_percentage > 0 && (
                      <p className="text-xs text-green-600 font-semibold">
                        Save ${(parseFloat(product.old_price!) - parseFloat(product.price)).toFixed(2)} ({Math.round(product.discount_percentage)}% off)
                      </p>
                    )}
                  </div>

                  {/* Quantity & Actions */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-600 font-medium block mb-1">Quantity</label>
                      <div className="flex items-center border border-gray-200 rounded-lg w-fit">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition-colors text-sm"
                        >
                          −
                        </button>
                        <span className="px-3 py-1.5 font-semibold min-w-10 text-center text-sm">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition-colors text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-500 transition-all px-3 py-1.5 h-auto text-sm"
                        onClick={() => setIsWishlisted(!isWishlisted)}
                      >
                        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                      </Button>
                      <Button
                        size="sm"
                        disabled={!product.in_stock || addToCartMutation.isPending}
                        className="flex-1 rounded-lg bg-primary-gradient text-white font-semibold hover:shadow-lg hover:shadow-green-600/30 transition-all px-3 py-1.5 h-auto text-sm disabled:opacity-50"
                        onClick={handleAddToCart}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Related Products */}
            {product?.related_products && product.related_products.length > 0 && (
              <div className="hidden lg:block space-y-3 animate-fade-in">
                <h3 className="text-base font-bold text-gray-900">Related Items</h3>
                <div className="space-y-2">
                  {product.related_products.map(relatedProduct => (
                    <button
                      key={relatedProduct.id}
                      onClick={() => navigate(`/product-details/${relatedProduct.id}`)}
                      className="w-full text-left group"
                    >
                      <div className="flex gap-2 bg-white rounded-lg border border-gray-100 overflow-hidden hover:border-green-200 hover:shadow-md transition-all">
                        <div className="w-20 h-20 bg-gray-50 overflow-hidden shrink-0">
                          <img
                            src={getImageUrl(relatedProduct.image)}
                            alt={relatedProduct.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-2 flex-1 min-w-0">
                          <p className="text-xs text-gray-500 font-semibold line-clamp-2 mb-1">{relatedProduct.name}</p>
                          <div className="flex items-baseline gap-1">
                            <span className="font-bold text-sm text-primary">${parseFloat(relatedProduct.price).toFixed(2)}</span>
                            {relatedProduct.old_price && (
                              <span className="text-xs text-gray-400 line-through">${parseFloat(relatedProduct.old_price).toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tabs Section */}
        {product && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-fade-in" style={{animationDelay: '0.2s'}}>
          <Tabs defaultValue="specifications" className="w-full">
            <TabsList className="w-full rounded-none border-b border-gray-100 bg-gray-50 h-auto p-0 grid grid-cols-4">
              <TabsTrigger value="specifications" className="rounded-none text-xs sm:text-sm">
                <span className="hidden sm:inline">Specifications</span>
                <span className="sm:hidden">Specs</span>
              </TabsTrigger>
              <TabsTrigger value="description" className="rounded-none text-xs sm:text-sm">Description</TabsTrigger>
              <TabsTrigger value="questions" className="rounded-none text-xs sm:text-sm">Q&A</TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-none text-xs sm:text-sm">Reviews</TabsTrigger>
            </TabsList>

            {/* Specifications Tab */}
            <TabsContent value="specifications" className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {product?.specifications && Object.keys(product.specifications).length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1 font-medium">{key}</p>
                      <p className="text-sm font-semibold text-gray-900">{String(value)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-600 font-semibold">No specifications available</p>
                </div>
              )}
            </TabsContent>

            {/* Description Tab */}
            <TabsContent value="description" className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {product?.description ? (
                <div className="space-y-3 text-sm text-gray-600">
                  <p>{product.description}</p>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">No description available for this product.</p>
                </div>
              )}
            </TabsContent>

            {/* Questions Tab */}
            <TabsContent value="questions" className="p-4 sm:p-6">
              <div className="space-y-4">
                <Button 
                  className="w-full bg-primary-gradient text-white font-semibold hover:shadow-lg" 
                  size="sm"
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login');
                      return;
                    }
                    // Open modal to add question
                    toast({
                      title: "Coming Soon",
                      description: "Question form will be available soon",
                      duration: 2000,
                    });
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                  + Ask a Question
                </Button>
                
                <div className="space-y-3">
                  {product?.questions && product.questions.length > 0 ? (
                    product.questions.map(question => (
                      <div key={question.id} className={`p-3 sm:p-4 border rounded-lg ${question.is_answered ? 'border-green-100 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-sm">{question.question}</p>
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {new Date(question.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          Asked by <span className="font-medium">{question.asked_by.first_name + " " + question.asked_by.last_name || question.asked_by.username}</span>
                        </p>
                        {question.is_answered && question.answer ? (
                          <div className="bg-white border border-green-100 rounded p-2">
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold text-green-700">Answer: </span>
                              {question.answer}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs font-semibold text-yellow-800">Awaiting Answer</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                      <p className="text-sm text-gray-600">No questions yet. Be the first to ask!</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="p-4 sm:p-6">
              <div className="space-y-4">
                {/* Rating Summary */}
                <div className="p-4 bg-gradient-to-br from-green-50 to-lime-50 border border-green-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-bold text-primary">{product?.avg_rating || 0}</span>
                        <span className="text-sm text-gray-600">/5</span>
                      </div>
                      <div className="flex gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(product?.avg_rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 font-semibold">{product?.total_reviews || 0} reviews</p>
                    </div>
                  </div>
                </div>

                {/* Review Form Toggle */}
                {!showReviewForm ? (
                  <Button 
                    className="w-full bg-primary-gradient text-white font-semibold hover:shadow-lg" 
                    size="sm"
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
                  </Button>
                ) : (
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Write Your Review</h3>
                      <button 
                        onClick={() => setShowReviewForm(false)}
                        className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>

                    {/* Rating Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => setSelectedReviewRating(rating)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-6 h-6 ${selectedReviewRating >= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          </button>
                        ))}
                      </div>
                      {selectedReviewRating > 0 && (
                        <p className="text-xs text-gray-600 mt-1">You selected {selectedReviewRating} star{selectedReviewRating !== 1 ? 's' : ''}</p>
                      )}
                    </div>

                    {/* Comment Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your experience with this product..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none text-sm"
                        rows={4}
                      />
                      <p className="text-xs text-gray-500 mt-1">{reviewComment.length} characters</p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-primary-gradient text-white font-semibold hover:shadow-lg"
                        disabled={createReviewMutation.isPending || selectedReviewRating === 0 || reviewComment.trim().length === 0}
                        onClick={() => createReviewMutation.mutate()}
                      >
                        {createReviewMutation.isPending ? (
                          <>
                            <Loader className="w-4 h-4 mr-1 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          'Submit Review'
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowReviewForm(false);
                          setReviewComment('');
                          setSelectedReviewRating(0);
                        }}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-3">
                  {product?.reviews && product.reviews.length > 0 ? (
                    product.reviews.map(review => (
                      <div key={review.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{review.comment}</p>
                            <div className="flex gap-0.5 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-3 h-3 ${i < parseFloat(review.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-2">
                          By <span className="font-semibold">{review.reviewed_by.first_name + " " + review.reviewed_by.last_name || review.reviewed_by.username}</span>
                          {review.is_verified_purchase && <span className="ml-2 text-green-600">✓ Verified Purchase</span>}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                      <p className="text-sm text-gray-600">No reviews yet. Be the first to review!</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        )}

        {/* Related Items for mobile/tablet (below tabs) */}
        {product?.related_products && product.related_products.length > 0 && (
          <div className="block lg:hidden mt-8 animate-fade-in">
            <h3 className="text-base font-bold text-gray-900 mb-2">Related Items</h3>
            <div className="space-y-2">
              {product.related_products.map(relatedProduct => (
                <button
                  key={relatedProduct.id}
                  onClick={() => navigate(`/product-details/${relatedProduct.id}`)}
                  className="w-full text-left group"
                >
                  <div className="flex gap-2 bg-white rounded-lg border border-gray-100 overflow-hidden hover:border-green-200 hover:shadow-md transition-all">
                    <div className="w-20 h-20 bg-gray-50 overflow-hidden shrink-0">
                      <img
                        src={getImageUrl(relatedProduct.image)}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-2 flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-semibold line-clamp-2 mb-1">{relatedProduct.name}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-sm text-primary">${parseFloat(relatedProduct.price).toFixed(2)}</span>
                        {relatedProduct.old_price && (
                          <span className="text-xs text-gray-400 line-through">${parseFloat(relatedProduct.old_price).toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
