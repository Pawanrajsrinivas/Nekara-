"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IndianOrnament } from "@/components/ui/IndianOrnament";

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

const FOOTER_LINKS: Record<string, FooterLink[]> = {
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

const SECTIONS: { key: string; title: string }[] = [
  { key: "shop", title: "SHOP" },
  { key: "about", title: "ABOUT" },
  { key: "help", title: "HELP" },
  { key: "follow", title: "FOLLOW" },
];

export function Footer() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (key: string) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  return (
    <footer
      aria-label="NEKARA Brand Footer"
      className="relative w-full bg-[#02221D] text-[#FAF5ED] border-t border-[#B58A45]/30 overflow-hidden"
    >
      {/* Subtle Background Brand Mark in Corner */}
      <div className="absolute -bottom-16 -right-16 w-72 h-72 sm:w-80 sm:h-80 pointer-events-none opacity-[0.07] select-none z-0">
        <div className="relative w-full h-full">
          <Image
            src="/images/brand/brand1.png"
            alt=""
            fill
            sizes="320px"
            className="object-contain"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-10 sm:pb-12">
        {/* =========================================================
            DESKTOP LAYOUT (md & above): Preserved Multi-Column Grid
           ========================================================= */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 pb-14 border-b border-[#B58A45]/20">
          {/* Brand Info & Mission (2 cols on large screen) */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A45] rounded-xs"
              aria-label="NEKARA Homepage"
            >
              <div className="relative w-11 h-11 shrink-0 p-0.5 rounded-full ring-1 ring-[#B58A45]/40 bg-[#011C18]/80 overflow-hidden">
                <Image
                  src="/images/brand/brand1.png"
                  alt="NEKARA Official Brand Logo"
                  fill
                  sizes="44px"
                  className="object-contain drop-shadow-md"
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

          {/* Columns: SHOP, ABOUT, HELP, FOLLOW */}
          {SECTIONS.map((sec) => (
            <div key={`desktop-${sec.key}`}>
              <h4 className="font-sans text-[11px] font-semibold uppercase tracking-[0.25em] text-[#B58A45] mb-4">
                {sec.title}
              </h4>
              <ul className="space-y-2.5">
                {FOOTER_LINKS[sec.key].map((item) => (
                  <li key={item.label}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#FAF5ED]/80 hover:text-[#D4AF37] transition-colors block py-0.5"
                      >
                        {item.label} ↗
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className="text-xs text-[#FAF5ED]/80 hover:text-[#D4AF37] transition-colors block py-0.5"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* =========================================================
            MOBILE LAYOUT (< md): Compact Accordion & Brand Header
           ========================================================= */}
        <div className="md:hidden pb-8 border-b border-[#B58A45]/20">
          {/* Mobile Brand Header */}
          <div className="text-center pb-8 border-b border-[#B58A45]/20">
            <Link
              href="/"
              className="inline-flex flex-col items-center gap-2.5 group focus-visible:outline-none"
              aria-label="NEKARA Homepage"
            >
              <div className="relative w-14 h-14 p-1 rounded-full ring-1 ring-[#B58A45]/45 bg-[#011C18]/90 overflow-hidden shadow-md">
                <Image
                  src="/images/brand/brand1.png"
                  alt="NEKARA Official Brand Logo"
                  fill
                  sizes="56px"
                  className="object-contain drop-shadow-md"
                />
              </div>
              <div className="flex flex-col items-center">
                <span className="font-serif text-2xl tracking-[0.24em] font-semibold text-[#FAF5ED] group-hover:text-[#D4AF37] transition-colors uppercase leading-tight">
                  NEKARA
                </span>
                <span className="text-[10px] tracking-[0.28em] text-[#B58A45] uppercase font-sans font-medium mt-0.5">
                  Sarees &amp; Textiles
                </span>
              </div>
            </Link>

            <p className="font-serif text-xs sm:text-sm italic text-[#EFE2D0]/85 mt-3 max-w-xs mx-auto leading-relaxed">
              Sarees crafted from heritage, for the modern woman.
            </p>

            <p className="text-[10px] text-[#B58A45] font-sans uppercase tracking-[0.22em] mt-2">
              Estd. 2001 · Bengaluru · Varanasi · Kanchipuram
            </p>
          </div>

          {/* Accordion Sections: SHOP, ABOUT, HELP, FOLLOW */}
          <div className="divide-y divide-[#B58A45]/15 pt-2">
            {SECTIONS.map((sec) => {
              const isOpen = openSection === sec.key;
              return (
                <div key={`mobile-${sec.key}`} className="py-1">
                  <button
                    type="button"
                    onClick={() => toggleSection(sec.key)}
                    className="w-full flex items-center justify-between py-3.5 px-1 text-left text-xs font-semibold uppercase tracking-[0.22em] text-[#FAF5ED] hover:text-[#D4AF37] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B58A45] min-h-[44px]"
                    aria-expanded={isOpen}
                    aria-controls={`footer-accordion-${sec.key}`}
                  >
                    <span>{sec.title}</span>
                    <span
                      className="font-mono text-base font-light text-[#B58A45] w-6 h-6 flex items-center justify-center transition-transform duration-200"
                      aria-hidden="true"
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  {/* Smooth Collapsible Link Panel */}
                  <div
                    id={`footer-accordion-${sec.key}`}
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-96 opacity-100 pb-3 pt-1" : "max-h-0 opacity-0 pointer-events-none"
                    }`}
                  >
                    <ul className="space-y-2.5 pl-2 border-l border-[#B58A45]/25 ml-1">
                      {FOOTER_LINKS[sec.key].map((item) => (
                        <li key={`mobile-link-${item.label}`}>
                          {item.external ? (
                            <a
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#EFE2D0]/80 hover:text-[#D4AF37] transition-colors block py-1.5 min-h-[36px] flex items-center"
                            >
                              {item.label} ↗
                            </a>
                          ) : (
                            <Link
                              href={item.href}
                              className="text-xs text-[#EFE2D0]/80 hover:text-[#D4AF37] transition-colors block py-1.5 min-h-[36px] flex items-center"
                            >
                              {item.label}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Follow & Social Quick Row */}
          <div className="pt-6 flex flex-col items-center gap-3">
            <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.25em] text-[#B58A45]">
              CONNECT WITH NEKARA
            </span>
            <div className="flex items-center justify-center gap-6">
              {FOOTER_LINKS.follow.map((social) => (
                <a
                  key={`social-bar-${social.label}`}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#FAF5ED]/80 hover:text-[#D4AF37] transition-colors py-1.5 px-2 rounded-xs border border-[#B58A45]/30 hover:border-[#B58A45] min-h-[40px] flex items-center justify-center text-[11px] tracking-wider uppercase"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* =========================================================
            BOTTOM BAR: Copyright & Legal (Responsive for Mobile & Desktop)
           ========================================================= */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#FAF5ED]/65 font-sans text-center sm:text-left">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <IndianOrnament size={14} className="text-[#B58A45]" />
            <span>&copy; 2026 NEKARA Sarees &amp; Textiles. All Rights Reserved.</span>
          </div>

          <div className="flex items-center justify-center gap-5 flex-wrap">
            <Link href="/privacy" className="hover:text-[#D4AF37] transition-colors py-1">
              Privacy Policy
            </Link>
            <span className="text-[#B58A45]/40">·</span>
            <Link href="/terms" className="hover:text-[#D4AF37] transition-colors py-1">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
