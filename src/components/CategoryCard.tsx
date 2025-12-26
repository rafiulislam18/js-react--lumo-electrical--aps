import { type Category } from "@/data/dummyData";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <div className="group relative flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-green-900/5 hover:-translate-y-1 transition-smooth cursor-pointer overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
      
      <div className="relative z-10 w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-4 text-gray-500 group-hover:bg-white group-hover:text-primary group-hover:scale-110 group-hover:shadow-md transition-smooth">
        <category.icon className="w-7 h-7" />
      </div>
      
      <h3 className="relative z-10 font-medium text-gray-900 group-hover:text-primary transition-smooth mb-2">
        {category.name}
      </h3>
      
      <div className="relative z-10 w-6 h-6 rounded-full bg-white border border-gray-100 flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-smooth delay-75">
        <ArrowRight className="w-3 h-3 text-primary" />
      </div>
    </div>
  );
}
