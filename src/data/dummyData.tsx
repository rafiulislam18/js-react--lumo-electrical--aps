import { 
  Laptop, Smartphone, Shirt, Home, Watch, 
  Headphones, Camera, Gamepad, ShoppingBag, 
  Armchair
} from "lucide-react";

export interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  badge?: "New" | "Sale" | "Hot";
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const categories: Category[] = [
  { id: "1", name: "Electronics", icon: Laptop },
  { id: "2", name: "Phones", icon: Smartphone },
  { id: "3", name: "Fashion", icon: Shirt },
  { id: "4", name: "Home", icon: Home },
  { id: "5", name: "Watches", icon: Watch },
  { id: "6", name: "Audio", icon: Headphones },
  { id: "7", name: "Cameras", icon: Camera },
  { id: "8", name: "Gaming", icon: Gamepad },
  { id: "9", name: "Bags", icon: ShoppingBag },
  { id: "10", name: "Furniture", icon: Armchair },
];

export const featuredProducts: Product[] = [
  {
    id: "f1",
    name: "Wireless Noise Cancelling Headphones",
    price: 299.99,
    oldPrice: 349.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
    category: "Audio",
    rating: 4.8,
    reviews: 124,
    badge: "Hot"
  },
  {
    id: "f2",
    name: "Smart Watch Series 7",
    price: 399.00,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
    category: "Watches",
    rating: 4.9,
    reviews: 89,
    badge: "New"
  },
  {
    id: "f3",
    name: "Professional Camera Kit",
    price: 1299.00,
    oldPrice: 1499.00,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80",
    category: "Cameras",
    rating: 4.7,
    reviews: 56,
    badge: "Sale"
  },
  {
    id: "f4",
    name: "Modern Lounge Chair",
    price: 450.00,
    image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&q=80",
    category: "Furniture",
    rating: 4.5,
    reviews: 32
  }
];

export const bestSellers: Product[] = [
  {
    id: "b1",
    name: "Mechanical Keyboard RGB",
    price: 149.99,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b91a603?w=500&q=80",
    category: "Electronics",
    rating: 4.9,
    reviews: 230,
    badge: "Hot"
  },
  {
    id: "b2",
    name: "Running Sneakers",
    price: 89.99,
    oldPrice: 119.99,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
    category: "Fashion",
    rating: 4.6,
    reviews: 412,
    badge: "Sale"
  },
  {
    id: "b3",
    name: "Minimalist Backpack",
    price: 79.50,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80",
    category: "Bags",
    rating: 4.8,
    reviews: 156
  },
  {
    id: "b4",
    name: "Coffee Maker Deluxe",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1517080314057-79d19c96827c?w=500&q=80",
    category: "Home",
    rating: 4.7,
    reviews: 98
  }
];

export const latestProducts: Product[] = [
  {
    id: "l1",
    name: "VR Headset Pro",
    price: 599.00,
    image: "https://images.unsplash.com/photo-1622979135225-d2ba269fb1bd?w=500&q=80",
    category: "Gaming",
    rating: 5.0,
    reviews: 12,
    badge: "New"
  },
  {
    id: "l2",
    name: "Smart Speaker Mini",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=500&q=80",
    category: "Audio",
    rating: 4.3,
    reviews: 45
  },
  {
    id: "l3",
    name: "Leather Wallet",
    price: 35.00,
    image: "https://images.unsplash.com/photo-1627123424574-18bd03b4e5df?w=500&q=80",
    category: "Fashion",
    rating: 4.8,
    reviews: 230
  },
  {
    id: "l4",
    name: "Wireless Charger Pad",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=500&q=80",
    category: "Electronics",
    rating: 4.5,
    reviews: 87
  }
];

export const faqs: FAQItem[] = [
  {
    id: "1",
    question: "What is your return policy?",
    answer: "We offer a 30-day return policy for all unused items in their original packaging. Simply initiate a return from your account dashboard."
  },
  {
    id: "2",
    question: "How long does shipping take?",
    answer: "Standard shipping takes 3-5 business days. Express shipping options are available at checkout for 1-2 day delivery."
  },
  {
    id: "3",
    question: "Do you ship internationally?",
    answer: "Yes, we ship to over 100 countries worldwide. Shipping rates and delivery times vary by location."
  },
  {
    id: "4",
    question: "Are my payment details secure?",
    answer: "Absolutely. We use industry-standard encryption and do not store your credit card information on our servers."
  },
  {
    id: "5",
    question: "Can I track my order?",
    answer: "Yes, once your order ships, you will receive a tracking number via email to monitor your package's journey."
  }
];

export const heroBanner = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80";
