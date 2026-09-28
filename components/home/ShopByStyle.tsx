import React from "react";
import Image from "next/image";
import Link from "next/link";
import { IndianOrnament } from "@/components/ui/IndianOrnament";

interface StyleItem {
  id: string;
  name: string;
  tag: string;
  href: string;
  image: string;
  alt: string;
}

const FEATURED_STYLE: StyleItem = {
  id: "banarasi-style",
  name: "Banarasi Heritage",
  tag: "HEIRLOOM ZARI WEAVES",
  href: "/shop?category=banarasi-sarees",
  image: "/images/categories/banarasi-sarees.jpg",
  alt: "Royal Banarasi Silk & Zari Weaves",
};

const SECONDARY_STYLES: StyleItem[] = [
  {
    id: "kanchipuram-style",
    name: "Kanchipuram Silks",
    tag: "TEMPLE BORDER CLASSICS",
    href: "/shop?category=kanchipuram-sarees",
    image: "/images/categories/kanchipuram-sarees.jpg",
    alt: "Pure Kanchipuram Bridal & Temple Silk Sarees",
  },
  {
    id: "silk-style",
    name: "Pure Silk Sarees",
    tag: "HANDLOOM SPLENDOR",
    href: "/shop?category=silk-sarees",
    image: "/images/categories/silk-sarees.jpg",
    alt: "Handcrafted pure Silk Sarees collection",
  },
  {
    id: "cotton-style",
    name: "Chanderi Handlooms",
    tag: "AIRY COTTON-SILK",
    href: "/shop?category=cotton-sarees",
    image: "/images/categories/cotton-sarees.jpg",
    alt: "Authentic Handloom Cotton Sarees collection",
  },
  {
    id: "party-style",
    name: "Party Wear & Festive",
    tag: "MODERN CELEBRATIONS",
    href: "/shop?category=party-wear",
    image: "/images/categories/party-wear.jpg",
    alt: "Celebration & Festive Party Wear Sarees",
  },
];

export function ShopByStyle() {
  return (
    <section
      aria-label="Shop Sarees by Style"
      className="relative w-full bg-[#FAF6F0] py-10 sm:py-16 lg:py-20 overflow-hidden border-t border-[#B58A45]/20"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* =========================================================
            SECTION HEADER
           ========================================================= */}
        <div className="flex items-center justify-between gap-3 sm:gap-6 lg:gap-8 mb-6 sm:mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-5 sm:w-6 h-[1px] bg-[#B58A45]" />
              <span className="font-sans text-[10px] sm:text-xs font-semibold uppercase tracking-[0.26em] text-[#B58A45]">
                CURATED COLLECTIONS
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-3xl lg:text-[34px] font-normal tracking-wide text-[#241A15]">
              Shop by Style
            </h2>
          </div>

          {/* Central Decorative Accent (Desktop only) */}
          <div className="hidden sm:flex flex-1 items-center justify-center relative min-w-[100px]">
            <div className="w-full border-t border-[#B58A45]/30" />
            <div className="absolute px-3 bg-[#FAF6F0]">
              <IndianOrnament size={20} className="text-[#B58A45]" />
            </div>
          </div>

          <Link
            href="/shop"
            className="group flex items-center gap-1.5 text-xs sm:text-sm font-medium tracking-wider text-[#B58A45] hover:text-[#075E5A] transition-colors shrink-0 min-h-[44px] px-1"
            aria-label="View all styles in the shop"
          >
            <span>View All</span>
            <span
              className="inline-block transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            >
              →
            </span>
          </Link>
        </div>

        {/* =========================================================
            EDITORIAL STYLE GRID:
            Mobile: 1 Large Featured Card + 2-Column Grid (2x2)
            Desktop (lg): Split layout (1 Large Left Column + 2x2 Right Grid)
           ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 lg:gap-6">
          {/* 1. LARGE FEATURED CARD */}
          <div className="lg:col-span-6">
            <Link
              href={FEATURED_STYLE.href}
              className="group relative block w-full h-[220px] xs:h-[250px] sm:h-[300px] lg:h-[420px] rounded-xl sm:rounded-2xl overflow-hidden border border-[#B58A45]/30 shadow-[0_4px_20px_rgba(58,33,21,0.06)] hover:shadow-[0_8px_30px_rgba(181,138,69,0.2)] transition-all duration-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A45]"
            >
              <Image
                src={FEATURED_STYLE.image}
                alt={FEATURED_STYLE.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-104"
                priority
              />

              {/* Multi-stage Luxury Gradient Overlay for Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 via-50% to-transparent pointer-events-none" />

              {/* Floating Top Badge */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                <span className="inline-block px-2.5 py-1 bg-[#FAF5ED]/95 backdrop-blur-xs text-[#075E5A] border border-[#B58A45]/35 text-[9px] sm:text-[10px] font-sans font-bold tracking-[0.2em] uppercase rounded-xs shadow-xs">
                  FEATURED EDIT
                </span>
              </div>

              {/* Bottom Card Content */}
              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 z-10 text-left">
                <span className="text-[10px] sm:text-xs font-sans tracking-[0.25em] text-[#D4AF37] uppercase font-semibold block mb-1">
                  {FEATURED_STYLE.tag}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl text-[#FAF5ED] font-normal tracking-wide group-hover:text-[#D4AF37] transition-colors">
                  {FEATURED_STYLE.name}
                </h3>
                <span className="inline-flex items-center gap-1.5 text-xs text-[#EFE2D0]/90 font-sans tracking-wider uppercase font-medium mt-2 group-hover:underline">
                  <span>Explore Style</span>
                  <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          </div>

          {/* 2. 2-COLUMN GRID (4 Smaller Cards) */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-3 sm:gap-4">
            {SECONDARY_STYLES.map((style) => (
              <Link
                key={style.id}
                href={style.href}
                className="group relative block w-full h-[140px] xs:h-[155px] sm:h-[190px] lg:h-[198px] rounded-xl sm:rounded-2xl overflow-hidden border border-[#B58A45]/25 shadow-[0_4px_16px_rgba(58,33,21,0.04)] hover:shadow-[0_6px_24px_rgba(181,138,69,0.18)] transition-all duration-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A45]"
              >
                <Image
                  src={style.image}
                  alt={style.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center transition-transform duration-600 ease-out group-hover:scale-106"
                />

                {/* Dark Gradient Overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 via-55% to-transparent pointer-events-none" />

                {/* Card Content */}
                <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 z-10 text-left">
                  <span className="text-[8px] sm:text-[9px] font-sans tracking-[0.2em] text-[#D4AF37] uppercase font-semibold block mb-0.5 line-clamp-1">
                    {style.tag}
                  </span>
                  <h4 className="font-serif text-sm sm:text-base lg:text-[17px] text-[#FAF5ED] font-normal leading-snug group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                    {style.name}
                  </h4>
                  <span className="inline-flex items-center gap-1 text-[10px] text-[#EFE2D0]/80 font-sans tracking-wider uppercase font-medium mt-1 group-hover:underline">
                    <span>View</span>
                    <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
