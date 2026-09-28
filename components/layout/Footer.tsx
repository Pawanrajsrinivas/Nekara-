import React from "react";
import Image from "next/image";
import Link from "next/link";
import { IndianOrnament } from "@/components/ui/IndianOrnament";

const FOOTER_LINKS = {
  shop: [
    { label: "All Sarees", href: "/shop" },
    { label: "Kanjeevaram Silks", href: "/shop?category=kanchipuram-sarees" },
    { label: "Banarasi Heritage", href: "/shop?category=banarasi-sarees" },
    { label: "Chanderi Handlooms", href: "/shop?category=cotton-sarees" },
    { label: "Party Wear & Festive", href: "/shop?category=party-wear" },
    { label: "Designer Drapes", href: "/shop?category=designer-sarees" },
  ],
  about: [
    { label: "Our Story", href: "/about" },
    { label: "Craftsmanship", href: "/craftsmanship" },
    { label: "The Journal", href: "/journal" },
    { label: "Contact Us", href: "/contact" },
  ],
  help: [
    { label: "Shipping & Delivery", href: "/shipping" },
    { label: "Returns & Exchanges", href: "/returns" },
    { label: "Saree Care Guide", href: "/care-guide" },
    { label: "Client FAQs", href: "/faqs" },
  ],
  follow: [
    { label: "Instagram", href: "https://instagram.com", external: true },
    { label: "Facebook", href: "https://facebook.com", external: true },
    { label: "Pinterest", href: "https://pinterest.com", external: true },
  ],
};

export function Footer() {
  return (
    <footer
      aria-label="NEKARA Brand Footer"
      className="relative w-full bg-[#02221D] text-[#FAF5ED] border-t border-[#B58A45]/30 overflow-hidden"
    >
      {/* Subtle Background Brand Mark in Corner */}
      <div className="absolute -bottom-16 -right-16 w-80 h-80 pointer-events-none opacity-[0.06] select-none z-0">
        <div className="relative w-full h-full">
          <Image
            src="/images/brand/tab%20logo.png"
            alt=""
            fill
            sizes="320px"
            className="object-contain"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-12">
        {/* =========================================================
            TOP ROW: Brand Header & Column Links
           ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 pb-14 border-b border-[#B58A45]/20">
          {/* Brand Info & Mission (2 cols on large screen) */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A45] rounded-xs"
              aria-label="NEKARA Homepage"
            >
              <div className="relative w-10 h-10">
                <Image
                  src="/images/brand/tab%20logo.png"
                  alt="NEKARA Peacock Mark"
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl tracking-[0.2em] font-semibold text-[#FAF5ED] group-hover:text-[#D4AF37] transition-colors uppercase leading-tight">
                  NEKARA
                </span>
                <span className="text-[10px] tracking-[0.25em] text-[#B58A45] uppercase font-sans">
                  Sarees &amp; Textiles
                </span>
              </div>
            </Link>

            <p className="font-serif text-sm sm:text-[15px] italic text-[#EFE2D0]/85 max-w-sm leading-relaxed">
              Sarees crafted from heritage, for the modern woman.
            </p>

            <p className="font-sans text-xs text-[#EFE2D0]/65 max-w-sm leading-relaxed">
              Celebrating India&apos;s master weaving clusters with authenticity, pure silks, and certified handloom zari since 2001.
            </p>

            <div className="pt-2">
              <span className="inline-block text-[10px] font-sans font-semibold uppercase tracking-[0.22em] text-[#B58A45]">
                Bengaluru · Varanasi · Kanchipuram
              </span>
            </div>
          </div>

          {/* Column 1: SHOP */}
          <div>
            <h4 className="font-sans text-[11px] font-semibold uppercase tracking-[0.25em] text-[#B58A45] mb-4">
              SHOP
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.shop.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-xs text-[#FAF5ED]/80 hover:text-[#D4AF37] transition-colors block py-0.5"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: ABOUT */}
          <div>
            <h4 className="font-sans text-[11px] font-semibold uppercase tracking-[0.25em] text-[#B58A45] mb-4">
              ABOUT
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.about.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-xs text-[#FAF5ED]/80 hover:text-[#D4AF37] transition-colors block py-0.5"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: HELP */}
          <div>
            <h4 className="font-sans text-[11px] font-semibold uppercase tracking-[0.25em] text-[#B58A45] mb-4">
              HELP
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.help.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-xs text-[#FAF5ED]/80 hover:text-[#D4AF37] transition-colors block py-0.5"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: FOLLOW */}
          <div>
            <h4 className="font-sans text-[11px] font-semibold uppercase tracking-[0.25em] text-[#B58A45] mb-4">
              FOLLOW
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.follow.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#FAF5ED]/80 hover:text-[#D4AF37] transition-colors block py-0.5"
                  >
                    {item.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* =========================================================
            BOTTOM BAR: Copyright & Legal
           ========================================================= */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#FAF5ED]/65 font-sans">
          <div className="flex items-center gap-2">
            <IndianOrnament size={14} className="text-[#B58A45]" />
            <span>&copy; 2026 NEKARA Sarees &amp; Textiles. All Rights Reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-[#D4AF37] transition-colors">
              Privacy Policy
            </Link>
            <span className="text-[#B58A45]/40">·</span>
            <Link href="/terms" className="hover:text-[#D4AF37] transition-colors">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
