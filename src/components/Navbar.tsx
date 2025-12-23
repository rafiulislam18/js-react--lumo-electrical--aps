import { useState } from "react";
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
import { categories } from "@/data/dummyData";

export function Navbar() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm transition-all">
      {/* Top Row: Logo, Search, Actions */}
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <div className="flex items-center gap-2 cursor-pointer group">
            <img src="/logo.png" alt="logo" className="h-12" />
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
          <Button variant="ghost" size="icon" className="relative hover:bg-green-50 hover:text-green-600 transition-colors rounded-full">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">2</span>
            <span className="sr-only">Cart</span>
          </Button>

          <Button variant="ghost" size="icon" className="relative hover:bg-green-50 hover:text-green-600 transition-colors rounded-full">
            <Heart className="w-5 h-5" />
            <span className="sr-only">Wishlist</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-green-50 hover:text-green-600">
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-gray-100 p-2">
              <DropdownMenuLabel className="px-2 py-2 text-sm text-gray-500 font-medium">My Account</DropdownMenuLabel>
              <DropdownMenuItem className="rounded-lg cursor-pointer">
                <LogIn className="mr-2 h-4 w-4" />
                <span>Log In</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg cursor-pointer">
                <UserPlus className="mr-2 h-4 w-4" />
                <span>Sign Up</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-lg cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg cursor-pointer">
                <Package className="mr-2 h-4 w-4" />
                <span>Orders</span>
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
          <DropdownMenu>
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
            <DropdownMenuContent align="start" className="w-56 rounded-xl p-2 shadow-lg border-gray-100">
              {categories.map((cat) => (
                <DropdownMenuItem key={cat.id} className="cursor-pointer rounded-lg py-2">
                  <cat.icon className="w-4 h-4 mr-2 text-gray-500" />
                  {cat.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            {categories.slice(0, 8).map((cat) => (
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
  );
}
