import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Search, ShoppingCart, Heart, User, Menu, 
  ChevronDown, LogIn, UserPlus, Package, LogOut 
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
import { categories } from "@/data/dummyData";

export function Navbar() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

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

  return (
    <>
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm transition-all">
        {/* Top Row: Logo, Search, Actions */}
        <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-8">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <div className="flex items-center gap-2 cursor-pointer group">
              <img src="/images/logo.png" alt="logo" className="h-12" />
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
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            <button className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-primary-gradient text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
              Search
            </button>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-foreground" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold text-white bg-primary-gradient rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            <Link to="/wishlist" className="relative p-2 rounded-full hover:bg-secondary transition-colors">
              <Heart className="w-5 h-5 text-foreground" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full hover:bg-secondary transition-colors">
                  <User className="w-5 h-5 text-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-gray-100 p-2" onOpenAutoFocus={(e: any) => e.preventDefault()}>
                <DropdownMenuLabel className="px-2 py-2 text-sm text-gray-500 font-medium">My Account</DropdownMenuLabel>
                <DropdownMenuItem className="rounded-lg cursor-pointer" asChild>
                  <Link to="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    <span>Log In</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg cursor-pointer" asChild>
                  <Link to="/signup">
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Sign Up</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-lg cursor-pointer" asChild>
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg cursor-pointer" asChild>
                  <Link to="/orders">
                    <Package className="mr-2 h-4 w-4" />
                    <span>Orders</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>

      {/* Bottom Row: Categories Navigation */}
      <div className="hidden md:block border-t border-gray-100 bg-white/50">
        <div className="container mx-auto h-12 flex items-center gap-8">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="null" 
                className="h-full rounded-none hover:text-primary hover:bg-transparent font-medium flex items-center gap-2 transition-all"
              >
                <Menu className="w-4 h-4" />
                All Categories
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 rounded-xl p-2 shadow-lg border-gray-100" onOpenAutoFocus={(e: any) => e.preventDefault()}>
              {categories.map((cat: any) => (
                <DropdownMenuItem key={cat.id} className="cursor-pointer rounded-lg py-2">
                  <cat.icon className="w-4 h-4 mr-2 text-gray-500" />
                  {cat.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            {categories.slice(0, 8).map((cat: any) => (
              <a 
                key={cat.id} 
                href={`/category/${cat.id}`} 
                className="text-sm font-medium text-gray-600 hover:text-primary transition-colors whitespace-nowrap"
              >
                {cat.name}
              </a>
            ))}
            {/* <a href="/deals" className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors whitespace-nowrap">
              Hot Deals
            </a> */}
          </div>
        </div>
      </div>
    </nav>
    </>
  );
}
