import { 
  Zap, Cable, Package, Cpu, Lightbulb,
  ToggleLeft, Grid3x3, Sun, Link2,
  LampCeiling
} from "lucide-react";

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: React.ElementType;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  categoryId: string;
  rating: number;
  reviews: number;
  badge?: "New" | "Sale" | "Hot";
  inStock?: boolean;
  description?: string;
  // One-to-one relationship fields
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const categories: Category[] = [
  { id: "1", name: "Circuit Breakers", slug: "circuit-breakers", icon: Zap },
  { id: "2", name: "Wire & Cables", slug: "wire-cables", icon: Cable },
  { id: "3", name: "Cable Management", slug: "cable-management", icon: Package },
  { id: "4", name: "Switchgear", slug: "switchgear", icon: Cpu },
  { id: "5", name: "LED Lamps", slug: "led-lamps", icon: Lightbulb },
  { id: "6", name: "Switches & Sockets", slug: "switches-sockets", icon: ToggleLeft },
  { id: "7", name: "Distribution Boards", slug: "distribution-boards", icon: Grid3x3 },
  { id: "8", name: "Solar Solutions", slug: "solar-solutions", icon: Sun },
  { id: "9", name: "Joiners", slug: "joiners", icon: Link2 },
  { id: "10", name: "Indoor Fittings", slug: "indoor-fittings", icon: LampCeiling },
];

// export const featuredProducts: Product[] = [
//   {
//     id: "f1",
//     name: "MCB Circuit Breaker 32A",
//     price: 18.99,
//     oldPrice: 22.99,
//     image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&q=80",
//     category: "Circuit Breakers",
//     categoryId: "1",
//     rating: 4.8,
//     reviews: 124,
//     badge: "Hot"
//   },
//   {
//     id: "f2",
//     name: "Copper Electrical Wire 2.5mm (90m)",
//     price: 79.00,
//     image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80",
//     category: "Wire & Cables",
//     categoryId: "2",
//     rating: 4.9,
//     reviews: 89,
//     badge: "New"
//   },
//   {
//     id: "f3",
//     name: "LED Panel Light 24W",
//     price: 29.99,
//     oldPrice: 39.99,
//     image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80",
//     category: "LED Lamps",
//     categoryId: "5",
//     rating: 4.7,
//     reviews: 56,
//     badge: "Sale"
//   },
//   {
//     id: "f4",
//     name: "Modular Switch Socket Combo",
//     price: 12.50,
//     image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80",
//     category: "Switches & Sockets",
//     categoryId: "6",
//     rating: 4.5,
//     reviews: 32
//   },
//   {
//     id: "f5",
//     name: "Circuit Breaker RCCB 63A",
//     price: 45.99,
//     oldPrice: 54.99,
//     image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&q=80",
//     category: "Circuit Breakers",
//     categoryId: "1",
//     rating: 4.6,
//     reviews: 78,
//     badge: "Sale"
//   },
//   {
//     id: "f6",
//     name: "Armored Electrical Cable 4mm",
//     price: 89.99,
//     image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80",
//     category: "Wire & Cables",
//     categoryId: "2",
//     rating: 4.8,
//     reviews: 145
//   },
//   {
//     id: "f7",
//     name: "LED Downlight 12W White",
//     price: 16.50,
//     oldPrice: 22.00,
//     image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80",
//     category: "LED Lamps",
//     categoryId: "5",
//     rating: 4.9,
//     reviews: 203,
//     badge: "Hot"
//   },
//   {
//     id: "f8",
//     name: "Double Gang Switch Plate",
//     price: 8.99,
//     image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80",
//     category: "Switches & Sockets",
//     categoryId: "6",
//     rating: 4.4,
//     reviews: 67
//   }
// ];

