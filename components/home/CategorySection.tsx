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
            CATEGORY CARDS ROW
            Desktop: Exactly 6 circular cards in 1 row
            Tablet / Mobile: Horizontally scrollable row with hidden scrollbar (showing 1.8-2.5 items)
           ========================================================= */}
        <div className="flex md:grid md:grid-cols-6 gap-3.5 sm:gap-6 lg:gap-4 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 scroll-smooth snap-x snap-mandatory justify-start md:justify-items-center [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORIES_DATA.map((category, idx) => (
            <div
              key={category.id}
              className="shrink-0 snap-start md:shrink w-[130px] sm:w-[145px] md:w-full flex justify-center"
            >
              <CategoryCard
                category={category}
                priority={idx < 3}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
