import React from "react";
import Link from "next/link";
import { CATEGORIES_DATA } from "@/data/categories";
import { CategoryCard } from "@/components/home/CategoryCard";
import { IndianOrnament } from "@/components/ui/IndianOrnament";

export function CategorySection() {
  return (
    <section
      aria-label="Explore Sarees by Category"
      className="relative w-full bg-[#FFFBF5] py-10 sm:py-16 lg:py-20 overflow-hidden"
    >
      {/* Very faint Indian floral / paisley textile line watermark in background */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#B58A45 1px, transparent 1px), radial-gradient(#3A2115 1px, #FFFBF5 1px)`,
          backgroundSize: "40px 40px",
          backgroundPosition: "0 0, 20px 20px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* =========================================================
            SECTION HEADER
            Left: "Explore by Category"
            Center: Decorative line with Indian ornament medallion (desktop/tablet)
            Right: "View All →"
           ========================================================= */}
        <div className="flex items-center justify-between gap-3 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          {/* Section Heading */}
          <h2 className="font-serif text-xl sm:text-3xl lg:text-[34px] font-normal tracking-wide text-[#241A15] shrink-0">
            Explore by Category
          </h2>

          {/* Decorative Divider with Central Indian Motif */}
          <div className="hidden sm:flex flex-1 items-center justify-center relative min-w-[100px]">
            <div className="w-full border-t border-[#B58A45]/35" />
            <div className="absolute px-3 bg-[#FFFBF5]">
              <IndianOrnament size={22} />
            </div>
          </div>

          {/* View All Link */}
          <Link
            href="/shop"
            className="group flex items-center gap-1.5 text-xs sm:text-sm font-medium tracking-wider text-[#B58A45] hover:text-[#075E5A] transition-colors shrink-0 min-h-[44px] px-1"
            aria-label="View all saree categories in the shop"
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
            CATEGORY CARDS
            Desktop: Exactly 6 circular cards in 1 row
            Mobile: Dedicated, clean 3-column responsive grid (2 rows of 3)
           ========================================================= */}
        {/* Desktop 6-column Grid */}
        <div className="hidden md:grid md:grid-cols-6 gap-4 lg:gap-5 justify-items-center">
          {CATEGORIES_DATA.map((category, idx) => (
            <div key={`desktop-cat-${category.id}`} className="w-full flex justify-center">
              <CategoryCard category={category} priority={idx < 3} />
            </div>
          ))}
        </div>

        {/* Mobile 3-column Grid (Perfect for 320px–430px viewports) */}
        <div className="grid md:hidden grid-cols-3 gap-y-4 gap-x-1.5 sm:gap-x-3 justify-items-center">
          {CATEGORIES_DATA.map((category, idx) => (
            <div key={`mobile-cat-${category.id}`} className="w-full flex justify-center">
              <CategoryCard category={category} priority={idx < 3} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