// export const bestSellers: Product[] = [
//   {
//     id: "b1",
//     name: "Distribution Board 12 Way",
//     price: 89.99,
//     image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80",
//     category: "Distribution Boards",
//     categoryId: "7",
//     rating: 4.9,
//     reviews: 230,
//     badge: "Hot"
//   },
//   {
//     id: "b2",
//     name: "Cable Trunking PVC (2m)",
//     price: 9.99,
//     oldPrice: 12.99,
//     image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80",
//     category: "Cable Management",
//     categoryId: "3",
//     rating: 4.6,
//     reviews: 412,
//     badge: "Sale"
//   },
//   {
//     id: "b3",
//     name: "MC4 Solar Connector Pair",
//     price: 6.50,
//     image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=500&q=80",
//     category: "Joiners",
//     categoryId: "9",
//     rating: 4.8,
//     reviews: 156
//   },
//   {
//     id: "b4",
//     name: "LED Ceiling Light Fixture",
//     price: 45.00,
//     image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=80",
//     category: "Indoor Fittings",
//     categoryId: "10",
//     rating: 4.7,
//     reviews: 98
//   },
//   {
//     id: "b5",
//     name: "Distribution Board 18 Way",
//     price: 129.99,
//     oldPrice: 149.99,
//     image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80",
//     category: "Distribution Boards",
//     categoryId: "7",
//     rating: 4.8,
//     reviews: 189,
//     badge: "Sale"
//   },
//   {
//     id: "b6",
//     name: "Cable Tray Brackets (Pack of 6)",
//     price: 24.99,
//     image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80",
//     category: "Cable Management",
//     categoryId: "3",
//     rating: 4.5,
//     reviews: 92
//   },
//   {
//     id: "b7",
//     name: "Heavy Duty Switch 16A",
//     price: 14.99,
//     image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80",
//     category: "Switches & Sockets",
//     categoryId: "6",
//     rating: 4.9,
//     reviews: 278
//   },
//   {
//     id: "b8",
//     name: "Switchgear Earth Fault Module",
//     price: 35.50,
//     oldPrice: 42.00,
//     image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80",
//     category: "Switchgear",
//     categoryId: "4",
//     rating: 4.7,
//     reviews: 134,
//     badge: "Sale"
//   }
// ];

// export const latestProducts: Product[] = [
//   {
//     id: "l1",
//     name: "Solar Panel 550W Mono",
//     price: 249.00,
//     image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&q=80",
//     category: "Solar Solutions",
//     categoryId: "8",
//     rating: 5.0,
//     reviews: 12,
//     badge: "New"
//   },
//   {
//     id: "l2",
//     name: "Smart WiFi Switch Module",
//     price: 24.99,
//     image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80",
//     category: "Switches & Sockets",
//     categoryId: "6",
//     rating: 4.3,
//     reviews: 45
//   },
//   {
//     id: "l3",
//     name: "Industrial Power Contactor",
//     price: 59.00,
//     image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80",
//     category: "Switchgear",
//     categoryId: "4",
//     rating: 4.8,
//     reviews: 230
//   },
//   {
//     id: "l4",
//     name: "Flexible Copper Cable 4mm",
//     price: 64.99,
//     image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80",
//     category: "Wire & Cables",
//     categoryId: "2",
//     rating: 4.5,
//     reviews: 87
//   },
//   {
//     id: "l5",
//     name: "Solar Inverter 3KW",
//     price: 399.99,
//     oldPrice: 499.99,
//     image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&q=80",
//     category: "Solar Solutions",
//     categoryId: "8",
//     rating: 4.9,
//     reviews: 56,
//     badge: "New"
//   },
//   {
//     id: "l6",
//     name: "Wall-Mounted Indoor Light",
//     price: 32.50,
//     image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=80",
//     category: "Indoor Fittings",
//     categoryId: "10",
//     rating: 4.6,
//     reviews: 74
//   },
//   {
//     id: "l7",
//     name: "Three Phase Power Meter",
//     price: 89.50,
//     image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80",
//     category: "Switchgear",
//     categoryId: "4",
//     rating: 4.8,
//     reviews: 112
//   },
//   {
//     id: "l8",
//     name: "Plug & Socket 32A Industrial",
//     price: 22.00,
//     oldPrice: 28.00,
//     image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80",
//     category: "Switches & Sockets",
//     categoryId: "6",
//     rating: 4.7,
//     reviews: 156,
//     badge: "Sale"
//   }
// ];

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

