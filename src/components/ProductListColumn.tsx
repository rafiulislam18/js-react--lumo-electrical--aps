import { ArrowRight, ShoppingCart, Heart } from "lucide-react";
import { type Product } from "@/data/dummyData";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ProductListColumnProps {
  title: string;
  products: Product[];
  linkTo: string;
}

// Helper function to calculate discount percentage
const calculateDiscountPercentage = (oldPrice: number | undefined, currentPrice: number): number | null => {
  if (!oldPrice || oldPrice <= currentPrice) return null;
  return Math.round(((oldPrice - currentPrice) / oldPrice) * 100);
};

export function ProductListColumn({ title, products, linkTo }: ProductListColumnProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-2">
        <h3 className="font-display font-bold text-xl text-gray-900 relative">
          {title}
          <span className="absolute -bottom-2.5 left-0 w-12 h-1 bg-primary-gradient rounded-full"></span>
        </h3>
        <Link to={linkTo} className="text-sm font-medium text-gray-400 hover:text-primary flex items-center gap-1 transition-colors">
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {products.slice(0, 4).map((product) => {
          const discountPercent = calculateDiscountPercentage(product.oldPrice, product.price);

          return (
            <div 
              key={product.id} 
              className="group flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-white hover:shadow-lg hover:shadow-green-900/5 transition-smooth border border-transparent hover:border-green-200 cursor-pointer"
              onClick={() => navigate(`/product-details/${product.id}`)}
              role="button"
              tabIndex={0}
            >
              {/* Product Image */}
              <div className="relative w-full sm:w-24 h-32 sm:h-24 shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-smooth" 
                />
                
                {/* Discount Badge */}
                {discountPercent !== null && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-md">
                    -{discountPercent}%
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex flex-col justify-between flex-1 min-w-0">
                {/* Top Section */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{product.category}</span>
                  <h4 className="font-semibold text-gray-900 text-xs sm:text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h4>
                </div>

                {/* Bottom Section - Price & Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-2 sm:mt-0">
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-base sm:text-lg text-primary">${product.price.toFixed(2)}</span>
                      {product.oldPrice && (
                        <span className="text-xs text-gray-400 line-through">${product.oldPrice.toFixed(2)}</span>
                      )}
                    </div>
                    {discountPercent !== null && (
                      <span className="text-xs text-green-600 font-semibold">Save ${(product.oldPrice! - product.price).toFixed(2)}</span>
                    )}
                  </div>

                  {/* Action Buttons - Always Visible */}
                  <div className="flex gap-1.5 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-red-50 hover:text-red-500 transition-smooth shadow-sm border border-gray-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Add to wishlist', product.id);
                      }}
                      title="Add to Wishlist"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary-gradient hover:shadow-lg hover:shadow-green-600/30 transition-smooth shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Add to cart', product.id);
                      }}
                      title="Add to Cart"
                    >
                      <ShoppingCart className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
