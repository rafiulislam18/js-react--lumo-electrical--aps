import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { ProductListColumn } from "@/components/ProductListColumn";
import { Button } from "@/components/ui/button";
import { Loader, ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { apiGet } from "@/lib/api";

interface Product {
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
}

interface Category {
  id: number;
  name: string;
  slug: string;
  image: string | null;
}

interface FeaturedProduct {
  product: Product;
  created_at: string;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
  created_at: string;
  updated_at: string;
}

interface HomeResponse {
  featured_products: FeaturedProduct[];
  best_sellers: Product[];
  new_arrivals: Product[];
  parent_categories: Category[];
  faqs: FAQ[];
}

// Helper to get full image URL
const getImageUrl = (imagePath: string | undefined) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:8000';
  return `${baseUrl}${imagePath}`;
};

// Transform backend product to match ProductListColumn format
const transformProduct = (product: Product) => ({
  id: product.id.toString(),
  name: product.name,
  price: parseFloat(product.price),
  oldPrice: product.old_price ? parseFloat(product.old_price) : undefined,
  image: getImageUrl(product.image),
  category: product.category.name,
  categoryId: product.category.id.toString(),
  rating: product.avg_rating,
  reviews: product.total_reviews,
  badge: product.badge || undefined,
  inStock: product.in_stock,
});

