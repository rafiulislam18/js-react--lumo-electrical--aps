import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductListColumn } from "@/components/ProductListColumn";
import { Loader, ArrowRight, Zap, Shield, Truck, Wrench } from "lucide-react";
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

/* ── Scroll-triggered fade-in hook ── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

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

  const trustReveal  = useReveal(0.15);

  /* reveal transition classes */
  const revealBase = "opacity-0 translate-y-8 transition-[opacity,transform] duration-700 ease-out";
  const revealVisible = "!opacity-100 !translate-y-0";

  return (
    <div className="font-outfit bg-white dark:bg-dark-elevated-900 text-[#f0f2ed]">

      {/* ══ HERO ══ */}
      <section
        className="relative grid place-items-center overflow-hidden mt-[-111px]"
        style={{ height: 'calc(100svh - 34px)', minHeight: '600px', maxHeight: '900px' }}
      >
        <img
          src="/images/home/new-hero-bg.jpeg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover animate-[zoomOut_14s_ease-out_forwards]"
        />

        {/* Light overlay */}
        {/* <div className="absolute inset-0 dark:hidden"
          style={{ background: 'linear-gradient(to right, rgba(250,250,248,.94) 0%, rgba(250,250,248,.65) 55%, rgba(250,250,248,.28) 100%), linear-gradient(to top, rgba(250,250,248,.85) 0%, transparent 50%)' }}
        /> */}
        {/* Dark overlay */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(4,8,4,.92) 0%, rgba(4,8,4,.6) 55%, rgba(4,8,4,.25) 100%), linear-gradient(to top, rgba(4,8,4,.8) 0%, transparent 50%)' }}
        />

        <div className="relative z-[2] max-w-[1280px] w-full mx-auto mt-[9vh] px-8 animate-[riseIn_.9s_cubic-bezier(.22,1,.36,1)_both]">
          {/* Hero tag */}
          <div className="inline-flex items-center gap-[.45rem] text-[.72rem] font-semibold tracking-[.18em] uppercase border px-[.85rem] py-[.3rem] rounded-[4px] mb-[1.6rem] backdrop-blur-[4px] text-[#a8d63e] border-[rgba(168,214,62,.35)] bg-[rgba(168,214,62,.05)]">
            <Zap size={10} />
            Cape Town's Premier Electrical Supplier
          </div>

          <h1 className="font-bebas text-[clamp(4.5rem,10vw,8.5rem)] leading-[.95] tracking-[.01em] text-white mb-[1.5rem]">
            Wire It.<br />
            <em className="not-italic [WebkitTextFillColor:transparent] [-webkit-text-fill-color:transparent] [-webkit-text-stroke:2px_#a8d63e] dark:[-webkit-text-stroke-color:2px_#a8d63e]">Right.</em>
          </h1>

          <p className="text-[1.05rem] leading-[1.75] font-light text-[rgba(240,242,237,.6)] max-w-[480px] mb-[2.5rem]">
            Premium electrical components, tools and solutions trusted by professionals and builders across Cape Town, South Africa.
          </p>

          <div className="flex flex-wrap gap-4 items-center">
            <button
              className="inline-flex items-center gap-[.6rem] font-outfit font-bold text-[.9rem] tracking-[.04em] uppercase px-[2.2rem] py-[.9rem] rounded-[4px] border-0 cursor-pointer bg-gradient-to-r from-[#3aaa49] to-[#a8d63e] text-white dark:text-[#0a0c0a] shadow-[0_0_32px_rgba(58,170,73,.28)] dark:shadow-[0_0_32px_rgba(168,214,62,.28)] no-underline transition-[box-shadow,transform] duration-200 hover:shadow-[0_0_48px_rgba(58,170,73,.45)] hover:-translate-y-0.5 dark:hover:shadow-[0_0_48px_rgba(168,214,62,.45)]"
              onClick={() => document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Zap size={15} /> Shop Now
            </button>
            <a
              href="/contact-us"
              className="inline-flex items-center gap-[.6rem] font-outfit font-semibold text-[.9rem] tracking-[.04em] uppercase px-[2.2rem] py-[.9rem] rounded-[4px] cursor-pointer bg-white dark:bg-[#0a0c0a] border border-white/[0.1] text-[rgba(26,26,26,.9)] dark:text-[rgba(240,242,237,.85)] hover:text-[rgba(240,242,237,.85)] no-underline transition-[border-color,background] duration-200 hover:border-[rgba(58,170,73,.7)] hover:bg-[rgba(58,170,73,.08)] dark:hover:border-[rgba(168,214,62,.6)] dark:hover:bg-[rgba(168,214,62,.06)]"
            >
              Get a Quote
            </a>
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

      {/* ══ TRUST BAR (simple) ══ */}
      <div className="bg-white dark:bg-dark-elevated-900 border-t border-b border-[rgba(26,26,26,.1)] dark:border-[rgba(255,255,255,.06)]">
        <div className="max-w-[1280px] mx-auto px-8">
          <div className="grid grid-cols-4 max-[1024px]:grid-cols-2 max-[480px]:grid-cols-1">
            {[
              { icon: Truck,   title: 'Cape Town Delivery',  desc: 'Fast dispatch across the metro' },
              { icon: Shield,  title: 'Quality Guaranteed',  desc: 'All products meet SA standards'  },
              { icon: Zap,     title: '5000+ Products',      desc: 'Largest local electrical range'  },
              { icon: Wrench,  title: 'Trade Accounts',      desc: 'Exclusive pricing for the trade'  },
            ].map(({ icon: Icon, title, desc }, idx) => (
              <div
                key={title}
                className={`group flex flex-col items-center text-center py-8 px-4 gap-3 border-r border-[rgba(26,26,26,.1)] dark:border-[rgba(255,255,255,.06)] max-[480px]:py-6 max-[480px]:px-4 max-[480px]:border-r-0${idx === 3 ? ' border-r-0' : ''}`}
              >
                <div className="w-12 h-12 rounded-[8px] bg-[rgba(58,170,73,.1)] border border-[rgba(58,170,73,.25)] dark:bg-[rgba(168,214,62,.1)] dark:border-[rgba(168,214,62,.2)] grid place-items-center text-[#3aaa49] dark:text-[#a8d63e] transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-[#3aaa49] group-hover:to-[#a8d63e] group-hover:border-transparent group-hover:text-white dark:group-hover:text-[#0a0c0a] group-hover:shadow-[0_4px_20px_rgba(58,170,73,.35)] dark:group-hover:shadow-[0_4px_20px_rgba(168,214,62,.25)]">
                  <Icon size={20} />
                </div>
                <span className="font-bold text-[.95rem] text-[#1a1a1a] dark:text-[#f0f2ed]">{title}</span>
                <span className="text-[.78rem] text-[rgba(26,26,26,.5)] dark:text-[rgba(240,242,237,.4)] font-light">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* ══ TRUST BAR (animated) ══ */}
      {/* <div
        ref={trustReveal.ref}
        className={`bg-gradient-to-b from-gray-50 to-white dark:from-dark-elevated-900 border-t border-b border-[rgba(0,0,0,.05)] dark:border-[rgba(255,255,255,.04)] ${revealBase} ${trustReveal.visible ? revealVisible : ''}`}
      >
        <div className="max-w-[1320px] mx-auto px-8">
          <div className="grid grid-cols-4 gap-6 py-14 max-[768px]:grid-cols-2 max-[480px]:grid-cols-1">
            {[
              { icon: Truck,   num: 100,  suffix: '%', title: 'Free Delivery',     desc: 'Free shipping across Cape Town metro area' },
              { icon: Shield,  num: 100,  suffix: '%', title: 'Quality Guaranteed', desc: 'All products meet SA SANS standards' },
              { icon: Zap,     num: 5000, suffix: '+', title: 'Products in Stock',  desc: 'Largest electrical range in the Cape' },
              { icon: Wrench,  num: 10,   suffix: '+', title: 'Years Trusted',      desc: 'Exclusive trade pricing for professionals' },
            ].map(({ icon: Icon, num, suffix, title, desc }, i) => (
              <div
                key={title}
                className={`relative flex flex-col items-center text-center p-8 rounded-2xl bg-[rgba(255,255,255,.7)] dark:bg-[rgba(255,255,255,.03)] backdrop-blur-[12px] border border-[rgba(0,0,0,.06)] dark:border-[rgba(255,255,255,.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,.06)] hover:border-[rgba(58,170,73,.2)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,.3)] dark:hover:border-[rgba(168,214,62,.15)] group ${revealBase} ${trustReveal.visible ? revealVisible : ''}`}
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <div className="w-[52px] h-[52px] rounded-[14px] grid place-items-center bg-[linear-gradient(135deg,rgba(58,170,73,.1),rgba(168,214,62,.1))] border border-[rgba(58,170,73,.15)] dark:border-[rgba(168,214,62,.15)] text-green-brand dark:text-lime-brand mb-5 transition-all duration-300 group-hover:bg-[linear-gradient(135deg,#3aaa49,#a8d63e)] group-hover:text-white dark:group-hover:text-[#0a0c0a] group-hover:border-transparent group-hover:shadow-[0_4px_20px_rgba(58,170,73,.25)]">
                  <Icon size={22} />
                </div>
                <div className="font-bebas text-[2rem] text-[#1a1a1a] dark:text-[#f0f2ed] leading-none mb-1">
                  <AnimatedNumber target={num} suffix={suffix} />
                </div>
                <span className="font-bold text-[0.88rem] text-[#1a1a1a] dark:text-[#f0f2ed] mb-1">{title}</span>
                <span className="text-[0.78rem] text-[rgba(26,26,26,.45)] dark:text-[rgba(240,242,237,.4)] font-light leading-[1.6]">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      {/* ══ CATEGORIES ══ */}
      <div
        className="bg-gradient-to-b from-gray-50 to-white dark:from-dark-elevated-950 dark:to-dark-elevated-900 py-28"
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

          {/* Grid */}
          <div
            className="grid gap-3 max-[768px]:gap-2"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
            }}
          >
            {featuredCategories.map((cat: Category, i: number) => {
              const img = cat.image ? getImageUrl(cat.image) : null;
              return (
                <a
                  key={cat.id}
                  href={`/${cat.slug}`}
                  className={`group relative rounded-[8px] overflow-hidden bg-[#141814] no-underline block border border-[rgba(255,255,255,.7)] dark:border-[rgba(255,255,255,.05)] transition-[border-color] duration-300 h-[240px] max-[768px]:h-[200px] max-[480px]:h-[180px]`}
                >
                  {img && (
                    <img
                      src={img}
                      alt={cat.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover brightness-[.8] transition-[transform,filter] duration-700 ease-[cubic-bezier(.25,.46,.45,.94)] group-hover:scale-[1.05] group-hover:brightness-[.6]"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(4,8,4,.92)] via-transparent to-transparent" />
                  {/* {i === 0 && (
                    <span className="absolute top-4 left-4 bg-[rgba(168,214,62,.15)] border border-[rgba(168,214,62,.3)] text-[#a8d63e] text-[.6rem] font-bold tracking-[.12em] uppercase px-[.65rem] py-[.25rem] rounded-[3px]">
                      Featured
                    </span>
                  )} */}
                  <div className="absolute inset-0 flex flex-col justify-end p-[1.4rem] max-[480px]:p-3">
                    <div className="font-outfit font-bold text-[1rem] max-[480px]:text-[0.85rem] text-[#f0f2ed] leading-[1.2] mb-[.4rem]">{cat.name}</div>
                    <div className="inline-flex items-center gap-[.3rem] text-[.68rem] max-[480px]:text-[.6rem] font-semibold tracking-[.1em] uppercase text-[#a8d63e] transition-[gap] duration-200">
                      Shop <ArrowRight size={10} />
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══ PRODUCTS ══ */}
      <div className="bg-gradient-to-b from-gray-50 to-white dark:from-dark-elevated-950 dark:to-dark-elevated-900 py-28">
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
                <div key={col.title} className="p-10 max-[1024px]:p-8 max-[480px]:p-4">
                  <div className="flex items-center justify-between pb-[1.2rem] mb-[1.75rem] border-b border-[rgba(26,26,26,.1)] dark:border-white/[0.1]">
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
      <div className="bg-gradient-to-b from-gray-50 to-white dark:from-dark-elevated-950 dark:to-dark-elevated-900 py-28">
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
