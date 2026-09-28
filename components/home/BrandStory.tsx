import React from "react";
import Image from "next/image";
import Link from "next/link";
import { IndianOrnament } from "@/components/ui/IndianOrnament";

export function BrandStory() {
  return (
    <section
      aria-label="NEKARA Brand Story and Heritage"
      className="relative w-full bg-[#FDFBF7] py-14 sm:py-20 lg:py-28 overflow-hidden border-t border-[#B58A45]/20"
    >
      {/* Subtle Background Indian Motif Watermark */}
      <div className="absolute -top-12 -right-12 w-64 h-64 sm:w-80 sm:h-80 pointer-events-none opacity-[0.035] select-none z-0">
        <div className="relative w-full h-full">
          <Image
            src="/images/brand/tab_logo.png"
            alt=""
            fill
            sizes="320px"
            className="object-contain"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* =========================================================
              LEFT: Editorial Visual Showcase (approx 55% on desktop)
             ========================================================= */}
          <div className="lg:col-span-6 xl:col-span-7">
            <div className="relative mx-auto max-w-xl lg:max-w-none">
              {/* Outer decorative gold accent frame */}
              <div className="absolute -inset-2.5 sm:-inset-3.5 border border-[#B58A45]/30 rounded-xs pointer-events-none" />

              {/* Main Image Container */}
              <div className="relative w-full h-[280px] sm:h-[400px] lg:h-[480px] rounded-xs overflow-hidden bg-[#FAF3E7] shadow-[0_8px_30px_rgba(58,33,21,0.08)]">
                <Image
                  src="/images/categories/banarasi-sarees.jpg"
                  alt="Master artisans handweaving intricate zari motifs on Banarasi silk"
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover object-center transition-transform duration-700 hover:scale-102"
                />
                {/* Subtle vignette border gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />

                {/* Floating Heritage Badge */}
                <div className="absolute bottom-4 left-4 z-10 bg-[#FAF5ED]/95 backdrop-blur-md px-3.5 py-1.5 border border-[#B58A45]/35 rounded-xs shadow-sm">
                  <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.25em] text-[#075E5A]">
                    Estd. 2001 · Handcrafted Heritage
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================
              RIGHT: Editorial Narrative Content (approx 45% on desktop)
             ========================================================= */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center text-left">
            {/* Eyebrow */}
            <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
              <span className="w-5 sm:w-7 h-[1px] bg-[#B58A45]" />
              <span className="font-sans text-[11px] sm:text-xs tracking-[0.28em] uppercase text-[#B58A45] font-semibold">
                OUR HERITAGE
              </span>
            </div>

            {/* Serif Heading */}
            <h2 className="font-serif text-2xl sm:text-4xl lg:text-[42px] font-normal text-[#241A15] leading-[1.18] tracking-wide mb-4 sm:mb-6">
              A Story
              <br />
              Woven in
              <br />
              <span className="italic font-light text-[#075E5A]">Tradition</span>
            </h2>

            {/* Subtle Divider Motif */}
            <div className="mb-5 sm:mb-6 flex items-center">
              <div className="w-12 h-[1.5px] bg-[#B58A45]/50" />
              <IndianOrnament size={16} className="text-[#B58A45] ml-2" />
            </div>

            {/* Body Copy */}
            <div className="space-y-3.5 sm:space-y-4 text-xs sm:text-[14px] leading-relaxed text-[#3A2115]/80 font-sans">
              <p>
                For over two decades, NEKARA has celebrated India&apos;s timeless weaving traditions through sarees crafted with patience, artistry, and purpose.
              </p>
              <p>
                From the first handspun thread to the final celebratory drape, every creation carries a sacred lineage of craftsmanship, cultural pride, and contemporary elegance.
              </p>
            </div>

            {/* CTA Button */}
            <div className="mt-7 sm:mt-9">
              <Link
                href="/about"
                className="inline-flex items-center gap-2.5 px-7 py-3 rounded-xs bg-[#C89B3C] hover:bg-[#B58A45] text-[#241A15] font-sans font-semibold text-xs tracking-[0.2em] uppercase transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 min-h-[44px]"
              >
                <span>DISCOVER OUR STORY</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
