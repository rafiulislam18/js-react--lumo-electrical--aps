import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, ShoppingCart, Heart, User, Menu, 
  ChevronDown, LogIn, UserPlus, Package, LogOut, Lock, PhoneCall
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CartSidebar } from "@/components/CartSidebar";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiGet } from "@/lib/api";

interface Category {
  id: number;
  name: string;
  slug: string;
  is_leaf: boolean;
  children: Category[];
}

interface CategoriesResponse {
  categories: Category[];
}

interface NavbarProps {
  categories: Category[];
}

// Recursive category menu item component for desktop
function CategoryMenuItem({ category }: { category: Category }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!category.children || category.children.length === 0) {
    return (
      <div className="px-2 py-2 rounded-lg text-gray-700 hover:text-primary hover:bg-gray-50 cursor-pointer text-sm">
        <a href={`/${category.slug}`} className="flex items-center block">
          {category.name}
        </a>
      </div>
    );
  }

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="flex items-center justify-between px-2 py-2 rounded-lg text-gray-700 hover:text-primary hover:bg-gray-50 cursor-pointer text-sm">
        <a href={`/${category.slug}`} className="flex-1 block">
          {category.name}
        </a>
        <ChevronDown className="w-3 h-3 ml-2 flex-shrink-0" />
      </div>
      {/* Invisible bridge to prevent gap hover trigger */}
      <div className="absolute left-full top-0 -ml-1 w-1 h-full pointer-events-none" />
      {isOpen && (
        <div className="absolute left-full top-0 bg-white border border-gray-200 rounded-lg shadow-xl p-1 min-w-max z-[999]">
          {category.children.map((child) => (
            <CategoryMenuItem key={child.id} category={child} />
          ))}
        </div>
      )}
    </div>
  );
}

// Hoverable quick category menu item component for desktop
function QuickCategoryMenuItem({ category }: { category: Category }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!category.children || category.children.length === 0) {
    return (
      <a 
        href={`/${category.slug}`} 
        className="text-sm font-medium text-gray-600 hover:text-primary transition-colors whitespace-nowrap"
      >
        {category.name}
      </a>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <a 
        href={`/${category.slug}`} 
        className="text-sm font-medium text-gray-600 hover:text-primary transition-colors whitespace-nowrap flex items-center gap-1 py-3"
      >
        {category.name}
        <ChevronDown className="w-3 h-3" />
      </a>
      {isOpen && (
        <div className="absolute left-0 top-full bg-white border border-gray-200 rounded-lg shadow-xl p-1 min-w-max z-[999] mt-0">
          {category.children.map((child) => (
            <CategoryMenuItem key={child.id} category={child} />
          ))}
        </div>
      )}
    </div>
  );
}

