import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search, ShoppingCart, Heart, User, Menu, X,
  ChevronDown, LogIn, UserPlus, Package, LogOut, Lock, PhoneCall, Sun, Moon,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CartSidebar } from "@/components/CartSidebar";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { apiGet } from "@/lib/api";

interface Category {
  id: number;
  name: string;
  slug: string;
  is_leaf: boolean;
  children: Category[];
}

interface NavbarProps {
  categories: Category[];
}

function CategoryMenuItem({ category, light }: { category: Category; light: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const itemCls = `flex items-center justify-between px-[0.7rem] py-2 rounded text-[0.82rem] no-underline cursor-pointer transition-all duration-[140ms] ${light ? "text-black/[0.68] hover:bg-[#399746]/[0.09] hover:text-[#399746]" : "text-[#f0f2ed]/[0.68] hover:bg-[#a8d63e]/[0.09] hover:text-[#a8d63e]"}`;
  const panelCls = `absolute left-full top-0 border rounded-md p-2 min-w-[220px] z-[100] ${light ? "bg-[#f5f5f5] border-black/[0.12] shadow-[0_18px_44px_rgba(0,0,0,0.1)]" : "bg-[#111411] border-white/[0.09] shadow-[0_18px_44px_rgba(0,0,0,0.65)]"}`;
  if (!category.children?.length) {
    return <a href={`/${category.slug}`} className={itemCls}>{category.name}</a>;
  }
  return (
    <div className="relative" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <div className={itemCls}>
        <a href={`/${category.slug}`} className="flex-1 no-underline text-inherit">{category.name}</a>
        <ChevronDown size={11} className="flex-shrink-0 opacity-50" />
      </div>
      {isOpen && (
        <div className={panelCls}>
          {category.children.map(c => <CategoryMenuItem key={c.id} category={c} light={light} />)}
        </div>
      )}
    </div>
  );
}

function QuickCat({ category, light }: { category: Category; light: boolean }) {
  const [open, setOpen] = useState(false);
  const linkCls = `text-[0.77rem] font-medium no-underline flex items-center gap-[0.28rem] h-[42px] transition-colors duration-[180ms] whitespace-nowrap ${light ? "text-black/[0.52] hover:text-[#399746]" : "text-[#f0f2ed]/[0.52] hover:text-[#a8d63e]"}`;
  const panelCls = `absolute left-0 top-[42px] border border-t-0 rounded-b-lg p-2 min-w-[220px] z-[9999] ${light ? "bg-[#f5f5f5] border-black/[0.12] shadow-[0_18px_44px_rgba(0,0,0,0.1)]" : "bg-[#111411] border-white/[0.09] shadow-[0_18px_44px_rgba(0,0,0,0.65)]"}`;
  if (!category.children?.length) {
    return <a href={`/${category.slug}`} className={linkCls}>{category.name}</a>;
  }
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <a href={`/${category.slug}`} className={linkCls}>
        {category.name} <ChevronDown size={11} className="opacity-50" />
      </a>
      {open && (
        <div className={panelCls}>
          {category.children.map(c => <CategoryMenuItem key={c.id} category={c} light={light} />)}
        </div>
      )}
    </div>
  );
}

function MobileCategoryItem({ category, level = 0, light }: { category: Category; level?: number; light: boolean }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <div className={`flex items-center border-b ${light ? "border-black/[0.08]" : "border-white/[0.04]"}`}>
        <a
          href={`/${category.slug}`}
          className={`flex-1 py-[0.82rem] text-[0.87rem] font-medium no-underline transition-colors duration-150 ${light ? "text-black/[0.68] hover:text-[#399746]" : "text-[#f0f2ed]/[0.68] hover:text-[#a8d63e]"}`}
          style={{ paddingLeft: `${1 + level * 0.75}rem` }}
        >
          {category.name}
        </a>
        {!!category.children?.length && (
          <button
            className={`px-4 py-[0.82rem] bg-transparent border-none cursor-pointer ${light ? "text-black/[0.38]" : "text-[#f0f2ed]/[0.38]"}`}
            onClick={() => setExpanded(!expanded)}
          >
            <ChevronDown
              size={14}
              style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}
            />
          </button>
        )}
      </div>
      {expanded && !!category.children?.length && (
        <div className="bg-[#a8d63e]/[0.03]">
          {category.children.map(c => <MobileCategoryItem key={c.id} category={c} level={level + 1} light={light} />)}
        </div>
      )}
    </div>
  );
}

