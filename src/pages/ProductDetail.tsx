import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Star, ChevronLeft, AlertCircle } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { allProducts, categories } from "@/data/dummyData";

// Helper function to calculate discount percentage
const calculateDiscountPercentage = (oldPrice: number | undefined, currentPrice: number): number | null => {
  if (!oldPrice || oldPrice <= currentPrice) return null;
  return Math.round(((oldPrice - currentPrice) / oldPrice) * 100);
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Find product
  const product = allProducts.find(p => p.id === id);
  
  // Find category
  const productCategory = product ? categories.find(cat => cat.id === product.categoryId) : null;

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex flex-col font-sans">
        <div className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/products")}>Go Back to Products</Button>
          </div>
        </div>
      </div>
    );
  }

  const discountPercent = calculateDiscountPercentage(product.oldPrice, product.price);
  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col font-sans">
      {/* Breadcrumb */}
      <section className="border-b border-gray-100 bg-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm animate-fade-in">
            <button onClick={() => navigate("/")} className="text-gray-600 hover:text-primary transition-colors">Home</button>
            <span className="text-gray-400">/</span>
            {productCategory && (
              <>
                <a href={`/products/${productCategory.slug}`} className="text-gray-600 hover:text-primary transition-colors">
                  {productCategory.name}
                </a>
                <span className="text-gray-400">/</span>
              </>
            )}
            <span className="text-primary font-semibold line-clamp-1">{product.name}</span>
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

        {/* Product Section - Left & Related on Right */}
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
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {discountPercent !== null && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-lg font-bold text-sm">
                      -{discountPercent}%
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-3 sm:space-y-4 animate-slide-in-right">
                {/* Category & Badge */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{product.category}</span>
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
                        className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-200'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({product.reviews} reviews)</span>
                </div>

                {/* Stock & Code */}
                <div className="grid grid-cols-2 gap-2 py-3 px-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Stock Status</p>
                    <div className="flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-green-600" />
                      <span className="text-xs font-semibold text-green-600">In Stock</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Product Code</p>
                    <p className="text-xs font-semibold text-gray-900 line-clamp-1">{product.id.toUpperCase()}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-1 py-3 border-y border-gray-100">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-bold text-primary">${product.price.toFixed(2)}</span>
                    {product.oldPrice && (
                      <span className="text-sm text-gray-400 line-through">${product.oldPrice.toFixed(2)}</span>
                    )}
                  </div>
                  {discountPercent !== null && (
                    <p className="text-xs text-green-600 font-semibold">
                      Save ${(product.oldPrice! - product.price).toFixed(2)} ({discountPercent}% off)
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
                      className="flex-1 rounded-lg bg-primary-gradient text-white font-semibold hover:shadow-lg hover:shadow-green-600/30 transition-all px-3 py-1.5 h-auto text-sm"
                      onClick={() => console.log('Add to cart', product.id, quantity)}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Related Products */}
          {relatedProducts.length > 0 && (
            <div className="hidden lg:block space-y-3 animate-fade-in">
              <h3 className="text-base font-bold text-gray-900">Related Items</h3>
              <div className="space-y-2">
                {relatedProducts.map(relatedProduct => (
                  <button
                    key={relatedProduct.id}
                    onClick={() => navigate(`/product-details/${relatedProduct.id}`)}
                    className="w-full text-left group"
                  >
                    <div className="flex gap-2 bg-white rounded-lg border border-gray-100 overflow-hidden hover:border-green-200 hover:shadow-md transition-all">
                      <div className="w-20 h-20 bg-gray-50 overflow-hidden shrink-0">
                        <img
                          src={relatedProduct.image}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-2 flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-semibold line-clamp-2 mb-1">{relatedProduct.name}</p>
                        <div className="flex items-baseline gap-1">
                          <span className="font-bold text-sm text-primary">${relatedProduct.price.toFixed(2)}</span>
                          {relatedProduct.oldPrice && (
                            <span className="text-xs text-gray-400 line-through">${relatedProduct.oldPrice.toFixed(2)}</span>
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

        {/* Tabs Section */}
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
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Brand</p>
                  <p className="text-sm font-semibold text-gray-900">Lumo Electrical</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Warranty</p>
                  <p className="text-sm font-semibold text-gray-900">2 Years</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Type</p>
                  <p className="text-sm font-semibold text-gray-900">{product.category}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Certification</p>
                  <p className="text-sm font-semibold text-gray-900">ISO 9001</p>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-600 font-semibold">Technical specifications available upon request</p>
              </div>
            </TabsContent>

            {/* Description Tab */}
            <TabsContent value="description" className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  This is a premium {product.category.toLowerCase()} designed for professional and DIY electrical installations. Built with high-quality materials and rigorous testing standards.
                </p>
                <p>
                  Whether you're a seasoned electrician or a DIY enthusiast, this product delivers reliability and performance you can count on. Perfect for both residential and commercial applications.
                </p>
                <div className="space-y-2">
                  <p className="font-semibold text-gray-900">Key Features:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                    <li>High quality construction</li>
                    <li>Long lasting durability</li>
                    <li>Professional grade performance</li>
                    <li>Easy installation</li>
                    <li>Certified and tested</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            {/* Questions Tab */}
            <TabsContent value="questions" className="p-4 sm:p-6">
              <div className="space-y-4">
                <Button className="w-full bg-primary-gradient text-white font-semibold hover:shadow-lg" size="sm">
                  + Add Question
                </Button>
                
                <div className="space-y-3">
                  <div className="p-3 sm:p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">What's the warranty period?</p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">2 weeks ago</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Asked by Sarah M.</p>
                    <div className="bg-green-50 border border-green-100 rounded p-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-green-700">Answer: </span>This product comes with a 2-year manufacturer warranty covering defects in materials and workmanship.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">How long does it take to deliver?</p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">1 month ago</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Asked by John K.</p>
                    <div className="bg-green-50 border border-green-100 rounded p-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-green-700">Answer: </span>Standard delivery takes 3-5 business days. Express options available at checkout.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">Is installation included?</p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">1 week ago</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Asked by Mike T.</p>
                    <p className="text-xs text-yellow-800 font-semibold mb-2">Awaiting Answer</p>
                  </div>
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
                        <span className="text-3xl font-bold text-primary">{product.rating}</span>
                        <span className="text-sm text-gray-600">/5</span>
                      </div>
                      <div className="flex gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 font-semibold">{product.reviews} verified reviews</p>
                    </div>
                  </div>
                </div>

                {/* Add Review Button */}
                <Button className="w-full bg-primary-gradient text-white font-semibold hover:shadow-lg" size="sm">
                  + Add Review
                </Button>

                {/* Reviews List */}
                <div className="space-y-3">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Excellent Quality Product</p>
                        <div className="flex gap-0.5 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">2 weeks ago</span>
                    </div>
                    <p className="text-xs text-gray-600 font-medium mb-2">By Sarah M. | Verified Purchase</p>
                    <p className="text-sm text-gray-600">Excellent product! This has been exactly what I needed. Perfect quality and fast delivery. Highly recommended for anyone in the electrical trade.</p>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Great Value for Money</p>
                        <div className="flex gap-0.5 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">1 month ago</span>
                    </div>
                    <p className="text-xs text-gray-600 font-medium mb-2">By John K. | Verified Purchase</p>
                    <p className="text-sm text-gray-600">Really happy with this purchase. The quality is impressive and the price is very reasonable. Would definitely buy again.</p>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Professional Grade</p>
                        <div className="flex gap-0.5 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">1.5 months ago</span>
                    </div>
                    <p className="text-xs text-gray-600 font-medium mb-2">By Mike T. | Verified Purchase</p>
                    <p className="text-sm text-gray-600">Using this for professional installations. Meets all standards and very reliable. Only minor issue was packaging could be better, but product itself is perfect.</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Items for mobile/tablet (below tabs) */}
        {relatedProducts.length > 0 && (
          <div className="block lg:hidden mt-8 animate-fade-in">
            <h3 className="text-base font-bold text-gray-900 mb-2">Related Items</h3>
            <div className="space-y-2">
              {relatedProducts.map(relatedProduct => (
                <button
                  key={relatedProduct.id}
                  onClick={() => navigate(`/product-details/${relatedProduct.id}`)}
                  className="w-full text-left group"
                >
                  <div className="flex gap-2 bg-white rounded-lg border border-gray-100 overflow-hidden hover:border-green-200 hover:shadow-md transition-all">
                    <div className="w-20 h-20 bg-gray-50 overflow-hidden shrink-0">
                      <img
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-2 flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-semibold line-clamp-2 mb-1">{relatedProduct.name}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-sm text-primary">${relatedProduct.price.toFixed(2)}</span>
                        {relatedProduct.oldPrice && (
                          <span className="text-xs text-gray-400 line-through">${relatedProduct.oldPrice.toFixed(2)}</span>
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
