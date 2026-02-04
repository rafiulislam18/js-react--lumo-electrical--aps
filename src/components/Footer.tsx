import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ContactDetails {
  address: string;
  phone: string;
  email: string;
}

interface FooterProps {
  contactDetails: ContactDetails;
}

export function Footer({ contactDetails }: FooterProps) {
  return (
    <footer className="bg-gray-50 pt-16 border-t border-gray-100">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <div className="flex items-center gap-2 cursor-pointer">
                <img src="/images/logo.png" alt="logo" className="" />
              </div>
            </Link>
            <p className="text-gray-500 leading-relaxed text-sm">
              Premium electrical components, tools, and solutions for professionals and DIY enthusiasts. Everything you need for reliable installations and repairs inside Cape Town, SA.
            </p>
            {/* <div className="flex items-center gap-4">
              <SocialLink icon={Facebook} />
              <SocialLink icon={Twitter} />
              <SocialLink icon={Instagram} />
              <SocialLink icon={Youtube} />
            </div> */}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-lg mb-6 text-gray-900">Quick Links</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="/" className="hover:text-primary transition-colors">Home</a></li>
              <li><a href="/products" className="hover:text-primary transition-colors">Featured Products</a></li>
              <li><a href="/products?q=best-sellers" className="hover:text-primary transition-colors">Best Sellers</a></li>
              <li><a href="/products?q=new-arrivals" className="hover:text-primary transition-colors">New Arrivals</a></li>
              <li><a href="/contact-us" className="hover:text-primary transition-colors">Contact Us</a></li>
              {/* <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li> */}
            </ul>
          </div>

          {/* Account & Orders */}
          <div>
            <h4 className="font-display font-bold text-lg mb-6 text-gray-900">Account & Orders</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href="/profile" className="hover:text-primary transition-colors">My Profile</a></li>
              <li><a href="/orders" className="hover:text-primary transition-colors">Order History</a></li>
              <li><a href="/wishlist" className="hover:text-primary transition-colors">Wishlist</a></li>
              <li><a href="/#faq" className="hover:text-primary transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display font-bold text-lg mb-6 text-gray-900">Contact Info</h4>
            <ul className="space-y-4 text-sm text-gray-500 mb-6">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="leading-relaxed whitespace-pre-wrap">{contactDetails.address}</p>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span>{contactDetails.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span>{contactDetails.email}</span>
              </li>
            </ul>
            
            {/* <h5 className="font-bold text-sm mb-3 text-gray-900">Subscribe to our newsletter</h5>
            <div className="flex gap-2">
              <Input placeholder="Your email" className="bg-white border-gray-200" />
              <Button className="bg-primary-gradient px-4">Join</Button>
            </div> */}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 py-8 flex flex-col md:flex-row items-center justify-center gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Lumo Electrical. All rights reserved.
          </p>
          {/* <div className="flex items-center gap-6">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 opacity-50 grayscale hover:grayscale-0 transition-all" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5 opacity-50 grayscale hover:grayscale-0 transition-all" />
          </div> */}
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary hover:bg-green-50 transition-all duration-300">
      <Icon className="w-5 h-5" />
    </a>
  );
}
