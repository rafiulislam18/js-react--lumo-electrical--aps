import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Star, ChevronLeft, Truck, Shield, RotateCcw } from "lucide-react";
import { featuredProducts, bestSellers, latestProducts } from "@/data/dummyData";

// Combine all products
const allProducts = [...featuredProducts, ...bestSellers, ...latestProducts].reduce((acc, product) => {
  if (!acc.find(p => p.id === product.id)) {
    acc.push(product);
  }
  return acc;
}, []);

// Helper function to calculate discount percentage
const calculateDiscountPercentage = (oldPrice: number | undefined, currentPrice: number): number | null => {
  if (!oldPrice || oldPrice <= currentPrice) return null;
  return Math.round(((oldPrice - currentPrice) / oldPrice) * 100);
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Find product
  const product = allProducts.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/products")}>Go Back to Products</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const discountPercent = calculateDiscountPercentage(product.oldPrice, product.price);
  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col font-sans">
      <Navbar />

      {/* Breadcrumb */}
      <section className="border-b border-gray-100 bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm animate-fade-in">
            <button onClick={() => navigate("/")} className="text-gray-600 hover:text-primary transition-colors">Home</button>
            <span className="text-gray-400">/</span>
            <button onClick={() => navigate("/products")} className="text-gray-600 hover:text-primary transition-colors">Products</button>
            <span className="text-gray-400">/</span>
            <span className="text-primary font-semibold">{product.name}</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-8 animate-fade-in"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="animate-slide-in-left">
            <div className="relative bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
              <div className="aspect-square bg-gray-50 flex items-center justify-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Discount Badge */}
              {discountPercent !== null && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-lg animate-scale-in">
                  -{discountPercent}%
                </div>
              )}
            </div>

            {/* Additional Images */}
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square rounded-lg border-2 overflow-hidden transition-all duration-300 ${
                    selectedImage === i ? 'border-primary' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={product.image}
                    alt={`View ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="animate-slide-in-right">
            {/* Category & Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{product.category}</span>
              {product.badge && (
                <span className={`px-3 py-1 text-xs font-bold text-white rounded-lg ${
                  product.badge === 'New' ? 'bg-blue-500' :
                  product.badge === 'Sale' ? 'bg-red-500' :
                  'bg-orange-500'
                }`}>
                  {product.badge}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-200'}`}
                  />
                ))}
              </div>
              <span className="text-gray-600 font-medium">({product.reviews} reviews)</span>
            </div>

            {/* Price Section */}
            <div className="mb-8 pb-8 border-b border-gray-100">
              <div className="flex items-baseline gap-4 mb-3">
                <span className="text-5xl font-bold text-primary">${product.price.toFixed(2)}</span>
                {product.oldPrice && (
                  <span className="text-2xl text-gray-400 line-through">${product.oldPrice.toFixed(2)}</span>
                )}
              </div>
              {discountPercent !== null && (
                <p className="text-lg text-green-600 font-bold">
                  You save ${(product.oldPrice! - product.price).toFixed(2)} ({discountPercent}%)
                </p>
              )}
            </div>

            {/* Quantity & Actions */}
            <div className="mb-8 pb-8 border-b border-gray-100">
              <div className="flex items-center gap-6 mb-6">
                <div>
                  <label className="text-sm text-gray-600 font-medium block mb-2">Quantity</label>
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      −
                    </button>
                    <span className="px-4 py-2 font-semibold min-w-16 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-lg border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-500 transition-all"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  size="lg"
                  className="col-span-2 rounded-lg bg-primary-gradient text-white font-bold text-lg hover:shadow-lg hover:shadow-green-600/30 transition-all"
                  onClick={() => console.log('Add to cart', product.id, quantity)}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </Button>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 gap-4 mb-8">
              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-100">
                <Truck className="w-6 h-6 text-green-600 shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">Free Shipping</p>
                  <p className="text-sm text-gray-600">On orders over $100</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <Shield className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">Secure Payment</p>
                  <p className="text-sm text-gray-600">100% safe and secure</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg border border-orange-100">
                <RotateCcw className="w-6 h-6 text-orange-600 shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">30-Day Returns</p>
                  <p className="text-sm text-gray-600">Money-back guarantee</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-gray-100 pt-16 animate-fade-in" style={{animationDelay: '0.3s'}}>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-stagger">
              {relatedProducts.map(relatedProduct => (
                <button
                  key={relatedProduct.id}
                  onClick={() => navigate(`/product/${relatedProduct.id}`)}
                  className="text-left group animate-slide-in-up hover:no-underline"
                >
                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-green-200 transition-all duration-300 h-full">
                    <div className="aspect-square bg-gray-50 overflow-hidden">
                      <img
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-400 font-bold uppercase mb-2">{relatedProduct.category}</p>
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-3 group-hover:text-primary transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-lg text-primary">${relatedProduct.price.toFixed(2)}</span>
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

      <Footer />
    </div>
  );
}
