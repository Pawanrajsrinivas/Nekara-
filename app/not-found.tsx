import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { IndianOrnament } from "@/components/ui/IndianOrnament";

export const metadata: Metadata = {
  title: "Page Not Found — 404 | NEKARA",
  description:
    "This thread seems to have wandered. Discover authentic handwoven sarees, bridal silks, and heirloom weaves at NEKARA.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="relative w-full min-h-[calc(100vh-80px)] pt-32 sm:pt-40 pb-20 sm:pb-28 flex flex-col justify-center items-center bg-[#FDFBF7] overflow-hidden text-center select-none">
      {/* =========================================================
          1. SUBTLE BACKGROUND WATERMARK MOTIFS
         ========================================================= */}
      {/* Central Brand Watermark */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] pointer-events-none opacity-[0.03] select-none z-0"
        aria-hidden="true"
      >
        <div className="relative w-full h-full">
          <Image
            src="/images/brand/brand1.png"
            alt=""
            fill
            sizes="(max-width: 640px) 340px, 480px"
            className="object-contain"
          />
        </div>
      </div>

      {/* Ambient Warm Golden Glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] bg-[radial-gradient(circle_at_center,rgba(200,155,60,0.06)_0%,transparent_70%)] pointer-events-none z-0"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center">
        {/* =========================================================
            2. BRAND EMBLEM & EYEBROW
           ========================================================= */}
        <div className="flex flex-col items-center mb-4 sm:mb-6">
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 mb-3 p-2 rounded-full border border-[#B58A45]/30 bg-[#FAF5ED]/80 shadow-[0_2px_12px_rgba(181,138,69,0.12)]">
            <div className="relative w-full h-full">
              <Image
                src="/images/brand/brand1.png"
                alt="NEKARA Peacock Motif"
                fill
                sizes="56px"
                className="object-contain"
                priority
              />
            </div>
          </div>
          <span className="font-sans text-[10px] sm:text-[11px] font-semibold tracking-[0.32em] uppercase text-[#B58A45]">
            NEKARA · ESTD. 2001
          </span>
        </div>

        {/* =========================================================
            3. 404 NUMERAL & WOVEN THREAD COMPOSITION
           ========================================================= */}
        <div className="relative my-2 sm:my-3">
          {/* Large Regal 404 Numerals */}
          <span
            className="font-serif font-light text-7xl sm:text-8xl md:text-9xl tracking-[0.14em] text-[#075E5A] block leading-none drop-shadow-[0_2px_8px_rgba(7,94,90,0.08)]"
            aria-hidden="true"
          >
            404
          </span>

          {/* Saree Loom & Wandering Silk Thread SVG Motif */}
          <div className="w-full max-w-[280px] sm:max-w-[340px] mx-auto mt-2 mb-1" aria-hidden="true">
            <svg
              viewBox="0 0 340 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto text-[#B58A45]"
            >
              {/* Loom Warp threads grid (Left) */}
              <line x1="10" y1="8" x2="10" y2="24" stroke="currentColor" strokeWidth="1" strokeOpacity="0.35" />
              <line x1="18" y1="6" x2="18" y2="26" stroke="currentColor" strokeWidth="1" strokeOpacity="0.45" />
              <line x1="26" y1="4" x2="26" y2="28" stroke="currentColor" strokeWidth="1" strokeOpacity="0.6" />
              <line x1="34" y1="6" x2="34" y2="26" stroke="currentColor" strokeWidth="1" strokeOpacity="0.75" />
              <line x1="42" y1="8" x2="42" y2="24" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.9" />

              {/* Loom Weft cross threads */}
              <line x1="6" y1="12" x2="46" y2="12" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
              <line x1="6" y1="16" x2="46" y2="16" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.7" />
              <line x1="6" y1="20" x2="46" y2="20" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />

              {/* Wandering silk thread curving freely across center */}
              <path
                d="M46 16C75 16 90 26 120 24C150 22 165 8 195 10C225 12 245 25 275 21C295 18 315 13 332 16"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeDasharray="2 3"
                className="animate-pulse"
              />

              {/* Gold tassel / needle end accent */}
              <circle cx="333" cy="16" r="2.5" fill="currentColor" />
              <circle cx="333" cy="16" r="4.5" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.5" />
            </svg>
          </div>
        </div>

        {/* =========================================================
            4. EDITORIAL HEADING & STORYTELLING MESSAGE
           ========================================================= */}
        <h1 className="font-serif text-2xl sm:text-3xl md:text-[38px] font-normal text-[#241A15] leading-[1.22] sm:leading-[1.18] tracking-wide uppercase mt-1 mb-3">
          This thread seems
          <br />
          <span className="italic font-light text-[#075E5A] lowercase font-serif">to have</span> wandered.
        </h1>

        <p className="font-sans text-xs sm:text-sm md:text-[15px] text-[#3A2115]/75 max-w-md mx-auto leading-relaxed">
          The page you&apos;re looking for may have moved, been woven into another collection, or never existed. Let us guide you back to our heirloom drapes.
        </p>

        {/* =========================================================
            5. ORNAMENTAL DIVIDER
           ========================================================= */}
        <div className="flex items-center justify-center gap-3 my-6 sm:my-7" aria-hidden="true">
          <span className="w-12 sm:w-16 h-[1px] bg-gradient-to-r from-transparent to-[#B58A45]/40" />
          <IndianOrnament size={20} className="text-[#B58A45]" />
          <span className="w-12 sm:w-16 h-[1px] bg-gradient-to-l from-transparent to-[#B58A45]/40" />
        </div>

        {/* =========================================================
            6. CALL TO ACTION BUTTONS
           ========================================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
          {/* Primary: Back to Home */}
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 sm:px-9 sm:py-4 rounded-xs bg-[#075E5A] hover:bg-[#123F38] text-[#FAF5ED] font-sans font-semibold text-xs tracking-[0.2em] uppercase transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A45] focus-visible:ring-offset-2"
          >
            <span>Back to Home</span>
            <span aria-hidden="true">→</span>
          </Link>

          {/* Secondary: Explore Sarees */}
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 sm:px-9 sm:py-4 rounded-xs bg-transparent hover:bg-[#075E5A]/5 text-[#075E5A] border border-[#075E5A]/40 hover:border-[#075E5A] font-sans font-semibold text-xs tracking-[0.2em] uppercase transition-all duration-300 shadow-2xs hover:shadow-sm hover:-translate-y-0.5 min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A45] focus-visible:ring-offset-2"
          >
            <span>Explore Sarees</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* =========================================================
            7. CURATED HERITAGE DESTINATIONS
           ========================================================= */}
        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-[#B58A45]/20 w-full max-w-lg">
          <p className="font-sans text-[10px] sm:text-[11px] font-semibold tracking-[0.24em] uppercase text-[#B58A45] mb-3">
            POPULAR WEAVES &amp; DESTINATIONS
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-sans text-[#3A2115]/75">
            <Link
              href="/shop?category=kanchipuram-sarees"
              className="hover:text-[#075E5A] transition-colors underline-offset-4 hover:underline"
            >
              Kanjeevaram Silks
            </Link>
            <span className="text-[#B58A45]/40" aria-hidden="true">
              ·
            </span>
            <Link
              href="/shop?category=banarasi-sarees"
              className="hover:text-[#075E5A] transition-colors underline-offset-4 hover:underline"
            >
              Banarasi Heritage
            </Link>
            <span className="text-[#B58A45]/40" aria-hidden="true">
              ·
            </span>
            <Link
              href="/about"
              className="hover:text-[#075E5A] transition-colors underline-offset-4 hover:underline"
            >
              Our Story
            </Link>
            <span className="text-[#B58A45]/40" aria-hidden="true">
              ·
            </span>
            <Link
              href="/account/orders"
              className="hover:text-[#075E5A] transition-colors underline-offset-4 hover:underline"
            >
              Track Order
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
