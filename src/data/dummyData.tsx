import { 
  Zap, Cable, Package, Cpu, Lightbulb,
  ToggleLeft, Grid3x3, Sun, Link2,
  LampCeiling
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
  { id: "1", name: "Circuit Breakers", icon: Zap },
  { id: "2", name: "Wire & Cables", icon: Cable },
  { id: "3", name: "Cable Management", icon: Package },
  { id: "4", name: "Switchgear", icon: Cpu },
  { id: "5", name: "LED Lamps", icon: Lightbulb },
  { id: "6", name: "Switches & Sockets", icon: ToggleLeft },
  { id: "7", name: "Distribution Boards", icon: Grid3x3 },
  { id: "8", name: "Solar Solutions", icon: Sun },
  { id: "9", name: "Joiners", icon: Link2 },
  { id: "10", name: "Indoor Fittings", icon: LampCeiling },
];

export const featuredProducts: Product[] = [
  {
    id: "f1",
    name: "MCB Circuit Breaker 32A",
    price: 18.99,
    oldPrice: 22.99,
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&q=80",
    category: "Circuit Breakers",
    rating: 4.8,
    reviews: 124,
    badge: "Hot"
  },
  {
    id: "f2",
    name: "Copper Electrical Wire 2.5mm (90m)",
    price: 79.00,
    image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80",
    category: "Wire & Cables",
    rating: 4.9,
    reviews: 89,
    badge: "New"
  },
  {
    id: "f3",
    name: "LED Panel Light 24W",
    price: 29.99,
    oldPrice: 39.99,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80",
    category: "LED Lamps",
    rating: 4.7,
    reviews: 56,
    badge: "Sale"
  },
  {
    id: "f4",
    name: "Modular Switch Socket Combo",
    price: 12.50,
    image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80",
    category: "Switches & Sockets",
    rating: 4.5,
    reviews: 32
  }
];

export const bestSellers: Product[] = [
  {
    id: "b1",
    name: "Distribution Board 12 Way",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80",
    category: "Distribution Boards",
    rating: 4.9,
    reviews: 230,
    badge: "Hot"
  },
  {
    id: "b2",
    name: "Cable Trunking PVC (2m)",
    price: 9.99,
    oldPrice: 12.99,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80",
    category: "Cable Management",
    rating: 4.6,
    reviews: 412,
    badge: "Sale"
  },
  {
    id: "b3",
    name: "MC4 Solar Connector Pair",
    price: 6.50,
    image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=500&q=80",
    category: "Joiners",
    rating: 4.8,
    reviews: 156
  },
  {
    id: "b4",
    name: "LED Ceiling Light Fixture",
    price: 45.00,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=80",
    category: "Indoor Fittings",
    rating: 4.7,
    reviews: 98
  }
];

export const latestProducts: Product[] = [
  {
    id: "l1",
    name: "Solar Panel 550W Mono",
    price: 249.00,
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&q=80",
    category: "Solar Solutions",
    rating: 5.0,
    reviews: 12,
    badge: "New"
  },
  {
    id: "l2",
    name: "Smart WiFi Switch Module",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80",
    category: "Switches & Sockets",
    rating: 4.3,
    reviews: 45
  },
  {
    id: "l3",
    name: "Industrial Power Contactor",
    price: 59.00,
    image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80",
    category: "Switchgear",
    rating: 4.8,
    reviews: 230
  },
  {
    id: "l4",
    name: "Flexible Copper Cable 4mm",
    price: 64.99,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80",
    category: "Wire & Cables",
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
