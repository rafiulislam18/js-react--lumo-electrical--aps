import { ShoppingCart, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Product } from "@/data/dummyData";

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

  return (
    <div className="group relative flex flex-col items-center p-4 bg-white rounded-xl border border-transparent hover:border-green-200 hover:shadow-xl hover:shadow-green-900/8 transition-smooth">
      {/* Top Left Badge */}
      {product.badge && (
        <div className={`absolute top-3 left-3 z-20 px-2.5 py-1.5 text-xs font-bold text-white rounded-lg shadow-md backdrop-blur-sm
          ${product.badge === 'New' ? 'bg-blue-500' : ''}
          ${product.badge === 'Sale' ? 'bg-red-500' : ''}
          ${product.badge === 'Hot' ? 'bg-orange-500' : ''}
        `}>
          {product.badge}
        </div>
      )}

      {/* Discount Badge - Top Right */}
      {discountPercent !== null && (
        <div className="absolute top-3 right-3 z-20 bg-red-500 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-md flex items-center gap-1">
          <span>-{discountPercent}%</span>
        </div>
      )}

      {/* Wishlist Button - Hidden until hover */}
      <button className="absolute top-16 right-3 z-10 p-2.5 bg-white rounded-full shadow-md text-gray-400 opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 transition-smooth hover:text-red-500 hover:bg-red-50 border border-gray-100 hover:border-red-200" title="Add to Wishlist">
        <Heart className="w-4 h-4" />
      </button>

      {/* Image Container */}
      <div className="relative w-full aspect-square mb-4 overflow-hidden rounded-lg bg-gray-50 border border-gray-100">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-smooth ease-out"
        />
        
        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 translate-y-full group-hover:translate-y-0 transition-smooth flex justify-center bg-gradient-to-t from-black/10">
          <Button 
            size="sm" 
            className="w-full bg-white/95 backdrop-blur text-gray-900 hover:bg-white hover:text-primary shadow-lg font-semibold"
            onClick={() => console.log('Quick view', product.id)}
          >
            Quick View
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="w-full flex flex-col gap-2">
        <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">{product.category}</div>
        <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-smooth text-sm leading-tight">
          {product.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-200'}`} 
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 font-medium">({product.reviews})</span>
        </div>

        {/* Price Section */}
        <div className="flex flex-col gap-1.5 py-2 border-t border-b border-gray-100">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-lg text-primary">${product.price.toFixed(2)}</span>
            {product.oldPrice && (
              <span className="text-xs text-gray-400 line-through">${product.oldPrice.toFixed(2)}</span>
            )}
          </div>
          {discountPercent !== null && (
            <span className="text-xs text-green-600 font-bold">
              You save ${(product.oldPrice! - product.price).toFixed(2)}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm"
            variant="outline"
            className="flex-1 rounded-lg border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-500 transition-smooth text-sm font-medium"
            onClick={() => console.log('Add to wishlist', product.id)}
            title="Add to Wishlist"
          >
            <Heart className="w-4 h-4" />
          </Button>
          <Button 
            size="sm"
            className="flex-1 rounded-lg bg-primary-gradient shadow-lg shadow-green-600/20 hover:shadow-green-600/40 hover:-translate-y-0.5 transition-smooth font-medium text-white"
            onClick={() => console.log('Add to cart', product.id)}
            title="Add to Cart"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