// Recursive mobile category menu component
function MobileCategoryItem({ category, level = 0 }: { category: Category; level?: number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div key={category.id}>
      <div className="flex items-center justify-between">
        <a
          href={`/${category.slug}`}
          className="flex-1 px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
          style={{ paddingLeft: `${12 + level * 12}px` }}
        >
          {category.name}
        </a>
        {category.children && category.children.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-2.5"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>
      {isExpanded && category.children && category.children.length > 0 && (
        <div className="bg-gray-50">
          {category.children.map((child) => (
            <MobileCategoryItem key={child.id} category={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Navbar({ categories }: NavbarProps) {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { toast } = useToast();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const allCategories = categories || [];
  const firstEightCategories = allCategories.slice(0, 8);

  useEffect(() => {
    const updateCounts = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const cartTotal = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
      setCartCount(cartTotal);

      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setWishlistCount(wishlist.length);
    };

    updateCounts();
    window.addEventListener("storage", updateCounts);
    return () => window.removeEventListener("storage", updateCounts);
  }, [isCartOpen]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length === 0) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const response = await apiGet<any>(`/products/?search=${encodeURIComponent(query)}&page_size=5`);
      const results = Array.isArray(response.results) ? response.results : [];
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setShowSearchResults(false);
    }
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product-details/${productId}`);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  return (
    <>
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm transition-all">
        {/* Top Row: Logo, Search, Actions */}
        <div className="container mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-4 sm:gap-8">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <div className="flex items-center gap-2 cursor-pointer group">
              <img src="/images/logo.png" alt="logo" className="h-8 sm:h-10 md:h-12" />
            </div>
          </Link>

          {/* Search Bar - Center */}
          <div className="hidden md:flex flex-1 max-w-2xl relative group">
            <div className={`absolute inset-y-0 left-3 flex items-center pointer-events-none transition-colors ${isSearchFocused ? 'text-primary' : 'text-gray-400'}`}>
              <Search className="w-5 h-5" />
            </div>
            <Input 
              className="pl-10 pr-4 h-11 rounded-full border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300" 
              placeholder="Search for products, brands and categories..." 
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => {
                setIsSearchFocused(false);
                setTimeout(() => setShowSearchResults(false), 200);
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit();
                }
              }}
            />
            <button 
              onClick={handleSearchSubmit}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-primary-gradient text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Search
            </button>

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 text-left transition-colors"
                  >
                    <img 
                      src={product.image ? (product.image.startsWith('http') ? product.image : `${import.meta.env.VITE_BASE_URL}${product.image}`) : '/placeholder.png'}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">${product.price}</p>
                    </div>
                    {product.badge && (
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded whitespace-nowrap">
                        {product.badge}
                      </span>
                    )}
                  </button>
                ))}
                <button
                  onClick={handleSearchSubmit}
                  className="w-full py-2 text-center text-sm text-primary hover:bg-primary/5 font-medium"
                >
                  View all results
                </button>
              </div>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Contact Us - If not mobile view, show as a button */}
            <Link to="/contact-us" className="hidden md:block p-1.5 sm:p-2 rounded-full hover:bg-secondary transition-colors" title="Contact Us">
              <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
            </Link>

            {/* Mobile Search Icon */}
            <button 
              onClick={() => setIsSearchModalOpen(true)}
              className="md:hidden p-1.5 sm:p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
            </button>

            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-1.5 sm:p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold text-white bg-primary-gradient rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            <Link to="/wishlist" className="relative p-1.5 sm:p-2 rounded-full hover:bg-secondary transition-colors" title="Wishlist">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <DropdownMenu modal={false} open={openDropdown === 'user'} onOpenChange={(open) => setOpenDropdown(open ? 'user' : null)}>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 sm:p-2 rounded-full hover:bg-secondary transition-colors" onMouseEnter={() => setOpenDropdown('user')}>
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-gray-100 p-2" onOpenAutoFocus={(e: any) => e.preventDefault()} onMouseLeave={() => setOpenDropdown(null)}>
                {isAuthenticated ? (
                  <>
                    <DropdownMenuLabel className="px-2 py-2 text-sm text-gray-500 font-medium">
                      {user?.first_name} {user?.last_name}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="rounded-lg cursor-pointer text-gray-700 hover:text-primary hover:bg-gray-50 focus:text-primary focus:bg-gray-50" asChild>
                      <Link to="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg cursor-pointer text-gray-700 hover:text-primary hover:bg-gray-50 focus:text-primary focus:bg-gray-50" asChild>
                      <Link to="/orders">
                        <Package className="mr-2 h-4 w-4" />
                        <span>Orders</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg cursor-pointer text-gray-700 hover:text-primary hover:bg-gray-50 focus:text-primary focus:bg-gray-50" asChild>
                      <Link to="/change-password">
                        <Lock className="mr-2 h-4 w-4" />
                        <span>Change Password</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg cursor-pointer"
                      onClick={() => {
                        logout();
                        toast({
                          title: "Logged Out",
                          description: "You have been logged out successfully.",
                          className: "bg-green-600 text-white border-green-700",
                        });
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel className="px-2 py-2 text-sm text-gray-500 font-medium">My Account</DropdownMenuLabel>
                    <DropdownMenuItem className="rounded-lg cursor-pointer text-gray-700 hover:text-primary hover:bg-gray-50 focus:text-primary focus:bg-gray-50" asChild>
                      <Link to="/login">
                        <LogIn className="mr-2 h-4 w-4" />
                        <span>Log In</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg cursor-pointer text-gray-700 hover:text-primary hover:bg-gray-50 focus:text-primary focus:bg-gray-50" asChild>
                      <Link to="/signup">
                        <UserPlus className="mr-2 h-4 w-4" />
                        <span>Sign Up</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>

      {/* Bottom Row: Categories Navigation */}
      <div className="hidden md:block border-t border-gray-100 bg-white/50 overflow-visible">
        <div className="container mx-auto h-12 flex items-center gap-8 overflow-visible">
          <DropdownMenu modal={false} open={openDropdown === 'categories'} onOpenChange={(open) => setOpenDropdown(open ? 'categories' : null)}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="null" 
                className="h-full rounded-none hover:text-primary hover:bg-transparent font-medium flex items-center gap-2 transition-all"
                onMouseEnter={() => setOpenDropdown('categories')}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Menu className="w-4 h-4" />
                All Categories
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80 rounded-xl p-2 shadow-lg border-gray-100 overflow-visible" onOpenAutoFocus={(e: any) => e.preventDefault()} onMouseLeave={() => setOpenDropdown(null)} onMouseEnter={() => setOpenDropdown('categories')}>
              {allCategories.map((cat: Category) => (
                <CategoryMenuItem key={cat.id} category={cat} />
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-6 overflow-visible">
            {firstEightCategories.map((cat: Category) => (
              <QuickCategoryMenuItem key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Search Modal */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/50 flex flex-col">
          <div className="bg-white border-b border-gray-100 pt-4 pb-2 px-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSearchModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Search className="w-5 h-5 text-gray-400" />
              </button>
              <Input 
                autoFocus
                className="flex-1 h-10 rounded-full border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit();
                    setIsSearchModalOpen(false);
                  }
                }}
              />
              <button
                onClick={() => setIsSearchModalOpen(false)}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Mobile Search Results */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      handleProductClick(product.id);
                      setIsSearchModalOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 text-left transition-colors"
                  >
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.category}</p>
                    </div>
                    <p className="text-sm font-semibold text-primary">${product.price}</p>
                  </button>
                ))}
                <button
                  onClick={() => {
                    handleSearchSubmit();
                    setIsSearchModalOpen(false);
                  }}
                  className="w-full py-2 text-center text-sm text-primary hover:bg-primary/5 font-medium border-t border-gray-100"
                >
                  View all results
                </button>
              </div>
            )}
          </div>
          <div className="flex-1" onClick={() => setIsSearchModalOpen(false)} />
        </div>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-slide-in-down">
          <div className="container mx-auto px-4 py-4">

            {/* Mobile Contact Us */}
            <Link
              to="/contact-us"
              className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-primary transition-colors mb-4 border-b border-gray-200 pb-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact Us
            </Link>

            {/* Mobile Categories */}
            <div className="space-y-1 pt-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest px-3 mb-2">All Categories</p>
              {allCategories.map((cat: Category) => (
                <MobileCategoryItem key={cat.id} category={cat} />
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
    </>
  );
}
