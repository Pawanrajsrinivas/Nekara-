"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CategoryCard } from "@/components/home/CategoryCard";
import { IndianOrnament } from "@/components/ui/IndianOrnament";
import type { NekaraCategory } from "@/types/product";
import { getCategories } from "@/lib/products";

interface CategorySectionProps {
  categories?: NekaraCategory[];
}

export function CategorySection({ categories: initialCategories }: CategorySectionProps) {
  const [categories, setCategories] = useState<NekaraCategory[]>(initialCategories || []);
  const [loading, setLoading] = useState(!initialCategories);

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setCategories(initialCategories);
      setLoading(false);
      return;
    }

    async function load() {
      try {
        setLoading(true);
        const cats = await getCategories();
        setCategories(cats || []);
      } catch (err) {
        console.error("Error loading categories for homepage:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [initialCategories]);

  // If loading and no categories yet, hide to prevent flash
  if (loading && categories.length === 0) {
    return null;
  }

  // Never render dummy data. If no real categories exist in Firestore, hide the section gracefully
  if (categories.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Explore Sarees by Category"
      className="relative w-full bg-[#FFFBF5] py-10 sm:py-16 lg:py-20 overflow-hidden"
    >
      {/* Very faint Indian floral / paisley textile line watermark in background */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#B58A45 1px, transparent 1px), radial-gradient(#3A2115 1px, #FFFBF5 1px)`,
          backgroundSize: "40px 40px",
          backgroundPosition: "0 0, 20px 20px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between gap-3 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          {/* Section Heading */}
          <h2 className="font-serif text-xl sm:text-3xl lg:text-[34px] font-normal tracking-wide text-[#241A15] shrink-0">
            Explore by Category
          </h2>

          {/* Decorative Divider with Central Indian Motif */}
          <div className="hidden sm:flex flex-1 items-center justify-center relative min-w-[100px]">
            <div className="w-full border-t border-[#B58A45]/35" />
            <div className="absolute px-3 bg-[#FFFBF5]">
              <IndianOrnament size={22} />
            </div>
          </div>

          {/* View All Link */}
          <Link
            href="/shop"
            className="group flex items-center gap-1.5 text-xs sm:text-sm font-medium tracking-wider text-[#B58A45] hover:text-[#075E5A] transition-colors shrink-0 min-h-[44px] px-1"
            aria-label="View all saree categories in the shop"
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

        {/* Dynamic Category Cards Grid (Centered and Balanced) */}
        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 lg:gap-10">
          {categories.map((category, idx) => (
            <div key={`cat-${category.id}`} className="flex justify-center">
              <CategoryCard
                category={{
                  id: category.id,
                  name: category.name,
                  slug: category.slug,
                  image: category.image,
                  href: `/shop?category=${encodeURIComponent(category.name)}`,
                  alt: `${category.name} Sarees`,
                }}
                priority={idx < 4}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
