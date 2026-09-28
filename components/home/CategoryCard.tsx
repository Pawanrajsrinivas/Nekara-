"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CategoryItem } from "@/data/categories";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: CategoryItem;
  className?: string;
  priority?: boolean;
}

export function CategoryCard({ category, className, priority = false }: CategoryCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={category.href}
      className={cn(
        "group flex flex-col items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A45] rounded-xl p-1 sm:p-2 transition-all duration-300 min-w-[44px] min-h-[44px]",
        className
      )}
      aria-label={`Explore ${category.name}`}
    >
      {/* Outer Luxury Circular Frame with Subtle Gold Accent Ring */}
      <div className="relative p-[4px] rounded-full transition-all duration-350 ease-out ring-1 ring-[#B58A45]/30 group-hover:ring-[#B58A45] shadow-[0_4px_16px_rgba(58,33,21,0.06)] group-hover:shadow-[0_8px_24px_rgba(181,138,69,0.22)] bg-[#FFF8EF]">
        {/* Circular Image Container: 110px-135px on mobile/tablet, up to 138px on desktop */}
        <div className="relative w-[110px] h-[110px] sm:w-[122px] sm:h-[122px] md:w-[130px] md:h-[130px] lg:w-[138px] lg:h-[138px] rounded-full overflow-hidden border border-[#B58A45]/30 group-hover:border-[#B58A45] transition-colors duration-300">
          {!imgError ? (
            <Image
              src={category.image}
              alt={category.alt}
              fill
              sizes="(max-width: 640px) 115px, (max-width: 1024px) 130px, 140px"
              className="object-cover transition-transform duration-400 ease-out group-hover:scale-105"
              priority={priority}
              onError={() => setImgError(true)}
            />
          ) : (
            /* Graceful Fallback if image is absent */
            <div className="w-full h-full bg-gradient-to-br from-[#123F38] to-[#3A2115] flex items-center justify-center p-2 text-center">
              <span className="text-xs font-serif text-[#F7F0E4] font-medium leading-tight">
                {category.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Category Name Label */}
      <span className="mt-3 text-[13px] sm:text-[14px] lg:text-[15px] font-serif font-medium text-[#241A15] group-hover:text-[#075E5A] tracking-wide text-center transition-colors duration-250 leading-snug">
        {category.name}
      </span>
    </Link>
  );
}
