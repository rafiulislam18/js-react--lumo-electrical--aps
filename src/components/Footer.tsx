import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Mail, MapPin, Phone, ArrowRight, ClipboardList } from "lucide-react";

interface ContactDetails {
  address: string;
  phone: string;
  email: string;
}

interface FooterProps {
  contactDetails: ContactDetails;
}

/* Build a wa.me link: digits only, country code, no leading "+" / "00" / separators */
function whatsappHref(phone: string) {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  return `https://wa.me/${digits}`;
}

export function Footer({ contactDetails }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="font-outfit bg-[#060806] text-[#f0f2ed]/60 border-t border-white/[0.06]">

      {/* CTA BANNER */}
      <div className="relative overflow-hidden bg-[#0d1a0f] px-4 py-12 sm:px-8 sm:py-16">
        <div className="pointer-events-none absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full bg-[#3aaa49]/20 blur-[96px]" />
        <div className="pointer-events-none absolute -bottom-20 right-0 w-[380px] h-[380px] rounded-full bg-[#a8d63e]/15 blur-[80px]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(168,214,62,1) 1px, transparent 1px), linear-gradient(90deg, rgba(168,214,62,1) 1px, transparent 1px)', backgroundSize: '48px 48px' }}
        />
        <div className="relative max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6 text-center sm:text-left">
            <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-[#3aaa49] to-[#a8d63e] grid place-items-center shadow-[0_0_32px_rgba(168,214,62,0.35)]">
              <ClipboardList size={28} className="text-[#0a0c0a]" />
            </div>
            <div>
              <div className="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-[#a8d63e]/70 mb-1">
                Trade &amp; Contractors
              </div>
              <div className="font-bebas text-xl sm:text-[2rem] leading-none text-white mb-[0.35rem]">
                Need A Quote For Trade Account?
              </div>
              <div className="text-[0.75rem] sm:text-[0.85rem] text-white/55 font-light">
                Get exclusive pricing for contractors and electricians.
              </div>
            </div>
          </div>
          <a
            href="/contact-us"
            className="inline-flex items-center gap-[0.6rem] font-outfit font-bold text-[0.75rem] sm:text-[0.82rem] tracking-[0.1em] uppercase px-5 sm:px-7 py-2 sm:py-[0.9rem] rounded-lg border border-[#a8d63e]/30 cursor-pointer bg-gradient-to-r from-[#3aaa49] to-[#a8d63e] text-[#0a0c0a] no-underline shadow-[0_0_32px_rgba(168,214,62,0.25)] transition-all duration-200 hover:shadow-[0_0_48px_rgba(168,214,62,0.45)] hover:-translate-y-0.5 whitespace-nowrap flex-shrink-0"
          >
            Get in Touch <ArrowRight size={15} />
          </a>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="max-w-[1280px] mx-auto px-8 pt-20 pb-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-[1.6fr_1fr_1fr_1.4fr] lg:gap-16">

          {/* Brand */}
          <div>
            <Link to="/">
              <img src="/images/logo-light.png" alt="Lumo Electrical" className="h-[38px] mb-5 block" />
            </Link>
            <p className="text-[0.88rem] leading-[1.8] font-light max-w-[280px] mb-7 text-[#f0f2ed]/60">
              Premium electrical components, tools and solutions trusted by professionals and DIY enthusiasts across Cape Town, South Africa.
            </p>
            {/* <div className="flex gap-[0.6rem]">
              {[
                { icon: <Facebook size={15} />, href: '#' },
                { icon: <Instagram size={15} />, href: '#' },
                { icon: <Youtube size={15} />, href: '#' },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className="w-9 h-9 rounded-md bg-white/[0.05] border border-white/[0.08] grid place-items-center text-[#f0f2ed]/50 no-underline transition-all duration-200 hover:bg-[#a8d63e]/10 hover:border-[#a8d63e]/30 hover:text-[#a8d63e]"
                >
                  {s.icon}
                </a>
              ))}
            </div> */}
          </div>

          {/* Quick Links */}
          <div>
            <div className="font-bebas text-[1.1rem] tracking-[0.08em] text-[#f0f2ed] mb-5">Quick Links</div>
            <ul className="list-none p-0 m-0 flex flex-col gap-[0.65rem]">
              {[
                { label: 'Home',         href: '/' },
                { label: 'All Products', href: '/products' },
                { label: 'Best Sellers', href: '/products?q=best-sellers' },
                { label: 'New Arrivals', href: '/products?q=new-arrivals' },
                { label: 'Contact Us',   href: '/contact-us' },
              ].map(l => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="group text-[0.85rem] text-[#f0f2ed]/45 no-underline font-normal transition-colors duration-200 hover:text-[#a8d63e] inline-flex items-center gap-[0.35rem]"
                  >
                    <ArrowRight size={11} className="opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <div className="font-bebas text-[1.1rem] tracking-[0.08em] text-[#f0f2ed] mb-5">My Account</div>
            <ul className="list-none p-0 m-0 flex flex-col gap-[0.65rem]">
              {[
                { label: 'My Profile',      href: '/profile' },
                { label: 'Order History',   href: '/orders' },
                { label: 'Wishlist',        href: '/wishlist' },
                { label: 'FAQ',             href: '/#faq' },
                { label: 'Change Password', href: '/change-password' },
              ].map(l => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="group text-[0.85rem] text-[#f0f2ed]/45 no-underline font-normal transition-colors duration-200 hover:text-[#a8d63e] inline-flex items-center gap-[0.35rem]"
                  >
                    <ArrowRight size={11} className="opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div className="font-bebas text-[1.1rem] tracking-[0.08em] text-[#f0f2ed] mb-5">Contact Info</div>
            {[
              { icon: <MapPin size={14} />, text: contactDetails.address, wrap: true },
              { icon: <Phone size={14} />,  text: contactDetails.phone, href: whatsappHref(contactDetails.phone), external: true },
              { icon: <Mail size={14} />,   text: contactDetails.email, href: `mailto:${contactDetails.email}` },
            ].map((item, i) => {
              const iconBox = (
                <div className="w-8 h-8 rounded-md flex-shrink-0 bg-[#a8d63e]/10 border border-[#a8d63e]/15 grid place-items-center text-[#a8d63e]">
                  {item.icon}
                </div>
              );
              if (item.href) {
                return (
                  <a
                    key={i}
                    href={item.href}
                    {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="group flex items-start gap-[0.85rem] mb-[1.1rem] no-underline"
                  >
                    {iconBox}
                    <div className="text-[0.85rem] leading-[1.6] font-light text-[#f0f2ed]/50 transition-colors duration-200 group-hover:text-[#a8d63e] break-all">
                      {item.text}
                    </div>
                  </a>
                );
              }
              return (
                <div key={i} className="flex items-start gap-[0.85rem] mb-[1.1rem]">
                  {iconBox}
                  <div
                    className="text-[0.85rem] leading-[1.6] font-light text-[#f0f2ed]/50"
                    style={item.wrap ? { whiteSpace: 'pre-wrap' } : undefined}
                  >
                    {item.text}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-white/[0.1] px-8 py-6">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between flex-wrap gap-4">
          <span className="text-[0.75rem] text-[#f0f2ed]/60 font-light">
            © {year}{' '}
            <a href="/" className="text-[#a8d63e]/70 no-underline">Lumo Electrical</a>
            . All rights reserved. Cape Town, South Africa.
          </span>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Use'].map(label => (
              <a
                key={label}
                href="#"
                className="text-[0.72rem] text-[#f0f2ed]/60 no-underline transition-colors duration-200 hover:text-[#f0f2ed]/55"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
}
