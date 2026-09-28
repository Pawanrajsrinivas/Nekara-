"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { NekaraProduct } from "@/types/product";
import { WishlistIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: NekaraProduct;
  priority?: boolean;
  className?: string;
}

export function ProductCard({ product, priority = false, className }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imgError, setImgError] = useState(false);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted((prev) => !prev);
  };

  // Safe fallback image if product image fails to load
  const displayImage = imgError
    ? "/images/categories/silk-sarees.jpg"
    : product.image;

  return (
    <div
      className={cn(
        "group relative flex flex-col bg-[#FFFBF5] rounded-xs border border-[#B58A45]/20 hover:border-[#B58A45]/60 transition-all duration-300 shadow-[0_4px_16px_rgba(58,33,21,0.04)] hover:shadow-[0_8px_24px_rgba(181,138,69,0.14)] hover:-translate-y-0.5 overflow-hidden",
        className
      )}
    >
      <Link
        href={product.href}
        className="flex flex-col h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A45]"
        aria-label={`View details for ${product.name}`}
      >
        {/* Product Image Container (Consistent Portrait 3:4 Aspect Ratio) */}
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#FAF3E7]">
          <Image
            src={displayImage}
            alt={`${product.name} - ${product.subtitle}`}
            fill
            sizes="(max-width: 640px) 180px, (max-width: 1024px) 240px, 280px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-104"
            priority={priority}
            onError={() => setImgError(true)}
          />

          {/* Optional Badge */}
          {product.badge && (
            <div className="absolute top-2.5 left-2.5 z-10">
              <span className="inline-block px-2 py-0.5 bg-[#FAF5ED]/95 backdrop-blur-xs text-[#075E5A] border border-[#B58A45]/30 text-[9px] font-sans font-bold tracking-[0.16em] uppercase rounded-xs shadow-xs">
                {product.badge}
              </span>
            </div>
          )}

          {/* Heart / Wishlist Button (min 44px tap area for accessibility) */}
          <div className="absolute top-1.5 right-1.5 z-20">
            <button
              type="button"
              onClick={toggleWishlist}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-white/90 hover:text-[#B58A45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A45] transition-colors"
              aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
              aria-pressed={isWishlisted}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-250 shadow-sm",
                  isWishlisted
                    ? "bg-[#075E5A] text-[#F7F0E4]"
                    : "bg-black/35 hover:bg-black/55 text-white"
                )}
              >
                <WishlistIcon
                  size={15}
                  strokeWidth={2}
                  filled={isWishlisted}
                  className={cn("transition-transform duration-200", isWishlisted && "scale-110")}
                />
              </div>
            </button>
          </div>

          {/* Subtle bottom vignette gradient inside image */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>

        {/* Product Details Area */}
        <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between bg-[#FFFBF5]">
          <div>
            <h3 className="font-serif text-[14px] sm:text-[16px] text-[#241A15] font-normal leading-snug group-hover:text-[#075E5A] transition-colors line-clamp-1">
              {product.name}
            </h3>
            <p className="text-[11px] sm:text-xs text-[#3A2115]/65 font-sans tracking-normal mt-0.5 line-clamp-1">
              {product.subtitle}
            </p>
          </div>

          <div className="mt-2.5 pt-2 border-t border-[#B58A45]/15 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="font-sans font-semibold text-[13px] sm:text-[14px] text-[#241A15] tracking-tight">
                {product.formattedPrice}
              </span>
              {product.formattedOriginalPrice && (
                <span className="text-[10px] sm:text-[11px] text-[#3A2115]/40 line-through">
                  {product.formattedOriginalPrice}
                </span>
              )}
            </div>

            <span className="text-[10px] font-sans text-[#B58A45] font-medium uppercase tracking-wider group-hover:underline flex items-center gap-0.5">
              <span>VIEW</span>
              <span aria-hidden="true">→</span>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
