"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IndianOrnament } from "@/components/ui/IndianOrnament";
import { CONTACT_CONFIG } from "@/lib/contact-config";

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
  legal: [
    { label: "Shipping & Delivery Policy", href: "/shipping" },
    { label: "Return, Exchange & Refund Policy", href: "/returns" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
};

const SECTIONS: { key: string; title: string }[] = [
  { key: "shop", title: "SHOP" },
  { key: "legal", title: "POLICIES & LEGAL" },
];

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function PinterestIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="9" x2="12" y2="21" />
      <path d="M8 12a4 4 0 1 0 8 0c0-3.3-2.7-6-6-6a6 6 0 0 0-6 6c0 1.5.5 2.8 1.4 3.9" />
    </svg>
  );
}

const SOCIAL_ITEMS = [
  {
    platform: "instagram" as const,
    label: "Instagram",
    icon: InstagramIcon,
    ariaLabel: "Follow NEKARA on Instagram",
  },
  {
    platform: "facebook" as const,
    label: "Facebook",
    icon: FacebookIcon,
    ariaLabel: "Follow NEKARA on Facebook",
  },
  {
    platform: "pinterest" as const,
    label: "Pinterest",
    icon: PinterestIcon,
    ariaLabel: "Follow NEKARA on Pinterest",
  },
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
            DESKTOP LAYOUT (md & above)
           ========================================================= */}
        <div className="hidden md:grid md:grid-cols-12 gap-8 lg:gap-10 pb-14 border-b border-[#B58A45]/20">
          {/* Brand Info & Mission (5 cols) */}
          <div className="md:col-span-5 space-y-4">
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

          {/* Column: SHOP (3 cols) */}
          <div className="md:col-span-3">
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

          {/* Column: POLICIES & LEGAL (4 cols) */}
          <div className="md:col-span-4 space-y-5">
            <div>
              <h4 className="font-sans text-[11px] font-semibold uppercase tracking-[0.25em] text-[#B58A45] mb-4">
                POLICIES &amp; LEGAL
              </h4>
              <ul className="space-y-2.5">
                {FOOTER_LINKS.legal.map((item) => (
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

            {/* Desktop Accessible Social Links Bar */}
            <div className="pt-2">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.22em] text-[#B58A45] block mb-3">
                FOLLOW US
              </span>
              <div className="flex items-center gap-3">
                {SOCIAL_ITEMS.map((social) => {
                  const Icon = social.icon;
                  const isConfigured = CONTACT_CONFIG.isRealSocialConfigured(social.platform);
                  const href = CONTACT_CONFIG.getSocialHref(social.platform);

                  if (isConfigured && href) {
                    return (
                      <a
                        key={social.platform}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.ariaLabel}
                        className="w-9 h-9 rounded-full border border-[#B58A45]/35 bg-[#011C18]/60 hover:bg-[#B58A45]/20 hover:border-[#D4AF37] text-[#FAF5ED] hover:text-[#D4AF37] flex items-center justify-center transition-all shadow-xs"
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    );
                  }

                  // Unconfigured placeholder fallback: cleanly indicated without creating broken outbound URL
                  return (
                    <span
                      key={social.platform}
                      title={`${social.label} (Profile URL pending)`}
                      aria-label={`${social.label} (Not configured)`}
                      className="w-9 h-9 rounded-full border border-[#B58A45]/20 bg-[#011C18]/30 text-[#FAF5ED]/40 flex items-center justify-center cursor-default"
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
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

          {/* Accordion Sections: SHOP & LEGAL */}
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
                          <Link
                            href={item.href}
                            className="text-xs text-[#EFE2D0]/80 hover:text-[#D4AF37] transition-colors block py-1.5 min-h-[36px] flex items-center"
                          >
                            {item.label}
                          </Link>
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
            <div className="flex items-center justify-center gap-4">
              {SOCIAL_ITEMS.map((social) => {
                const Icon = social.icon;
                const isConfigured = CONTACT_CONFIG.isRealSocialConfigured(social.platform);
                const href = CONTACT_CONFIG.getSocialHref(social.platform);

                if (isConfigured && href) {
                  return (
                    <a
                      key={`mobile-social-${social.platform}`}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.ariaLabel}
                      className="w-10 h-10 rounded-full border border-[#B58A45]/35 bg-[#011C18]/60 text-[#FAF5ED] flex items-center justify-center min-h-[44px] min-w-[44px]"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                }

                return (
                  <span
                    key={`mobile-social-${social.platform}`}
                    className="w-10 h-10 rounded-full border border-[#B58A45]/20 bg-[#011C18]/30 text-[#FAF5ED]/40 flex items-center justify-center"
                    aria-label={`${social.label} (Not configured)`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* =========================================================
            BOTTOM BAR: Copyright & Legal
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
            <span className="text-[#B58A45]/40">·</span>
            <Link href="/shipping" className="hover:text-[#D4AF37] transition-colors py-1">
              Shipping &amp; Delivery
            </Link>
            <span className="text-[#B58A45]/40">·</span>
            <Link href="/returns" className="hover:text-[#D4AF37] transition-colors py-1">
              Returns &amp; Refunds
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
