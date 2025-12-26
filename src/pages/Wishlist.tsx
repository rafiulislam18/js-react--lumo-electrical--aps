import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Product } from "@/data/dummyData";
import { allProducts } from "@/data/dummyData";

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);

  useEffect(() => {
    // Get wishlist from localStorage
    const saved = localStorage.getItem("wishlist");
    if (saved) {
      try {
        const wishlistIds = JSON.parse(saved);
        const items = allProducts.filter(p => wishlistIds.includes(p.id));
        setWishlistItems(items);
      } catch (e) {
        console.error("Error loading wishlist:", e);
      }
    }
  }, []);

  const removeFromWishlist = (productId: string) => {
    const saved = localStorage.getItem("wishlist") || "[]";
    const wishlistIds = JSON.parse(saved).filter((id: string) => id !== productId);
    localStorage.setItem("wishlist", JSON.stringify(wishlistIds));
    setWishlistItems(wishlistItems.filter(item => item.id !== productId));
  };

  const addToCart = (product: Product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item: any) => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    removeFromWishlist(product.id);
    alert("Added to cart!");
  };

  const calculateDiscount = (price: number, oldPrice?: number) => {
    if (!oldPrice) return 0;
    return Math.round(((oldPrice - price) / oldPrice) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col font-sans">
      <section className="flex-1 py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-12 animate-in fade-in slide-in-from-top-10 duration-700">
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
              My Wishlist
            </h1>
            <p className="text-gray-500">{wishlistItems.length} items saved</p>
          </div>

          {/* Wishlist Items */}
          {wishlistItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in" style={{animationDelay: '0.1s'}}>
              {wishlistItems.map((product, index) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow animate-in fade-in slide-in-from-bottom-5"
                  style={{animationDelay: `${0.15 + (index * 0.03)}s`}}
                >
                  {/* Image Container */}
                  <div className="relative overflow-hidden h-48">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {product.badge && (
                      <span className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                        {product.badge}
                      </span>
                    )}
                    {product.oldPrice && (
                      <span className="absolute top-4 left-4 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                        Save {calculateDiscount(product.price, product.oldPrice)}%
                      </span>
                    )}
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute bottom-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      {product.category}
                    </p>
                    <h3 className="font-bold text-gray-900 line-clamp-2 mb-2">
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-xs ${
                              i < Math.floor(product.rating)
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">({product.reviews})</span>
                    </div>

                    {/* Pricing */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-gray-900">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.oldPrice && (
                          <span className="text-sm text-gray-400 line-through">
                            ${product.oldPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {product.oldPrice && (
                        <p className="text-xs text-green-600 font-medium">
                          You save ${(product.oldPrice - product.price).toFixed(2)}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => addToCart(product)}
                        className="flex-1 bg-primary-gradient border-0 text-white rounded-lg hover:opacity-90 transition-smooth h-10"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                      <Button
                        onClick={() => removeFromWishlist(product.id)}
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 rounded-lg h-10"
                      >
                        <Heart className="w-4 h-4 fill-red-600" />
                      </Button>
                    </div>

                    {/* View Details */}
                    <Link to={`/product/${product.id}`} className="block mt-2">
                      <Button
                        variant="outline"
                        className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg h-10"
                      >
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Wishlist Empty</h3>
              <p className="text-gray-500 mb-6">No items in your wishlist yet. Start adding your favorites!</p>
              <Link to="/products/featured-products">
                <Button className="bg-primary-gradient border-0 text-white hover:opacity-90 transition-smooth">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
