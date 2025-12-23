import { ArrowRight } from "lucide-react";
import { type Product } from "@/data/dummyData";
import { Link } from "react-router-dom";

interface ProductListColumnProps {
  title: string;
  products: Product[];
  linkTo: string;
}

export function ProductListColumn({ title, products, linkTo }: ProductListColumnProps) {
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

      <div className="flex flex-col gap-4">
        {products.map((product) => (
          <div key={product.id} className="flex gap-4 p-3 rounded-xl hover:bg-white hover:shadow-lg hover:shadow-black/5 transition-all duration-300 group cursor-pointer border border-transparent hover:border-gray-100">
            <div className="w-20 h-20 shrink-0 bg-gray-50 rounded-lg overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              />
            </div>
            <div className="flex flex-col justify-center gap-1 flex-1">
              <span className="text-xs text-gray-400 font-medium">{product.category}</span>
              <h4 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {product.name}
              </h4>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-primary">${product.price.toFixed(2)}</span>
                {product.oldPrice && (
                  <span className="text-xs text-gray-400 line-through">${product.oldPrice.toFixed(2)}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