export default function Home() {
  const { data: homeData, isLoading, isError } = useQuery<HomeResponse>({
    queryKey: ['home'],
    queryFn: () => apiGet<HomeResponse>('/home/'),
  });

  const featuredProducts = homeData?.featured_products?.map(fp => transformProduct(fp.product)) || [];
  const bestSellers = homeData?.best_sellers?.map(transformProduct) || [];
  const newArrivals = homeData?.new_arrivals?.map(transformProduct) || [];
  const parentCategories = homeData?.parent_categories || [];
  const faqsData = homeData?.faqs || [];

  const handleScrollToCategories = () => {
    const element = document.getElementById('categories-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col font-sans">
      {/* Hero Section */}
      <section className="relative w-full h-[450px] lg:h-[400px] overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          {/* add fade in effect in this img below */}
          <img 
            src="/images/home/new-hero-bg.jpeg"
            alt="Hero Background"
            className="w-full h-full object-cover animate-in fade-in duration-1000"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/40 to-black/40 animate-in fade-in duration-1000" />
        </div>

        {/* Content */}
        <div className="container relative z-10 h-full mx-auto flex flex-col justify-center items-center text-center">
          <div className="max-w-xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
            {/* <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium mb-6">
              New Collection 2024
            </span> */}
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-white leading-[1.1] mb-6 shadow-sm px-2">
              Power Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-400">
                Projects & Installations
              </span>
            </h1>
            <p className="text-md lg:text-lg text-gray-200 mb-8 leading-relaxed max-w-lg px-2">
              Premium electrical components, tools, and solutions for professionals and DIY enthusiasts. Everything you need for reliable installations and repairs inside Cape Town, SA.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 px-4">
              <Button size="lg" className="bg-primary-gradient border-0 hover:opacity-90 transition-smooth h-10 sm:h-12 px-6 sm:px-8 rounded-full text-sm sm:text-base font-semibold shadow-lg shadow-green-900/20 w-full sm:w-auto" onClick={handleScrollToCategories}>
                Shop Now
              </Button>
              <a href="/contact-us" target="_blank" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-gray-900 h-10 sm:h-12 px-6 sm:px-8 rounded-full text-sm sm:text-base font-semibold transition-smooth w-full">
                  Contact Us
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      {/* <section className="bg-white border-b border-gray-100 py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureItem 
              icon={Truck} 
              title="Free Shipping" 
              desc="On orders over $100" 
            />
            <FeatureItem 
              icon={ShieldCheck} 
              title="Secure Payment" 
              desc="100% secure payment" 
            />
            <FeatureItem 
              icon={RefreshCw} 
              title="30 Days Return" 
              desc="Money back guarantee" 
            />
            <FeatureItem 
              icon={Headset} 
              title="24/7 Support" 
              desc="Ready to help you" 
            />
          </div>
        </div>
      </section> */}

      {/* Categories Grid */}
      <section id="categories-section" className="py-20 container mx-auto px-4 animate-fade-in scroll-mt-16 lg:scroll-mt-32" style={{animationDelay: '0.1s'}}>
        <SectionHeader title="Explore by Category" subtitle="Browse our diverse collection of high-quality products" center />
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6 mt-12 animate-stagger">
          {parentCategories.map((cat: Category) => (
            <div key={cat.id} className="animate-slide-in-up">
              <CategoryCardWithImage category={cat} />
            </div>
          ))}
        </div>
      </section>

      {/* Product Lists (3 Columns) */}
      <section className="py-20 bg-gray-50 border-y border-gray-100 animate-fade-in" style={{animationDelay: '0.2s'}}>
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-96">
              <Loader className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : isError ? (
            <div className="text-center py-16">
              <p className="text-red-600 text-lg mb-4">Failed to load products. Please try again later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 animate-stagger">
              <div className="animate-slide-in-up">
                <ProductListColumn title="Featured Products" products={featuredProducts} linkTo="/products" />
              </div>
              <div className="animate-slide-in-up" style={{animationDelay: '0.1s'}}>
                <ProductListColumn title="Best Sellers" products={bestSellers} linkTo="/products?q=best-sellers" />
              </div>
              <div className="animate-slide-in-up" style={{animationDelay: '0.2s'}}>
                <ProductListColumn title="New Arrivals" products={newArrivals} linkTo="/products?q=new-arrivals" />
              </div>
            </div>
          )}
        </div>
        <span id="faq"/>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white animate-fade-in" style={{animationDelay: '0.3s'}}>
        <div className="container mx-auto px-4 max-w-4xl">
          <SectionHeader title="Frequently Asked Questions" subtitle="Got questions? We've got answers." center />
          
          <div className="mt-12 bg-gray-50 p-8 rounded-3xl border border-gray-100 animate-scale-in" style={{animationDelay: '0.4s'}}>
            <Accordion type="single" collapsible className="w-full">
              {faqsData.map((faq, index) => (
                <AccordionItem key={faq.id} value={faq.id.toString()} className="border-b-gray-200 last:border-0 transition-smooth" style={{animationDelay: `${0.4 + (index * 0.05)}s`}}>
                  <AccordionTrigger className="text-lg font-medium text-gray-900 hover:text-primary transition-colors py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-500 leading-relaxed pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ title, subtitle, center = false }: { title: string, subtitle: string, center?: boolean }) {
  return (
    <div className={`flex flex-col gap-3 ${center ? 'items-center text-center' : ''}`}>
      <h2 className="font-display font-bold text-3xl md:text-4xl text-gray-900 relative inline-block">
        {title}
        {center && <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-20 h-1 bg-primary-gradient rounded-full"></span>}
      </h2>
      <p className="text-gray-500 text-lg max-w-2xl">{subtitle}</p>
    </div>
  );
}

function CategoryCardWithImage({ category }: { category: Category }) {
  const categoryImage = category.image ? getImageUrl(category.image) : null;
  
  return (
    <a 
      href={`/${category.slug}`}
      className="group relative h-32 md:h-40 lg:h-48 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 shadow-sm hover:shadow-lg transition-all duration-300 flex items-end"
    >
      {/* Background Image */}
      {categoryImage && (
        <img
          src={categoryImage}
          alt={category.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
      )}
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-all duration-300" />
      
      {/* Content */}
      <div className="relative z-10 w-full p-4 flex items-center justify-center grid grid-rows">
        <h3 className="text-white text-sm md:text-base lg:text-lg font-semibold text-center group-hover:text-primary-light transition-colors duration-300 line-clamp-2">
          {category.name}
        </h3>
        {/* Shop now text */}
        <p className="text-primary text-center text-xs md:text-sm mt-1">
          Shop Now
          {/* a right arrow that moves a bit right upon hover with animation */}
          <ArrowRight className="inline-block ml-1 group-hover:translate-x-1 transition-transform duration-300 w-3 h-3" />
        </p>
      </div>
      
      {/* Hover indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-gradient transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </a>
  );
}