// Comprehensive products array - our fake database for the whole project
export const allProducts: Product[] = [
  // Category 1: Circuit Breakers (6 products)
  { id: "p1-1", name: "MCB Circuit Breaker 6A", price: 8.99, oldPrice: 10.99, image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&q=80", category: "Circuit Breakers", categoryId: "1", rating: 4.8, reviews: 124, badge: "Hot", inStock: true, isFeatured: true },
  { id: "p1-2", name: "MCB Circuit Breaker 16A", price: 12.50, oldPrice: 15.00, image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&q=80", category: "Circuit Breakers", categoryId: "1", rating: 4.9, reviews: 89, inStock: true, isBestSeller: true },
  { id: "p1-3", name: "MCB Circuit Breaker 32A", price: 18.99, oldPrice: 22.99, image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&q=80", category: "Circuit Breakers", categoryId: "1", rating: 4.8, reviews: 156, badge: "Sale", inStock: true, isFeatured: true },
  { id: "p1-4", name: "RCCB 30mA 63A", price: 45.99, oldPrice: 54.99, image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&q=80", category: "Circuit Breakers", categoryId: "1", rating: 4.7, reviews: 78, inStock: true },
  { id: "p1-5", name: "Double Pole MCB 32A", price: 28.50, oldPrice: 34.00, image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&q=80", category: "Circuit Breakers", categoryId: "1", rating: 4.6, reviews: 102, badge: "New", inStock: true, isNewArrival: true },
  { id: "p1-6", name: "Thermal Magnetic Breaker", price: 24.99, image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&q=80", category: "Circuit Breakers", categoryId: "1", rating: 4.5, reviews: 67, inStock: true },

  // Category 2: Wire & Cables (6 products)
  { id: "p2-1", name: "Copper Wire 1.5mm (90m)", price: 39.99, oldPrice: 49.99, image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80", category: "Wire & Cables", categoryId: "2", rating: 4.9, reviews: 234, badge: "Hot", inStock: true, isBestSeller: true },
  { id: "p2-2", name: "Copper Wire 2.5mm (90m)", price: 79.00, image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80", category: "Wire & Cables", categoryId: "2", rating: 4.9, reviews: 189, inStock: true, isFeatured: true },
  { id: "p2-3", name: "Armored Electrical Cable 4mm", price: 89.99, image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80", category: "Wire & Cables", categoryId: "2", rating: 4.8, reviews: 145, inStock: true },
  { id: "p2-4", name: "Flexible Copper Cable 4mm", price: 64.99, image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80", category: "Wire & Cables", categoryId: "2", rating: 4.5, reviews: 87, inStock: true },
  { id: "p2-5", name: "Multi-Strand Copper Cable 6mm", price: 124.50, oldPrice: 149.00, image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80", category: "Wire & Cables", categoryId: "2", rating: 4.7, reviews: 92, badge: "Sale", inStock: true, isNewArrival: true },
  { id: "p2-6", name: "Underground Power Cable 10mm", price: 199.99, image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80", category: "Wire & Cables", categoryId: "2", rating: 4.6, reviews: 56, inStock: true },

  // Category 3: Cable Management (6 products)
  { id: "p3-1", name: "Cable Trunking PVC (2m)", price: 9.99, oldPrice: 12.99, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80", category: "Cable Management", categoryId: "3", rating: 4.6, reviews: 412, badge: "Hot", inStock: true, isFeatured: true },
  { id: "p3-2", name: "Cable Tray Steel Galvanized (3m)", price: 34.99, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80", category: "Cable Management", categoryId: "3", rating: 4.7, reviews: 178, inStock: true },
  { id: "p3-3", name: "Cable Tray Brackets (Pack of 6)", price: 24.99, oldPrice: 29.99, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80", category: "Cable Management", categoryId: "3", rating: 4.5, reviews: 92, inStock: true, isBestSeller: true },
  { id: "p3-4", name: "PVC Conduit Pipe 20mm (4m)", price: 12.50, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80", category: "Cable Management", categoryId: "3", rating: 4.4, reviews: 67, badge: "New", inStock: true, isNewArrival: true },
  { id: "p3-5", name: "Cable Clips & Fasteners (50pcs)", price: 8.99, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80", category: "Cable Management", categoryId: "3", rating: 4.8, reviews: 234, inStock: true },
  { id: "p3-6", name: "Metal Cable Tray (5m)", price: 79.50, oldPrice: 95.00, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80", category: "Cable Management", categoryId: "3", rating: 4.6, reviews: 112, badge: "Sale", inStock: true },

  // Category 4: Switchgear (6 products)
  { id: "p4-1", name: "Industrial Power Contactor 40A", price: 59.00, image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80", category: "Switchgear", categoryId: "4", rating: 4.8, reviews: 230, inStock: true, isBestSeller: true },
  { id: "p4-2", name: "Switchgear Earth Fault Module", price: 35.50, oldPrice: 42.00, image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80", category: "Switchgear", categoryId: "4", rating: 4.7, reviews: 134, badge: "Sale", inStock: true },
  { id: "p4-3", name: "Three Phase Power Meter", price: 89.50, image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80", category: "Switchgear", categoryId: "4", rating: 4.8, reviews: 112, inStock: true, isFeatured: true },
  { id: "p4-4", name: "Motor Protection Circuit Breaker", price: 45.00, oldPrice: 55.00, image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80", category: "Switchgear", categoryId: "4", rating: 4.6, reviews: 89, badge: "New", inStock: true, isNewArrival: true },
  { id: "p4-5", name: "Soft Starter Module 45A", price: 129.99, image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80", category: "Switchgear", categoryId: "4", rating: 4.9, reviews: 145, inStock: true },
  { id: "p4-6", name: "Surge Protection Device SPD", price: 24.50, image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80", category: "Switchgear", categoryId: "4", rating: 4.5, reviews: 78, inStock: true },

  // Category 5: LED Lamps (6 products)
  { id: "p5-1", name: "LED Bulb 9W Warm White", price: 4.50, oldPrice: 6.99, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80", category: "LED Lamps", categoryId: "5", rating: 4.9, reviews: 567, badge: "Hot", inStock: true, isFeatured: true },
  { id: "p5-2", name: "LED Panel Light 24W", price: 29.99, oldPrice: 39.99, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80", category: "LED Lamps", categoryId: "5", rating: 4.7, reviews: 156, badge: "Sale", inStock: true },
  { id: "p5-3", name: "LED Downlight 12W White", price: 16.50, oldPrice: 22.00, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80", category: "LED Lamps", categoryId: "5", rating: 4.9, reviews: 203, badge: "Hot", inStock: true, isBestSeller: true },
  { id: "p5-4", name: "LED Tube Light 18W (2ft)", price: 12.99, oldPrice: 17.50, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80", category: "LED Lamps", categoryId: "5", rating: 4.6, reviews: 134, inStock: true },
  { id: "p5-5", name: "LED Spotlight 7W RGB", price: 19.99, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80", category: "LED Lamps", categoryId: "5", rating: 4.8, reviews: 89, badge: "New", inStock: true, isNewArrival: true },
  { id: "p5-6", name: "LED Strip Light 10m (RGB)", price: 34.99, oldPrice: 44.99, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80", category: "LED Lamps", categoryId: "5", rating: 4.7, reviews: 245, badge: "Sale", inStock: true },

  // Category 6: Switches & Sockets (6 products)
  { id: "p6-1", name: "Single Gang Switch Plate", price: 4.99, image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80", category: "Switches & Sockets", categoryId: "6", rating: 4.7, reviews: 234, inStock: true },
  { id: "p6-2", name: "Double Gang Switch Plate", price: 8.99, image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80", category: "Switches & Sockets", categoryId: "6", rating: 4.4, reviews: 67, inStock: true },
  { id: "p6-3", name: "Modular Switch Socket Combo", price: 12.50, image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80", category: "Switches & Sockets", categoryId: "6", rating: 4.5, reviews: 89, inStock: true, isFeatured: true },
  { id: "p6-4", name: "Heavy Duty Switch 16A", price: 14.99, image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80", category: "Switches & Sockets", categoryId: "6", rating: 4.9, reviews: 278, badge: "Hot", inStock: true, isBestSeller: true },
  { id: "p6-5", name: "Smart WiFi Switch Module", price: 24.99, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80", category: "Switches & Sockets", categoryId: "6", rating: 4.3, reviews: 45, badge: "New", inStock: true, isNewArrival: true },
  { id: "p6-6", name: "Plug & Socket 32A Industrial", price: 22.00, oldPrice: 28.00, image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80", category: "Switches & Sockets", categoryId: "6", rating: 4.7, reviews: 156, badge: "Sale", inStock: true },

  // Category 7: Distribution Boards (6 products)
  { id: "p7-1", name: "Distribution Board 6 Way", price: 49.99, image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80", category: "Distribution Boards", categoryId: "7", rating: 4.6, reviews: 123, inStock: true },
  { id: "p7-2", name: "Distribution Board 12 Way", price: 89.99, image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80", category: "Distribution Boards", categoryId: "7", rating: 4.9, reviews: 230, badge: "Hot", inStock: true, isBestSeller: true },
  { id: "p7-3", name: "Distribution Board 18 Way", price: 129.99, oldPrice: 149.99, image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80", category: "Distribution Boards", categoryId: "7", rating: 4.8, reviews: 189, badge: "Sale", inStock: true },
  { id: "p7-4", name: "MCB Distribution Board 24 Way", price: 189.99, image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80", category: "Distribution Boards", categoryId: "7", rating: 4.9, reviews: 156, inStock: true, isFeatured: true },
  { id: "p7-5", name: "RCCB Protection Board 12 Way", price: 159.50, oldPrice: 189.00, image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80", category: "Distribution Boards", categoryId: "7", rating: 4.7, reviews: 98, badge: "New", inStock: true, isNewArrival: true },
  { id: "p7-6", name: "Industrial Distribution Panel", price: 249.99, image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?w=500&q=80", category: "Distribution Boards", categoryId: "7", rating: 4.8, reviews: 112, inStock: true },

  // Category 8: Solar Solutions (6 products)
  { id: "p8-1", name: "Solar Panel 100W Mono", price: 89.99, image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&q=80", category: "Solar Solutions", categoryId: "8", rating: 4.8, reviews: 156, badge: "New", inStock: true, isNewArrival: true },
  { id: "p8-2", name: "Solar Panel 250W Mono", price: 179.99, image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&q=80", category: "Solar Solutions", categoryId: "8", rating: 4.9, reviews: 234, inStock: true, isFeatured: true },
  { id: "p8-3", name: "Solar Panel 550W Mono", price: 249.00, image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&q=80", category: "Solar Solutions", categoryId: "8", rating: 5.0, reviews: 112, badge: "Hot", inStock: true },
  { id: "p8-4", name: "Solar Inverter 3KW", price: 399.99, oldPrice: 499.99, image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&q=80", category: "Solar Solutions", categoryId: "8", rating: 4.9, reviews: 156, badge: "Sale", inStock: true },
  { id: "p8-5", name: "Solar Charge Controller MPPT 60A", price: 249.50, image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&q=80", category: "Solar Solutions", categoryId: "8", rating: 4.7, reviews: 89, inStock: true, isBestSeller: true },
  { id: "p8-6", name: "Lithium Battery 5KWh", price: 1299.99, image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&q=80", category: "Solar Solutions", categoryId: "8", rating: 4.8, reviews: 45, inStock: true },

  // Category 9: Joiners (6 products)
  { id: "p9-1", name: "MC4 Solar Connector Pair", price: 6.50, image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=500&q=80", category: "Joiners", categoryId: "9", rating: 4.8, reviews: 156, inStock: true, isFeatured: true },
  { id: "p9-2", name: "T-Junction Cable Connector", price: 4.99, image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=500&q=80", category: "Joiners", categoryId: "9", rating: 4.5, reviews: 78, badge: "New", inStock: true, isNewArrival: true },
  { id: "p9-3", name: "Wire Splice Connector (Pack of 10)", price: 5.99, image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=500&q=80", category: "Joiners", categoryId: "9", rating: 4.6, reviews: 123, inStock: true },
  { id: "p9-4", name: "Cable Terminal Lug (Assorted)", price: 7.50, image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=500&q=80", category: "Joiners", categoryId: "9", rating: 4.7, reviews: 234, inStock: true },
  { id: "p9-5", name: "Crimp Connector Tool Kit", price: 34.99, oldPrice: 44.99, image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=500&q=80", category: "Joiners", categoryId: "9", rating: 4.8, reviews: 89, badge: "Sale", inStock: true, isBestSeller: true },
  { id: "p9-6", name: "Battery Terminal Connector", price: 12.50, image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=500&q=80", category: "Joiners", categoryId: "9", rating: 4.4, reviews: 45, inStock: true },

  // Category 10: Indoor Fittings (6 products)
  { id: "p10-1", name: "LED Ceiling Light Fixture", price: 45.00, image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=80", category: "Indoor Fittings", categoryId: "10", rating: 4.7, reviews: 98, inStock: true, isBestSeller: true },
  { id: "p10-2", name: "Wall-Mounted Indoor Light", price: 32.50, image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=80", category: "Indoor Fittings", categoryId: "10", rating: 4.6, reviews: 74, badge: "New", inStock: true, isNewArrival: true },
  { id: "p10-3", name: "Flush Mount Ceiling Light", price: 38.99, oldPrice: 49.99, image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=80", category: "Indoor Fittings", categoryId: "10", rating: 4.8, reviews: 156, badge: "Sale", inStock: true },
  { id: "p10-4", name: "Pendant Light Fixture", price: 55.00, image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=80", category: "Indoor Fittings", categoryId: "10", rating: 4.9, reviews: 112, badge: "Hot", inStock: true, isFeatured: true },
  { id: "p10-5", name: "Wall Sconce Light Pair", price: 67.50, oldPrice: 85.00, image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=80", category: "Indoor Fittings", categoryId: "10", rating: 4.7, reviews: 89, inStock: true },
  { id: "p10-6", name: "Track Light System 4-Head", price: 89.99, image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=80", category: "Indoor Fittings", categoryId: "10", rating: 4.8, reviews: 134, inStock: true }
];

// Helper functions to get products by their one-to-one relationships
export const featuredProducts: Product[] = allProducts.filter(p => p.isFeatured);
export const bestSellers: Product[] = allProducts.filter(p => p.isBestSeller);
export const latestProducts: Product[] = allProducts.filter(p => p.isNewArrival);

// Calculate min and max prices from all products
export const MIN_PRODUCT_PRICE = Math.min(...allProducts.map(p => p.price));
export const MAX_PRODUCT_PRICE = Math.max(...allProducts.map(p => p.price));
