"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SareeProduct } from "@/data/sarees";
import { WishlistIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/context/WishlistContext";
import { NekaraProduct } from "@/types/product";

interface SareeCardProps {
  product: SareeProduct;
  priority?: boolean;
  className?: string;
}

export function SareeCard({ product, priority = false, className }: SareeCardProps) {
  const { isWishlisted: checkIsWishlisted, toggleWishlist: contextToggleWishlist } = useWishlist();
  const isWishlisted = checkIsWishlisted(product.id);
  const [imgError, setImgError] = useState(false);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nekaraProd: NekaraProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug || product.id,
      subtitle: product.type || "",
      description: "",
      price: product.price,
      formattedPrice: product.formattedPrice,
      image: product.image,
      images: [product.image],
      category: product.type,
      categoryId: "",
      categoryName: product.type,
      stock: 10,
      rating: 4.9,
      availability: "In Stock",
      href: product.href,
    };
    await contextToggleWishlist(nekaraProd);
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col bg-[#FFFBF5] rounded-xs border border-[#B58A45]/20 hover:border-[#B58A45]/60 transition-all duration-300 shadow-[0_4px_16px_rgba(58,33,21,0.04)] hover:shadow-[0_8px_24px_rgba(181,138,69,0.12)] overflow-hidden",
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
          {!imgError ? (
            <Image
              src={product.image}
              alt={product.alt}
              fill
              sizes="(max-width: 640px) 260px, (max-width: 1024px) 220px, 260px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-104"
              priority={priority}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-[#123F38] to-[#3A2115] flex items-center justify-center p-4 text-center">
              <span className="font-serif text-sm text-[#F7F0E4]">{product.name}</span>
            </div>
          )}

          {/* Optional Badge */}
          {product.badge && (
            <div className="absolute top-2.5 left-2.5 z-10">
              <span className="inline-block px-2 py-0.5 bg-[#FAF5ED]/95 backdrop-blur-xs text-[#075E5A] border border-[#B58A45]/30 text-[9px] font-sans font-bold tracking-[0.16em] uppercase rounded-xs shadow-xs">
                {product.badge}
              </span>
            </div>
          )}

          {/* Heart / Wishlist Button (min 44px tap area for mobile accessibility) */}
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
            <h3 className="font-serif text-[15px] sm:text-[16px] text-[#241A15] font-normal leading-snug group-hover:text-[#075E5A] transition-colors line-clamp-1">
              {product.name}
            </h3>
            <p className="text-[11px] sm:text-xs text-[#3A2115]/65 font-sans tracking-normal mt-0.5 line-clamp-1">
              {product.type}
            </p>
          </div>

          <div className="mt-2.5 pt-2 border-t border-[#B58A45]/15 flex items-baseline justify-between">
            <span className="font-sans font-semibold text-[13px] sm:text-[14px] text-[#241A15] tracking-tight">
              {product.formattedPrice}
            </span>
            <span className="text-[10px] font-sans text-[#B58A45] font-medium uppercase tracking-wider group-hover:underline">
              View
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
