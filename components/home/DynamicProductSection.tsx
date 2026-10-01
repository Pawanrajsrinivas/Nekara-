"use client";

import React from "react";
import Link from "next/link";
import { HomeSection, NekaraProduct } from "@/types/product";
import { ProductCard } from "@/components/products/ProductCard";
import { IndianOrnament } from "@/components/ui/IndianOrnament";
import { cn } from "@/lib/utils";

interface DynamicProductSectionProps {
  section: HomeSection;
  products: NekaraProduct[];
  className?: string;
}

export function DynamicProductSection({
  section,
  products,
  className,
}: DynamicProductSectionProps) {
  // If section is disabled or has no products to show, gracefully hide it
  if (!section.enabled || products.length === 0) {
    return null;
  }

  // Pre-generate a tag based on section type
  const getSectionTag = () => {
    switch (section.id) {
      case "trending":
        return "MOST LOVED DRAPES";
      case "newArrivals":
        return "JUST IN • FRESH WEAVES";
      case "offers":
        return "LIMITED EDITION • VALUE OFFERS";
      case "signature":
      default:
        return "HANDLOOM SPLENDOR";
    }
  };

  return (
    <section
      aria-label={section.title}
      className={cn(
        "relative w-full bg-[#FAF6F0] py-10 sm:py-16 lg:py-20 overflow-hidden border-t border-[#B58A45]/20",
        className
      )}
    >
      {/* Background Indian Floral / Damask Subtle Watermark */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#B58A45 1.5px, transparent 1.5px), radial-gradient(#3A2115 1px, #FAF6F0 1px)`,
          backgroundSize: "48px 48px",
          backgroundPosition: "0 0, 24px 24px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* =========================================================
            SECTION HEADER
           ========================================================= */}
        <div className="flex items-center justify-between gap-3 sm:gap-6 lg:gap-8 mb-6 sm:mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-5 sm:w-6 h-[1px] bg-[#B58A45]" />
              <span className="font-sans text-[10px] sm:text-xs font-semibold uppercase tracking-[0.26em] text-[#B58A45]">
                {getSectionTag()}
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-3xl lg:text-[34px] font-normal tracking-wide text-[#241A15]">
              {section.title}
            </h2>
            {section.subtitle && (
              <p className="text-xs sm:text-sm text-[#3A2115]/75 mt-1 font-sans">
                {section.subtitle}
              </p>
            )}
          </div>

          {/* Central Decorative Accent (Desktop only) */}
          <div className="hidden sm:flex flex-1 items-center justify-center relative min-w-[100px]">
            <div className="w-full border-t border-[#B58A45]/30" />
            <div className="absolute px-3 bg-[#FAF6F0]">
              <IndianOrnament size={20} className="text-[#B58A45]" />
            </div>
          </div>

          {/* View All Link to /shop */}
          <Link
            href="/shop"
            className="group flex items-center gap-1.5 text-xs sm:text-sm font-medium tracking-wider text-[#B58A45] hover:text-[#075E5A] transition-colors shrink-0 min-h-[44px] px-1"
            aria-label={`View all in ${section.title}`}
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
            PRODUCTS GRID (Responsive: 2 cols on mobile, up to 4 cols on desktop)
           ========================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6">
          {products.map((product, idx) => (
            <ProductCard
              key={`${section.id}-${product.id}-${idx}`}
              product={product}
              priority={idx < 2}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
