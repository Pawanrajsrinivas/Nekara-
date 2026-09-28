import React from "react";
import { cn } from "@/lib/utils";

interface ProductSkeletonProps {
  className?: string;
}

export function ProductSkeleton({ className }: ProductSkeletonProps) {
  return (
    <div
      className={cn(
        "flex flex-col bg-[#FFFBF5] rounded-xs border border-[#B58A45]/15 overflow-hidden animate-pulse",
        className
      )}
      aria-hidden="true"
    >
      {/* Image Skeleton */}
      <div className="relative w-full aspect-[3/4] bg-[#FAF3E7]" />

      {/* Details Skeleton */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between bg-[#FFFBF5] space-y-3">
        <div className="space-y-2">
          {/* Title line */}
          <div className="h-4 bg-[#EFE2D0] rounded-xs w-4/5" />
          {/* Subtitle line */}
          <div className="h-3 bg-[#EFE2D0]/60 rounded-xs w-3/5" />
        </div>

        {/* Price & Action line */}
        <div className="pt-2 border-t border-[#B58A45]/10 flex items-center justify-between">
          <div className="h-4 bg-[#EFE2D0] rounded-xs w-16" />
          <div className="h-3 bg-[#EFE2D0]/60 rounded-xs w-10" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={`skeleton-${i}`} />
      ))}
    </div>
  );
}
