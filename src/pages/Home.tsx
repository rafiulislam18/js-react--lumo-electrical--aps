import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CategoryCard } from "@/components/CategoryCard";
import { ProductListColumn } from "@/components/ProductListColumn";
import { 
  categories, featuredProducts, bestSellers, latestProducts, 
  heroBanner, faqs 
} from "@/data/dummyData";
import { Button } from "@/components/ui/button";
import { Truck, ShieldCheck, RefreshCw, Headset } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative w-full h-[500px] lg:h-[600px] overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBanner} 
            alt="Hero Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="container relative z-10 h-full mx-auto px-4 flex flex-col justify-center">
          <div className="max-w-xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium mb-6">
              New Collection 2024
            </span>
            <h1 className="text-5xl lg:text-7xl font-display font-bold text-white leading-[1.1] mb-6 shadow-sm">
              Discover Quality <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-400">
                Sustainable Living
              </span>
            </h1>
            <p className="text-lg text-gray-200 mb-8 leading-relaxed max-w-lg">
              Upgrade your lifestyle with our curated selection of premium, eco-friendly products designed for the modern home.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-primary-gradient border-0 hover:opacity-90 transition-opacity h-12 px-8 rounded-full text-base font-semibold shadow-lg shadow-green-900/20">
                Shop Now
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-gray-900 h-12 px-8 rounded-full text-base font-semibold transition-all">
                View Collections
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white border-b border-gray-100 py-10">
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
      </section>

      {/* Categories Grid */}
      <section className="py-20 container mx-auto px-4">
        <SectionHeader title="Shop by Category" subtitle="Browse our diverse collection of premium products" />
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6 mt-12">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* Product Lists (3 Columns) */}
      <section className="py-20 bg-gray-50 border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
            <ProductListColumn title="Featured Products" products={featuredProducts} linkTo="/featured" />
            <ProductListColumn title="Best Sellers" products={bestSellers} linkTo="/best-sellers" />
            <ProductListColumn title="New Arrivals" products={latestProducts} linkTo="/new" />
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="container mx-auto px-4 py-20">
        <div className="rounded-3xl overflow-hidden relative bg-gray-900 h-[400px] flex items-center shadow-2xl shadow-gray-200">
          <img 
            src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1600&q=80" 
            alt="Promo" 
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          
          <div className="relative z-10 max-w-2xl px-8 md:px-16">
            <span className="text-green-400 font-bold tracking-wider text-sm uppercase mb-4 block">Limited Time Offer</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 leading-tight">
              Get 50% Off On Your <br /> First Purchase
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-md">
              Sign up for our newsletter and unlock exclusive deals on premium sustainable products.
            </p>
            <div className="flex gap-4">
              <Button size="lg" className="bg-primary-gradient border-0 hover:opacity-90 h-12 px-8 rounded-full">
                Get Discount
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <SectionHeader title="Frequently Asked Questions" subtitle="Got questions? We've got answers." center />
          
          <div className="mt-12 bg-gray-50 p-8 rounded-3xl border border-gray-100">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id} className="border-b-gray-200 last:border-0">
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

      <Footer />
    </div>
  );
}

function FeatureItem({ icon: Icon, title, desc }: { icon: React.ElementType, title: string, desc: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-300 group cursor-default">
      <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0 group-hover:bg-primary-gradient group-hover:text-white transition-all duration-300 shadow-sm">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h4 className="font-bold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
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