export function Navbar({ categories }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [cartOpen,      setCartOpen]      = useState(false);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [allCatOpen,    setAllCatOpen]    = useState(false);
  const [userOpen,      setUserOpen]      = useState(false);
  const [cartCount,     setCartCount]     = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [query,         setQuery]         = useState('');
  const [results,       setResults]       = useState<any[]>([]);
  const [scrolled,      setScrolled]      = useState(false);

  const isHome = location.pathname === '/';
  const allCategories = categories || [];
  const first8 = allCategories.slice(0, 8);

  useEffect(() => {
    const update = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.reduce((s: number, i: any) => s + i.quantity, 0));
      setWishlistCount(JSON.parse(localStorage.getItem('wishlist') || '[]').length);
    };
    update();
    window.addEventListener('storage', update);
    return () => window.removeEventListener('storage', update);
  }, [cartOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }
    try {
      const res = await apiGet<any>(`/products/?search=${encodeURIComponent(q)}&page_size=5`);
      setResults(Array.isArray(res.results) ? res.results : []);
    } catch { setResults([]); }
  };

  const submitSearch = () => {
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
      setQuery(''); setResults([]); setSearchOpen(false);
    }
  };

  const goProduct = (id: string) => {
    navigate(`/product-details/${id}`);
    setQuery(''); setResults([]); setSearchOpen(false);
  };

  const imgSrc = (img: string) =>
    img?.startsWith('http') ? img : `${import.meta.env.VITE_BASE_URL}${img}`;

  const solidBg = !isHome || scrolled;
  // Light styles only when navbar has a solid background AND user chose light mode
  const light = solidBg && theme === 'light';

  const iconBtn = `relative grid place-items-center w-[38px] h-[38px] rounded-md border-none cursor-pointer no-underline bg-transparent transition-all duration-[180ms] flex-shrink-0 ${light ? "text-black/60 hover:bg-black/[0.08] hover:text-black" : "text-[#f0f2ed]/[0.72] hover:bg-white/[0.09] hover:text-[#f0f2ed]"}`;

  return (
    <>
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <nav className={`sticky top-0 z-[40] font-outfit w-full transition-all duration-500 ${solidBg ? (light ? 'bg-white shadow-[0_1px_0_rgba(0,0,0,0.08)]' : 'bg-[#0d110d] shadow-[0_1px_0_rgba(255,255,255,0.07)]') : 'bg-transparent'}`}>

        {/* TOPBAR */}
        <div className="flex items-center h-[68px] max-w-[1280px] mx-auto pl-8 pr-3 gap-4">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center no-underline">
            <img src="/images/logo.png" alt="Lumo Electrical" className="h-[38px] block" />
          </Link>

          {/* Search — desktop */}
          <div className="hidden sm:block flex-1 min-w-0 max-w-[520px] relative md:flex-1">
            <input
              className={`w-full h-10 border rounded-md pr-[5.5rem] pl-4 font-outfit text-[0.875rem] outline-none transition-all duration-200 box-border ${light ? "bg-white border-black/[0.12] text-[#222] placeholder:text-black/30 focus:border-[#399746]/55 focus:bg-white" : "bg-white/[0.08] border-white/[0.12] text-[#f0f2ed] placeholder:text-[#f0f2ed]/30 focus:border-[#a8d63e]/55 focus:bg-white/[0.11]"}`}
              placeholder="Search products, brands, categories…"
              value={query}
              onChange={e => handleSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitSearch()}
              onBlur={() => setTimeout(() => setResults([]), 180)}
            />
            <button
              className={`absolute right-[5px] top-[5px] bottom-[5px] px-[0.85rem] rounded bg-gradient-to-r from-[#3aaa49] to-[#a8d63e] font-outfit text-[0.68rem] font-bold tracking-[0.08em] uppercase border-none cursor-pointer transition-opacity duration-200 whitespace-nowrap hover:opacity-85 ${light ? "text-white" : "text-[#0a0c0a]"}`}
              onClick={submitSearch}
            >
              Search
            </button>
            {results.length > 0 && (
              <div className={`absolute top-[calc(100%+6px)] left-0 right-0 border rounded-lg overflow-hidden z-[200] ${light ? "bg-[#f5f5f5] border-black/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.1)]" : "bg-[#141814] border-[#a8d63e]/20 shadow-[0_20px_50px_rgba(0,0,0,0.7)]"}`}>
                {results.map(p => (
                  <button
                    key={p.id}
                    className={`w-full flex items-center gap-[0.85rem] px-4 py-[0.7rem] bg-transparent border-none border-b last:border-b-0 cursor-pointer text-left transition-colors duration-150 ${light ? "border-black/[0.08] text-[#222] hover:bg-[#399746]/[0.06]" : "border-white/[0.05] text-[#f0f2ed] hover:bg-[#a8d63e]/[0.06]"}`}
                    onMouseDown={() => goProduct(p.id)}
                  >
                    <img className="w-9 h-9 object-cover rounded bg-[#222] flex-shrink-0" src={imgSrc(p.image)} alt={p.name} />
                    <div>
                      <div className="text-[0.84rem] font-medium text-left">{p.name}</div>
                      <div className={`text-[0.73rem] ${light ? "text-black/40" : "text-[#f0f2ed]/40"}`}>R {p.price}</div>
                    </div>
                  </button>
                ))}
                <button
                  className={`block w-full text-center px-0 py-[0.6rem] text-[0.7rem] font-bold tracking-[0.09em] uppercase bg-transparent border-none border-t cursor-pointer transition-colors duration-150 ${light ? "text-[#399746] border-black/[0.06] hover:bg-[#399746]/[0.05]" : "text-[#a8d63e] border-white/[0.06] hover:bg-[#a8d63e]/[0.05]"}`}
                  onMouseDown={submitSearch}
                >
                  View all results →
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-[0.15rem] flex-shrink-0 md:flex-shrink-0 ml-auto md:ml-0">
            <Link to="/contact-us" className={`${iconBtn} hidden md:grid`} title="Contact Us">
              <PhoneCall size={17} />
            </Link>
            <button className={`${iconBtn} sm:hidden`} onClick={() => setSearchOpen(true)} title="Search">
              <Search size={17} />
            </button>
            <button className={iconBtn} onClick={() => setCartOpen(true)} title="Cart">
              <ShoppingCart size={17} />
              {cartCount > 0 && (
                <span className="absolute top-[3px] right-[3px] min-w-[15px] h-[15px] rounded-full bg-gradient-to-r from-[#3aaa49] to-[#a8d63e] text-[#0a0c0a] text-[0.5rem] font-extrabold flex items-center justify-center px-[3px] pointer-events-none">
                  {cartCount}
                </span>
              )}
            </button>
            <Link to="/wishlist" className={`${iconBtn} hidden md:grid`} title="Wishlist">
              <Heart size={17} />
              {wishlistCount > 0 && (
                <span className="absolute top-[3px] right-[3px] min-w-[15px] h-[15px] rounded-full bg-red-500 text-white text-[0.5rem] font-extrabold flex items-center justify-center px-[3px] pointer-events-none">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <DropdownMenu modal={false} open={userOpen} onOpenChange={setUserOpen}>
              <DropdownMenuTrigger asChild>
                <button className={`${iconBtn} hidden md:grid`} title="My Account" onMouseEnter={() => setUserOpen(true)}>
                  <User size={17} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className={`w-52 border rounded-lg p-[0.35rem] ${light ? "bg-[#f5f5f5] border-black/[0.12] text-[#222]" : "bg-[#111411] border-white/[0.09] text-[#f0f2ed]"}`}
                onMouseLeave={() => setUserOpen(false)}
              >
                {isAuthenticated ? (
                  <>
                    <DropdownMenuLabel className={`text-[0.74rem] px-2 py-1.5 ${light ? "text-black/[0.38]" : "text-[#f0f2ed]/[0.38]"}`}>
                      {user?.first_name} {user?.last_name}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className={light ? "bg-black/[0.07]" : "bg-white/[0.07]"} />
                    <DropdownMenuItem className={`rounded font-outfit text-[0.82rem] cursor-pointer ${light ? "text-black/70 hover:bg-[#399746]/[0.09] hover:text-[#399746] focus:bg-[#399746]/[0.09] focus:text-[#399746]" : "text-[#f0f2ed]/70 hover:bg-[#a8d63e]/[0.09] hover:text-[#a8d63e] focus:bg-[#a8d63e]/[0.09] focus:text-[#a8d63e]"}`} asChild>
                      <Link to="/profile"><User size={13} className="mr-2" />Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className={`rounded font-outfit text-[0.82rem] cursor-pointer ${light ? "text-black/70 hover:bg-[#399746]/[0.09] hover:text-[#399746] focus:bg-[#399746]/[0.09] focus:text-[#399746]" : "text-[#f0f2ed]/70 hover:bg-[#a8d63e]/[0.09] hover:text-[#a8d63e] focus:bg-[#a8d63e]/[0.09] focus:text-[#a8d63e]"}`} asChild>
                      <Link to="/orders"><Package size={13} className="mr-2" />Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className={`rounded font-outfit text-[0.82rem] cursor-pointer ${light ? "text-black/70 hover:bg-[#399746]/[0.09] hover:text-[#399746] focus:bg-[#399746]/[0.09] focus:text-[#399746]" : "text-[#f0f2ed]/70 hover:bg-[#a8d63e]/[0.09] hover:text-[#a8d63e] focus:bg-[#a8d63e]/[0.09] focus:text-[#a8d63e]"}`} asChild>
                      <Link to="/change-password"><Lock size={13} className="mr-2" />Change Password</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className={light ? "bg-black/[0.07]" : "bg-white/[0.07]"} />
                    <DropdownMenuItem
                      className="rounded font-outfit text-[0.82rem] cursor-pointer text-red-400 hover:bg-red-400/[0.09] hover:text-red-400 focus:bg-red-400/[0.09] focus:text-red-400"
                      onClick={() => {
                        logout();
                        toast({ title: 'Logged out', className: 'bg-green-700 text-white' });
                      }}
                    >
                      <LogOut size={13} className="mr-2" />Log out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel className={`text-[0.74rem] px-2 py-1.5 ${light ? "text-black/[0.38]" : "text-[#f0f2ed]/[0.38]"}`}>My Account</DropdownMenuLabel>
                    <DropdownMenuItem className={`rounded font-outfit text-[0.82rem] cursor-pointer ${light ? "text-black/70 hover:bg-[#399746]/[0.09] hover:text-[#399746] focus:bg-[#399746]/[0.09] focus:text-[#399746]" : "text-[#f0f2ed]/70 hover:bg-[#a8d63e]/[0.09] hover:text-[#a8d63e] focus:bg-[#a8d63e]/[0.09] focus:text-[#a8d63e]"}`} asChild>
                      <Link to="/login"><LogIn size={13} className="mr-2" />Log In</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className={`rounded font-outfit text-[0.82rem] cursor-pointer ${light ? "text-black/70 hover:bg-[#399746]/[0.09] hover:text-[#399746] focus:bg-[#399746]/[0.09] focus:text-[#399746]" : "text-[#f0f2ed]/70 hover:bg-[#a8d63e]/[0.09] hover:text-[#a8d63e] focus:bg-[#a8d63e]/[0.09] focus:text-[#a8d63e]"}`} asChild>
                      <Link to="/signup"><UserPlus size={13} className="mr-2" />Sign Up</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <button className={iconBtn} onClick={toggleTheme} title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}>
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button className={`${iconBtn} md:hidden`} onClick={() => setMobileOpen(!mobileOpen)} title="Menu">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* CATEGORY BAR — desktop */}
        <div className={`hidden md:block border-t ${light ? "border-black/[0.08] bg-black/[0.02]" : "border-white/[0.06] bg-black/[0.18]"}`}>
          <div className="flex items-center gap-6 h-[42px] max-w-[1280px] mx-auto px-8 overflow-visible">
            <div
              className="relative h-[42px] flex items-center"
              onMouseEnter={() => setAllCatOpen(true)}
              onMouseLeave={() => setAllCatOpen(false)}
            >
              <button className={`inline-flex items-center gap-[0.45rem] text-[0.72rem] font-bold tracking-[0.1em] uppercase bg-transparent border-none cursor-pointer whitespace-nowrap flex-shrink-0 h-full transition-opacity duration-200 hover:opacity-70 ${light ? "text-[#399746]" : "text-[#a8d63e]"}`}>
                <Menu size={13} /> All Categories <ChevronDown size={11} />
              </button>
              {allCatOpen && (
                <div className={`absolute top-full left-0 border border-t-0 rounded-b-lg p-2 min-w-[260px] z-[9999] ${light ? "bg-[#f5f5f5] border-black/[0.12] shadow-[0_28px_56px_rgba(0,0,0,0.1)]" : "bg-[#111411] border-white/[0.09] shadow-[0_28px_56px_rgba(0,0,0,0.75)]"}`}>
                  {allCategories.map(cat => <CategoryMenuItem key={cat.id} category={cat} light={light} />)}
                </div>
              )}
            </div>
            <div className={`w-px h-[18px] flex-shrink-0 ${light ? "bg-black/[0.1]" : "bg-white/[0.1]"}`} />
            <div className="flex items-center gap-6 overflow-visible">
              {first8.map(cat => <QuickCat key={cat.id} category={cat} light={light} />)}
            </div>
          </div>
        </div>

        {/* MOBILE DRAWER */}
        {mobileOpen && (
          <div className={`md:hidden fixed top-[68px] left-0 right-0 bottom-0 border-t overflow-y-auto ${light ? "bg-[#f5f5f5] border-black/[0.08]" : "bg-[#0d110d] border-white/[0.06]"}`}>
            <Link
              to="/contact-us"
              className={`block px-4 py-4 border-b text-[0.87rem] font-medium no-underline transition-colors duration-150 ${light ? "border-black/[0.08] text-black/[0.68] hover:text-[#399746]" : "border-white/[0.06] text-[#f0f2ed]/[0.68] hover:text-[#a8d63e]"}`}
              onClick={() => setMobileOpen(false)}
            >
              <PhoneCall size={13} className="inline mr-2 opacity-55" />
              Contact Us
            </Link>
            {/* <Link
              to="/profile"
              className={`block px-4 py-4 border-b text-[0.87rem] font-medium no-underline transition-colors duration-150 ${light ? "border-black/[0.08] text-black/[0.68] hover:text-[#399746]" : "border-white/[0.06] text-[#f0f2ed]/[0.68] hover:text-[#a8d63e]"}`}
              onClick={() => setMobileOpen(false)}
            >
              <User size={13} className="inline mr-2 opacity-55" />
              {isAuthenticated ? 'Profile' : 'My Account'}
            </Link> */}
            <div className={`px-4 pt-4 pb-[0.45rem] text-[0.63rem] font-bold tracking-[0.18em] uppercase ${light ? "text-black/[0.22]" : "text-[#f0f2ed]/[0.22]"}`}>
              My Account
            </div>
            { isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className={`block px-4 py-4 border-b text-[0.87rem] font-medium no-underline transition-colors duration-150 ${light ? "border-black/[0.08] text-black/[0.68] hover:text-[#399746]" : "border-white/[0.06] text-[#f0f2ed]/[0.68] hover:text-[#a8d63e]"}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <User size={13} className="inline mr-2 opacity-55" />
                    Profile
                  </Link>
                  <Link
                    to="/wishlist"
                    className={`block px-4 py-4 border-b text-[0.87rem] font-medium no-underline transition-colors duration-150 ${light ? "border-black/[0.08] text-black/[0.68] hover:text-[#399746]" : "border-white/[0.06] text-[#f0f2ed]/[0.68] hover:text-[#a8d63e]"}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Heart size={13} className="inline mr-2 opacity-55" />
                    Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                  </Link>
                  <Link
                    to="/orders"
                    className={`block px-4 py-4 border-b text-[0.87rem] font-medium no-underline transition-colors duration-150 ${light ? "border-black/[0.08] text-black/[0.68] hover:text-[#399746]" : "border-white/[0.06] text-[#f0f2ed]/[0.68] hover:text-[#a8d63e]"}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Package size={13} className="inline mr-2 opacity-55" />
                    Orders
                  </Link>
                  <Link
                    to="/change-password"
                    className={`block px-4 py-4 border-b text-[0.87rem] font-medium no-underline transition-colors duration-150 ${light ? "border-black/[0.08] text-black/[0.68] hover:text-[#399746]" : "border-white/[0.06] text-[#f0f2ed]/[0.68] hover:text-[#a8d63e]"}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Lock size={13} className="inline mr-2 opacity-55" />
                    Change Password
                  </Link>
                  <button
                    className={`w-full text-left px-4 py-4 border-b text-[0.87rem] font-medium no-underline transition-colors duration-150 text-red-400 hover:bg-red-400/[0.09] hover:text-red-400 focus:bg-red-400/[0.09] focus:text-red-400 ${light ? "border-black/[0.08]" : "border-white/[0.06]"}`}
                    onClick={() => {
                      logout();
                      toast({ title: 'Logged out', className: 'bg-green-700 text-white' });
                      setMobileOpen(false);
                    }}
                  >
                    <LogOut size={13} className="inline mr-2 opacity-55" />
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`block px-4 py-4 border-b text-[0.87rem] font-medium no-underline transition-colors duration-150 ${light ? "border-black/[0.08] text-black/[0.68] hover:text-[#399746]" : "border-white/[0.06] text-[#f0f2ed]/[0.68] hover:text-[#a8d63e]"}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <LogIn size={13} className="inline mr-2 opacity-55" />
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className={`block px-4 py-4 border-b text-[0.87rem] font-medium no-underline transition-colors duration-150 ${light ? "border-black/[0.08] text-black/[0.68] hover:text-[#399746]" : "border-white/[0.06] text-[#f0f2ed]/[0.68] hover:text-[#a8d63e]"}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <UserPlus size={13} className="inline mr-2 opacity-55" />
                    Sign Up
                  </Link>
                </>
              )
            }
            {/* <Link
              to="/wishlist"
              className={`block px-4 py-4 border-b text-[0.87rem] font-medium no-underline transition-colors duration-150 ${light ? "border-black/[0.08] text-black/[0.68] hover:text-[#399746]" : "border-white/[0.06] text-[#f0f2ed]/[0.68] hover:text-[#a8d63e]"}`}
              onClick={() => setMobileOpen(false)}
            >
              <Heart size={13} className="inline mr-2 opacity-55" />
              Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
            </Link> */}
            
            <div className={`px-4 pt-4 pb-[0.45rem] text-[0.63rem] font-bold tracking-[0.18em] uppercase ${light ? "text-black/[0.22]" : "text-[#f0f2ed]/[0.22]"}`}>
              Categories
            </div>
            {allCategories.map(cat => <MobileCategoryItem key={cat.id} category={cat} light={light} />)}
          </div>
        )}

        {/* MOBILE SEARCH MODAL */}
        {searchOpen && (
          <div className={`fixed inset-0 z-[99999] backdrop-blur-[10px] flex flex-col ${light ? "bg-white/[0.96]" : "bg-[#040804]/[0.96]"}`}>
            <div className={`flex items-center gap-3 px-5 py-4 border-b ${light ? "border-black/[0.08]" : "border-white/[0.07]"}`}>
              <Search size={17} className={`flex-shrink-0 ${light ? "text-black/35" : "text-[#f0f2ed]/35"}`} />
              <input
                autoFocus
                className={`flex-1 h-11 border rounded-md px-4 font-outfit text-[0.95rem] outline-none ${light ? "bg-black/[0.05] border-black/[0.12] text-[#222]" : "bg-white/[0.09] border-white/[0.12] text-[#f0f2ed]"}`}
                placeholder="Search products…"
                value={query}
                onChange={e => handleSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitSearch()}
              />
              <button
                className={`bg-transparent border-none cursor-pointer font-outfit text-[0.82rem] whitespace-nowrap ${light ? "text-black/[0.48]" : "text-[#f0f2ed]/[0.48]"}`}
                onClick={() => { setSearchOpen(false); setQuery(''); setResults([]); }}
              >
                Cancel
              </button>
            </div>
            {results.length > 0 && (
              <div className="p-2">
                {results.map(p => (
                  <button
                    key={p.id}
                    className={`w-full flex items-center gap-[0.85rem] px-4 py-[0.7rem] bg-transparent border-none border-b last:border-b-0 cursor-pointer text-left transition-colors duration-150 ${light ? "border-black/[0.08] text-[#222] hover:bg-[#399746]/[0.06]" : "border-white/[0.05] text-[#f0f2ed] hover:bg-[#a8d63e]/[0.06]"}`}
                    onClick={() => goProduct(p.id)}
                  >
                    <img className="w-9 h-9 object-cover rounded bg-[#222] flex-shrink-0" src={imgSrc(p.image)} alt={p.name} />
                    <div>
                      <div className="text-[0.84rem] font-medium">{p.name}</div>
                      <div className={`text-[0.73rem] ${light ? "text-black/40" : "text-[#f0f2ed]/40"}`}>R {p.price}</div>
                    </div>
                  </button>
                ))}
                <button
                  className={`block w-full text-center py-[0.6rem] text-[0.7rem] font-bold tracking-[0.09em] uppercase bg-transparent border-none border-t cursor-pointer transition-colors duration-150 ${light ? "text-[#399746] border-black/[0.06] hover:bg-[#399746]/[0.05]" : "text-[#a8d63e] border-white/[0.06] hover:bg-[#a8d63e]/[0.05]"}`}
                  onClick={submitSearch}
                >
                  View all results →
                </button>
              </div>
            )}
          </div>
        )}

      </nav>
    </>
  );
}
