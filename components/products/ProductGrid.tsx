"use client";

import React from "react";
import { NekaraProduct } from "@/types/product";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductGridSkeleton } from "@/components/products/ProductSkeleton";
import { IndianOrnament } from "@/components/ui/IndianOrnament";

interface ProductGridProps {
  products: NekaraProduct[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  skeletonCount?: number;
}

export function ProductGrid({
  products,
  isLoading = false,
  error,
  onRetry,
  skeletonCount = 8,
}: ProductGridProps) {
  if (isLoading) {
    return <ProductGridSkeleton count={skeletonCount} />;
  }

  if (error) {
    return (
      <div className="py-14 sm:py-20 text-center flex flex-col items-center justify-center bg-[#FAF6F0] rounded-xs border border-[#B58A45]/20 p-8 max-w-xl mx-auto my-8">
        <IndianOrnament size={24} className="text-[#B58A45] mb-4" />
        <h3 className="font-serif text-xl sm:text-2xl text-[#241A15] font-normal mb-2">
          Unable to Load Collection
        </h3>
        <p className="text-xs sm:text-sm text-[#3A2115]/70 max-w-md mx-auto mb-6">
          We encountered an issue loading our collection from the service. Please try again.
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xs bg-[#C89B3C] hover:bg-[#B58A45] text-[#241A15] font-sans font-semibold text-xs tracking-[0.16em] uppercase transition-all duration-300 shadow-sm min-h-[44px]"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-16 sm:py-24 text-center flex flex-col items-center justify-center bg-[#FAF6F0] rounded-xs border border-[#B58A45]/20 p-8 max-w-xl mx-auto my-8">
        <IndianOrnament size={24} className="text-[#B58A45] mb-4" />
        <h3 className="font-serif text-xl sm:text-2xl text-[#241A15] font-normal mb-2">
          No Sarees Found
        </h3>
        <p className="text-xs sm:text-sm text-[#3A2115]/70 max-w-md mx-auto">
          No sarees currently match your selected filter criteria. Explore another category above.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6">
      {products.map((product, idx) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={idx < 4}
        />
      ))}
    </div>
  );
}
