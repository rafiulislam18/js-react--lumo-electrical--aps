import { type Category } from "@/data/dummyData";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/${category.slug}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group relative flex aspect-[5/4] flex-col justify-end overflow-hidden rounded-[24px] bg-[#f7f6f1] dark:bg-[#141814] border border-[rgba(22,25,26,.1)] dark:border-white/10 cursor-pointer transition duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-[3px] hover:border-[rgba(57,151,70,.35)] hover:shadow-[0_16px_40px_rgba(22,25,26,.08)] dark:hover:border-[rgba(168,214,62,.3)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,.5)]"
    >
      {/* Icon */}
      <div className="absolute inset-0 flex items-center justify-center text-[#2f8b3d] dark:text-[#a8d63e] transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-110">
        <category.icon className="w-12 h-12" />
      </div>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to top,rgba(10,14,8,.9),rgba(10,14,8,.05) 65%)" }}
      />

      {/* Label */}
      <div className="relative z-10 p-4">
        <div className="font-bold text-[.92rem] text-white leading-tight">
          {category.name}
        </div>
        <div className="inline-flex items-center gap-1 text-[.6rem] font-bold tracking-[.14em] uppercase mt-1 text-[#a8d63e]">
          Shop <ArrowRight className="w-2.5 h-2.5" />
        </div>
      </div>

      {/* Lime underline */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#a8d63e] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-[24px]" />
    </div>
  );
}
