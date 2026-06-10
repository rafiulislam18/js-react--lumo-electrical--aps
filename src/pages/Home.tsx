import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductListColumn } from "@/components/ProductListColumn";
import { Loader, ArrowRight, Zap, Shield, Truck, Wrench, Package } from "lucide-react";
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
  category: { id: number; name: string; slug: string };
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
  featured_categories: Category[];
  faqs: FAQ[];
}

const getImageUrl = (imagePath: string | undefined) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:8000';
  return `${baseUrl}${imagePath}`;
};

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
  badge: (product.badge || undefined) as 'New' | 'Sale' | 'Hot' | undefined,
  inStock: product.in_stock,
});

/* ── Animated counter ── */
function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1800;
        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 4);
          setCount(Math.round(eased * target));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function Home() {
  const { data: homeData, isLoading, isError } = useQuery<HomeResponse>({
    queryKey: ['home'],
    queryFn: () => apiGet<HomeResponse>('/home/'),
  });

  const featuredProducts = homeData?.featured_products?.map(fp => transformProduct(fp.product)) || [];
  const bestSellers   = homeData?.best_sellers?.map(transformProduct) || [];
  const newArrivals   = homeData?.new_arrivals?.map(transformProduct) || [];
  const featuredCategories = homeData?.featured_categories || [];
  const faqsData      = homeData?.faqs || [];

  /* Concept's .pcard hover-lift: subtle raise + soft shadow, deeper shadow in dark mode */
  const pcardBase =
    "transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(.22,1,.36,1)] " +
    "hover:shadow-[0_16px_40px_rgba(20,22,15,.12)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,.5)]";
  const pcard = `${pcardBase} hover:-translate-y-[5px]`;            // hero tiles
  const pcardSubtle = `${pcardBase} hover:-translate-y-[2px]`;     // trust cards (gentler)

  return (
    <div className="font-outfit bg-white dark:bg-dark-elevated-900 text-[#f0f2ed]">

      {/* ══ HERO (BENTO GRID) ══ */}
      <section className="bg-white dark:bg-dark-elevated-900 pt-6 sm:pt-8 pb-10 sm:pb-14">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4">

            {/* Headline tile */}
            <div
              className={`${pcard} group rounded-[24px] lg:col-span-2 lg:row-span-2 p-7 sm:p-10 flex flex-col justify-between relative overflow-hidden animate-[hero-rise_.6s_cubic-bezier(.22,1,.36,1)_both]`}
              style={{ background: 'linear-gradient(150deg,#399746,#a8d63e)', minHeight: '340px' }}
            >
              <div className="pointer-events-none absolute -right-16 -bottom-16 w-72 h-72 rounded-full bg-white/[.14] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-125" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 text-[.72rem] font-semibold tracking-wide px-3 py-1.5 rounded-full mb-6 bg-[rgba(10,12,8,.16)] text-[#0a0c08]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0a0c08]" /> Cape Town's Premier Electrical Supplier
                </div>
                <h1 className="font-bebas leading-[.92] tracking-[.01em] text-[#0a0c08] text-[clamp(2.6rem,6vw,4.6rem)]">
                  Everything electrical, in one place.
                </h1>
              </div>
              <div className="relative mt-8">
                <p className="text-[.96rem] leading-relaxed max-w-[420px] mb-6 text-[rgba(10,12,8,.72)]">
                  Breakers, cable, lighting and solar — professional-grade gear for trade and home, dispatched same week.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-[.88rem] font-bold text-white bg-[#14160f] border-0 cursor-pointer transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    <Zap size={16} /> Shop now
                  </button>
                  <a
                    href="/contact-us"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-[.88rem] font-bold bg-white/[.85] text-[#14160f] no-underline transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    Get a quote
                  </a>
                </div>
              </div>
            </div>

            {/* Image tile */}
            <div className={`${pcard} group rounded-[24px] lg:col-span-2 relative overflow-hidden animate-[hero-rise_.6s_cubic-bezier(.22,1,.36,1)_.08s_both]`} style={{ minHeight: '200px' }}>
              <img src="/images/home/new-hero-bg.jpeg" alt="Lumo Electrical" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-105" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to right,rgba(8,11,8,.7),transparent 70%)' }} />
              <div className="absolute left-6 top-6">
                <div className="font-bebas text-white leading-none text-[2.4rem]">SANS<br />certified</div>
                <div className="text-[.8rem] mt-2 text-white/70">Quality you can wire with confidence</div>
              </div>
            </div>

            {/* Stat tile — products in stock (inverted "ink" tile: dark in light mode, light in dark mode) */}
            <div className={`${pcard} group rounded-[24px] p-6 flex flex-col justify-between bg-[#14160f] dark:bg-[#f1f3ea] animate-[hero-rise_.6s_cubic-bezier(.22,1,.36,1)_.16s_both]`} style={{ minHeight: '150px' }}>
              <span className="relative grid place-items-center w-11 h-11 -m-[10px]">
                <span className="absolute inset-0 rounded-full bg-[#a8d63e]/25 scale-0 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-100" />
                <Package size={24} className="relative text-[#a8d63e] dark:text-[#34883f]" />
              </span>
              <div>
                <div className="font-bebas leading-none text-[2.6rem] text-white dark:text-[#14160f]">
                  <AnimatedNumber target={5000} />
                  <span className="text-[#a8d63e] dark:text-[#34883f]">+</span>
                </div>
                <div className="text-[.78rem] mt-1.5 text-white/65 dark:text-[rgba(20,22,15,.6)]">products in stock</div>
              </div>
            </div>

            {/* Free delivery tile (surface tile) */}
            <div className={`${pcard} group rounded-[24px] p-6 flex flex-col justify-between bg-white dark:bg-dark-elevated-800 border border-[rgba(26,26,26,.1)] dark:border-white/10 animate-[hero-rise_.6s_cubic-bezier(.22,1,.36,1)_.24s_both]`} style={{ minHeight: '150px' }}>
              <span className="relative grid place-items-center w-11 h-11 -m-[10px]">
                <span className="absolute inset-0 rounded-full bg-[#3aaa49]/15 dark:bg-[#a8d63e]/20 scale-0 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-100" />
                <Truck size={24} className="relative text-[#34883f] dark:text-[#a8d63e]" />
              </span>
              <div>
                <div className="font-bebas leading-none text-[2.6rem] text-[#14160f] dark:text-[#f1f3ea]">Free</div>
                <div className="text-[.78rem] mt-1.5 text-[rgba(20,22,15,.6)] dark:text-[rgba(241,243,234,.6)]">delivery across Cape Town</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ TICKER ══ */}
      <div className="bg-[#a8d63e] overflow-hidden py-[.55rem]">
        <div className="flex gap-12 animate-ticker w-max">
          {[...Array(2)].map((_, i) =>
            ['Free delivery in Cape Town','5000+ products in stock','Trade accounts available','Professional grade quality','Same-week dispatch','10 years trusted service'].map((t, j) => (
              <span key={`${i}-${j}`} className="font-outfit font-bold text-[.7rem] tracking-[.12em] uppercase text-[#0a0c0a] whitespace-nowrap flex items-center gap-[.6rem]">
                <Zap size={10} /> {t} <span className="w-1 h-1 rounded-full bg-[rgba(10,12,10,.35)]" />
              </span>
            ))
          )}
        </div>
      </div>

      {/* ══ TRUST BAR (cards) ══ */}
      <div className="bg-white dark:bg-dark-elevated-900">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-14 py-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { icon: Truck,  title: '100% Free Delivery', desc: 'For orders of at least R1000 in Cape Town' },
              { icon: Shield, title: 'Quality Guaranteed', desc: 'All products meet SA SANS standards' },
              { icon: Zap,    title: '5000+ Products',     desc: 'Largest local electrical range' },
              { icon: Wrench, title: 'Trade Accounts',     desc: 'Exclusive pricing for the trade' },
            ].map(({ icon: Icon, title, desc }, i) => {
              const inverted = i === 0;
              return (
                <div
                  key={title}
                  className={`${pcardSubtle} group rounded-[24px] p-6 border ${
                    inverted
                      ? 'bg-[#14160f] dark:bg-[#f1f3ea] border-transparent'
                      : 'bg-white dark:bg-dark-elevated-800 border-[rgba(26,26,26,.1)] dark:border-white/10'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl grid place-items-center mb-4 transition-[background-color,color] duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:bg-primary-gradient group-hover:text-white ${
                      inverted
                        ? 'bg-[rgba(168,214,62,.16)] dark:bg-[rgba(52,136,63,.12)] text-[#a8d63e] dark:text-[#34883f]'
                        : 'bg-[#e4e6dd] dark:bg-white/5 text-[#3aaa49] dark:text-[#a8d63e]'
                    }`}
                  >
                    <Icon size={20} />
                  </div>
                  <div className={`font-bold text-[.96rem] mb-1 ${inverted ? 'text-white dark:text-[#14160f]' : 'text-[#1a1a1a] dark:text-[#f0f2ed]'}`}>
                    {title}
                  </div>
                  <div className={`text-[.82rem] leading-relaxed ${inverted ? 'text-white/60 dark:text-[rgba(20,22,15,.6)]' : 'text-[rgba(26,26,26,.6)] dark:text-white/60'}`}>
                    {desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══ CATEGORIES ══ */}
      <div
        className="bg-gradient-to-b from-gray-50 to-white dark:from-dark-elevated-950 dark:to-dark-elevated-900 py-20"
        id="categories-section"
        style={{ scrollMarginTop: '5rem' }}
      >
        <div className="max-w-[1280px] mx-auto px-8">
          {/* Header */}
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-[.68rem] font-bold tracking-[.2em] uppercase text-[#3aaa49] dark:text-[#a8d63e] mb-[.8rem] before:content-[''] before:w-6 before:h-0.5 before:bg-[#3aaa49] dark:before:bg-[#a8d63e] before:rounded-sm before:shrink-0">
                Browse
              </div>
              <h2 className="font-bebas text-[clamp(1.8rem,5vw,4rem)] leading-none text-[#1a1a1a] dark:text-[#f0f2ed] mb-2">Shop by Category</h2>
            </div>
            {/* <a
              href="/products"
              className="text-[.78rem] font-semibold tracking-[.1em] uppercase text-[#3aaa49] dark:text-[#a8d63e] no-underline flex items-center gap-[.4rem] transition-[gap] duration-200 hover:gap-[.7rem]"
            >
              All Products <ArrowRight size={13} />
            </a> */}
          </div>

          {/* Grid — Voltage concept: squared cards, hairline dividers, image zoom + lime underline on hover */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-[rgba(26,26,26,.1)] dark:bg-white/10">
            {featuredCategories.map((cat: Category) => {
              const img = cat.image ? getImageUrl(cat.image) : null;
              return (
                <a
                  key={cat.id}
                  href={`/${cat.slug}`}
                  className="group relative block aspect-[5/4] overflow-hidden bg-[#141814] no-underline rounded-2x"
                >
                  {img && (
                    <img
                      src={img}
                      alt={cat.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover [filter:grayscale(.3)_brightness(.62)] transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(6,9,7,.9),transparent_70%)]" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="font-bold text-[.92rem] text-white leading-tight">{cat.name}</div>
                    <div className="inline-flex items-center gap-1 text-[.6rem] font-bold tracking-[.14em] uppercase mt-1 text-[#a8d63e]">
                      Shop <ArrowRight size={10} />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#a8d63e] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══ PRODUCTS ══ */}
      <div className="bg-gradient-to-b from-gray-50 to-white dark:from-dark-elevated-950 dark:to-dark-elevated-900 py-20">
        <div className="max-w-[1280px] mx-auto px-8">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 text-[.68rem] font-bold tracking-[.2em] uppercase text-[#3aaa49] dark:text-[#a8d63e] mb-[.8rem] before:content-[''] before:w-6 before:h-0.5 before:bg-[#3aaa49] dark:before:bg-[#a8d63e] before:rounded-sm before:shrink-0">
              Products
            </div>
            <h2 className="font-bebas text-[clamp(2.6rem,5vw,4rem)] leading-none text-[#1a1a1a] dark:text-[#f0f2ed] mb-2">What's Hot Right Now</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader size={32} className="text-[#a8d63e] animate-spin" />
            </div>
          ) : isError ? (
            <div className="text-center py-20 text-red-500">
              Failed to load products. Please try again later.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-px max-[1024px]:grid-cols-2 max-[720px]:grid-cols-1 max-[480px]:gap-0">
              {[
                { title: 'Featured',     products: featuredProducts, link: '/products' },
                { title: 'Best Sellers', products: bestSellers,      link: '/products?q=best-sellers' },
                { title: 'New Arrivals', products: newArrivals,      link: '/products?q=new-arrivals' },
              ].map(col => (
                <div key={col.title} className="p-10 font-semibold max-[1024px]:p-8 max-[480px]:p-4">
                  <div className="flex items-center justify-between pb-[1.2rem] mb-[1.75rem] border-b-2 border-[rgba(26,26,26,.8)] dark:border-white/[0.8]">
                    <span className="font-bebas text-[1.4rem] max-[480px]:text-[1rem] text-[#1a1a1a] dark:text-[#f0f2ed] tracking-[.04em]">{col.title}</span>
                    <a
                      href={col.link}
                      className="text-[.68rem] max-[480px]:text-[.6rem] font-semibold tracking-[.1em] uppercase text-[#3aaa49] dark:text-[#a8d63e] no-underline flex items-center gap-[.3rem] transition-[gap] duration-200 hover:gap-[.55rem]"
                    >
                      View all <ArrowRight size={11} />
                    </a>
                  </div>
                  <ProductListColumn title={col.title} products={col.products} linkTo={col.link} />
                </div>
              ))}
            </div>
          )}
        </div>
        <span id="faq" />
      </div>

      {/* ══ FAQ ══ */}
      <div className="bg-gradient-to-b from-gray-50 to-white dark:from-dark-elevated-950 dark:to-dark-elevated-900 py-20">
        <div className="max-w-[1280px] mx-auto px-8">
          <div className="grid grid-cols-[1fr_2fr] gap-24 items-start max-[768px]:grid-cols-1 max-[768px]:gap-10">

            {/* Sticky sidebar */}
            <div className="md:sticky top-28">
              <div className="inline-flex items-center gap-2 text-[.68rem] font-bold tracking-[.2em] uppercase text-[#3aaa49] dark:text-[#a8d63e] mb-[.8rem] before:content-[''] before:w-6 before:h-0.5 before:bg-[#3aaa49] dark:before:bg-[#a8d63e] before:rounded-sm before:shrink-0">
                Support
              </div>
              <h2 className="font-bebas text-[clamp(2.6rem,5vw,4rem)] leading-none text-[#1a1a1a] dark:text-[#f0f2ed] mb-2">Got Questions?</h2>
              <p className="text-[.95rem] text-[rgba(26,26,26,.5)] dark:text-[rgba(240,242,237,.45)] font-light max-w-[400px] mb-8">
                Everything you need to know before placing your order.
              </p>
              <a
                href="/contact-us"
                className="inline-flex items-center gap-[.6rem] font-outfit font-bold text-[.82rem] tracking-[.04em] uppercase px-[2.2rem] py-[.9rem] rounded-[4px] bg-gradient-to-r from-[#3aaa49] to-[#a8d63e] text-white dark:text-[#0a0c0a] shadow-[0_0_32px_rgba(58,170,73,.28)] dark:shadow-[0_0_32px_rgba(168,214,62,.28)] no-underline transition-[box-shadow,transform] duration-200 hover:shadow-[0_0_48px_rgba(58,170,73,.45)] hover:-translate-y-0.5 dark:hover:shadow-[0_0_48px_rgba(168,214,62,.45)]"
              >
                Contact Us <ArrowRight size={14} />
              </a>
            </div>

            {/* FAQ accordion */}
            <div>
              <Accordion type="single" collapsible>
                {faqsData.map((faq) => (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id.toString()}
                    className="border-0 border-b border-[rgba(26,26,26,.08)] dark:border-[rgba(255,255,255,.07)]"
                  >
                    <AccordionTrigger className="font-outfit font-semibold text-[.98rem] text-[#1a1a1a] hover:text-[#3aaa49] dark:hover:text-[#a8d63e] dark:text-[#f0f2ed] py-6 text-left leading-[1.4]">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-[.92rem] text-[rgba(26,26,26,.55)] dark:text-[rgba(240,242,237,.45)] leading-[1.8] pb-6 font-light">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
