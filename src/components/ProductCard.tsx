import { ShoppingCart, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Product } from "@/data/dummyData";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group relative flex flex-col items-center p-3 bg-white rounded-xl border border-transparent hover:border-green-100 hover:shadow-xl hover:shadow-green-900/5 transition-all duration-300">
      {/* Badge */}
      {product.badge && (
        <div className={`absolute top-3 left-3 z-10 px-2 py-1 text-xs font-bold text-white rounded-md shadow-sm
          ${product.badge === 'New' ? 'bg-blue-500' : ''}
          ${product.badge === 'Sale' ? 'bg-red-500' : ''}
          ${product.badge === 'Hot' ? 'bg-orange-500' : ''}
        `}>
          {product.badge}
        </div>
      )}

      {/* Wishlist Button - Hidden until hover */}
      <button className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md text-gray-400 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 hover:text-red-500 hover:bg-red-50">
        <Heart className="w-4 h-4" />
      </button>

      {/* Image Container */}
      <div className="relative w-full aspect-square mb-3 overflow-hidden rounded-lg bg-gray-50">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        
        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 translate-y-full group-hover:translate-y-0 transition-all duration-300 flex justify-center">
          <Button 
            size="sm" 
            className="w-full bg-white/90 backdrop-blur text-foreground hover:bg-white hover:text-primary shadow-lg"
            onClick={() => console.log('Quick view', product.id)}
          >
            Quick View
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="w-full flex flex-col gap-1">
        <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">{product.category}</div>
        <h3 className="font-medium text-gray-900 line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mt-1">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-200'}`} 
              />
            ))}
          </div>
          <span className="text-xs text-gray-400">({product.reviews})</span>
        </div>

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex flex-col">
            {product.oldPrice && (
              <span className="text-xs text-gray-400 line-through">${product.oldPrice.toFixed(2)}</span>
            )}
            <span className="font-bold text-lg text-gray-900">${product.price.toFixed(2)}</span>
          </div>
          
          <Button 
            size="icon" 
            className="rounded-full bg-primary-gradient shadow-lg shadow-green-600/20 hover:shadow-green-600/40 hover:-translate-y-0.5 transition-all duration-300"
            onClick={() => console.log('Add to cart', product.id)}
          >
            <ShoppingCart className="w-4 h-4 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
}
