import React from "react";
import Image from "next/image";
import Link from "next/link";
import { IndianOrnament } from "@/components/ui/IndianOrnament";

export function CollectionCta() {
  return (
    <section
      aria-label="Explore the NEKARA Collection"
      className="relative w-full bg-[#02221D] py-16 sm:py-20 lg:py-24 overflow-hidden text-center text-[#FAF5ED]"
    >
      {/* Background Indian Peacock Watermarks (Opposite Corners) */}
      <div className="absolute -top-16 -left-16 w-64 h-64 sm:w-80 sm:h-80 pointer-events-none opacity-10 select-none z-0">
        <div className="relative w-full h-full">
          <Image
            src="/images/brand/brand1.png"
            alt=""
            fill
            sizes="320px"
            className="object-contain -scale-x-100"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="absolute -bottom-16 -right-16 w-64 h-64 sm:w-80 sm:h-80 pointer-events-none opacity-10 select-none z-0">
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

      {/* Decorative Gold Border Line Accent */}
      <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#B58A45]/40 to-transparent" />
      <div className="absolute inset-x-8 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[#B58A45]/40 to-transparent" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Subtle Medallion */}
        <div className="flex justify-center mb-4">
          <IndianOrnament size={22} className="text-[#B58A45]" />
        </div>

        {/* Eyebrow */}
        <span className="block font-sans text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase text-[#B58A45] mb-3 sm:mb-4">
          CURATED HEIRLOOM COLLECTIONS
        </span>

        {/* Heading */}
        <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-[52px] font-light leading-[1.18] sm:leading-[1.14] tracking-wide text-[#FAF5ED] mb-4 sm:mb-6 uppercase">
          Find the Saree
          <br className="sm:hidden" /> That Tells{" "}
          <br className="hidden sm:inline" />
          <span className="font-normal italic text-[#D4AF37] lowercase font-serif">your</span> Story.
        </h2>

        {/* Description */}
        <p className="font-serif text-sm sm:text-base md:text-lg text-[#EFE2D0]/85 italic font-light max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
          Discover timeless silhouettes crafted for celebrations, sacred ceremonies, and unforgettable moments.
        </p>

        {/* Action Button */}
        <div>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-3.5 rounded-xs bg-[#C89B3C] hover:bg-[#B58A45] text-[#241A15] font-sans font-semibold text-xs sm:text-[13px] tracking-[0.2em] uppercase transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 min-h-[48px]"
          >
            <span>EXPLORE THE COLLECTION</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
