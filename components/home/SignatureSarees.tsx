"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { NekaraProduct } from "@/types/product";
import { getFeaturedProducts } from "@/lib/products";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductSkeleton } from "@/components/products/ProductSkeleton";
import { StoryPanel } from "@/components/home/StoryPanel";
import { IndianOrnament } from "@/components/ui/IndianOrnament";
import { cn } from "@/lib/utils";

export function SignatureSarees() {
  const [products, setProducts] = useState<NekaraProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatured = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getFeaturedProducts(4);
      setProducts(data || []);
    } catch (err) {
      console.warn("SignatureSarees fetch error:", err);
      setError("Unable to load latest collection.");
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
        {(!isLoading && products.length === 0) ? (
          <div className="py-12 text-center bg-[#FFFBF5] rounded-xs border border-[#B58A45]/20 p-8 max-w-xl mx-auto">
            <IndianOrnament size={24} className="text-[#B58A45] mb-3" />
            <h3 className="font-serif text-lg sm:text-xl text-[#241A15] font-normal mb-1">
              Curating New Saree Collections
            </h3>
            <p className="text-xs sm:text-sm text-[#3A2115]/70 max-w-md mx-auto">
              Our master weavers are curating our newest signature sarees. Explore our full collection in the shop.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center mt-5 px-6 py-2.5 rounded-xs bg-[#C89B3C] hover:bg-[#B58A45] text-[#241A15] font-sans font-semibold text-xs tracking-[0.16em] uppercase transition-all shadow-sm"
            >
              Explore Shop
            </Link>
          </div>
        ) : (
          <>
            <div
              className="hidden lg:grid gap-5 items-stretch"
              style={{
                gridTemplateColumns:
                  products.length >= 4
                    ? "repeat(5, minmax(0, 1fr))"
                    : products.length === 1
                    ? "300px 1fr"
                    : `repeat(${products.length + 1}, minmax(0, 1fr))`,
              }}
            >
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

              {/* Brand Heritage Story Panel */}
              <StoryPanel className="h-full" />
            </div>

            {/* =========================================================
                MOBILE & TABLET LAYOUT (< lg):
                Clean 1 or 2-column layout followed by StoryPanel
               ========================================================= */}
            <div className="lg:hidden">
              <div
                className={cn(
                  "grid gap-3 sm:gap-4",
                  products.length === 1 ? "grid-cols-1 max-w-xs mx-auto" : "grid-cols-2"
                )}
              >
                {isLoading
                  ? Array.from({ length: 2 }).map((_, i) => (
                      <ProductSkeleton key={`home-mobile-skel-${i}`} className="h-full" />
                    ))
                  : products.map((product, idx) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        priority={idx < 2}
                        className="h-full"
                      />
                    ))}
              </div>

              {/* Full-Width Mobile Story Panel */}
              <div className="mt-8 sm:mt-10">
                <StoryPanel />
              </div>
            </div>
          </>
        )}

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
