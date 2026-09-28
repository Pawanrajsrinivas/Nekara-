"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { NekaraProduct } from "@/types/product";
import { getFeaturedProducts } from "@/lib/products";
import { FALLBACK_PRODUCTS } from "@/lib/product-adapter";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductSkeleton } from "@/components/products/ProductSkeleton";
import { StoryPanel } from "@/components/home/StoryPanel";
import { IndianOrnament } from "@/components/ui/IndianOrnament";

export function SignatureSarees() {
  const [products, setProducts] = useState<NekaraProduct[]>(FALLBACK_PRODUCTS.slice(0, 4));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatured = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getFeaturedProducts(4);
      if (data && data.length > 0) {
        setProducts(data);
      } else {
        setProducts(FALLBACK_PRODUCTS.slice(0, 4));
      }
    } catch (err) {
      console.warn("SignatureSarees fetch error:", err);
      setError("Unable to load latest collection.");
      setProducts(FALLBACK_PRODUCTS.slice(0, 4));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatured();
  }, []);

  return (
    <section
      aria-label="Our Signature Sarees"
      className="relative w-full bg-[#FAF6F0] py-10 sm:py-16 lg:py-20 overflow-hidden border-t border-[#B58A45]/20"
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
            Left: "Our Signature Sarees"
            Center: Thin gold divider with Indian ornament medallion (desktop/tablet)
            Right: "View All →" (links to /shop)
           ========================================================= */}
        <div className="flex items-center justify-between gap-3 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          {/* Section Heading */}
          <h2 className="font-serif text-xl sm:text-3xl lg:text-[34px] font-normal tracking-wide text-[#241A15] shrink-0">
            Our Signature Sarees
          </h2>

          {/* Decorative Divider with Central Indian Motif */}
          <div className="hidden sm:flex flex-1 items-center justify-center relative min-w-[100px]">
            <div className="w-full border-t border-[#B58A45]/35" />
            <div className="absolute px-3 bg-[#FAF6F0]">
              <IndianOrnament size={22} />
            </div>
          </div>

          {/* View All Link to /shop */}
          <Link
            href="/shop"
            className="group flex items-center gap-1.5 text-xs sm:text-sm font-medium tracking-wider text-[#B58A45] hover:text-[#075E5A] transition-colors shrink-0 min-h-[44px] px-1"
            aria-label="View all signature sarees in the shop collection"
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
            DESKTOP LAYOUT (lg & above):
            4 Saree Product Cards (or Skeletons) + 1 Storytelling Panel side-by-side
           ========================================================= */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-5 items-stretch">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <ProductSkeleton key={`home-desktop-skel-${i}`} className="h-full" />
              ))
            : products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  className="h-full"
                />
              ))}

          {/* 5th Column: Brand Heritage Story Panel */}
          <StoryPanel className="h-full" />
        </div>

        {/* =========================================================
            MOBILE & TABLET LAYOUT (< lg):
            1. Horizontal Swipeable Saree Product Carousel (showing 1.2–1.5 cards)
            2. Followed by Full-Width Brand Heritage Story Panel
           ========================================================= */}
        <div className="lg:hidden">
          {/* Saree Product Carousel */}
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-mandatory justify-start [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 sm:mx-0 sm:px-0">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={`home-mobile-skel-${i}`}
                    className="shrink-0 snap-start w-[240px] sm:w-[260px]"
                  >
                    <ProductSkeleton className="h-full" />
                  </div>
                ))
              : products.map((product, idx) => (
                  <div
                    key={product.id}
                    className="shrink-0 snap-start w-[240px] sm:w-[260px]"
                  >
                    <ProductCard
                      product={product}
                      priority={idx < 2}
                      className="h-full"
                    />
                  </div>
                ))}
          </div>

          {/* Full-Width Mobile Story Panel */}
          <div className="mt-8 sm:mt-10">
            <StoryPanel />
          </div>
        </div>

        {/* Optional Gentle Error Banner with Retry */}
        {error && (
          <div className="mt-6 text-center text-xs text-[#3A2115]/70 flex items-center justify-center gap-3">
            <span>{error}</span>
            <button
              type="button"
              onClick={fetchFeatured}
              className="text-[#075E5A] font-semibold underline hover:text-[#B58A45]"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
