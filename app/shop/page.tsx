"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { NekaraProduct } from "@/types/product";
import { getProducts, getCategories } from "@/lib/products";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductGridSkeleton } from "@/components/products/ProductSkeleton";
import { IndianOrnament } from "@/components/ui/IndianOrnament";
import { ChevronDownIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

const DEFAULT_CATEGORIES: { label: string; value: string }[] = [
  { label: "All Sarees", value: "All" },
  { label: "Silk Sarees", value: "Silk Sarees" },
  { label: "Banarasi Sarees", value: "Banarasi Sarees" },
  { label: "Kanchipuram Sarees", value: "Kanchipuram Sarees" },
  { label: "Cotton Sarees", value: "Cotton Sarees" },
  { label: "Party Wear", value: "Party Wear" },
  { label: "Designer Sarees", value: "Designer Sarees" },
];

const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Customer Rating", value: "rating" },
];

function ShopInner() {
  const searchParams = useSearchParams();
  const initialCategoryParam = searchParams.get("category");

  const [categories, setCategories] = useState<{ label: string; value: string }[]>(DEFAULT_CATEGORIES);

  // Normalize initial category from URL
  const getInitialCategory = (): string => {
    if (!initialCategoryParam) return "All";
    const found = DEFAULT_CATEGORIES.find(
      (c) =>
        c.value.toLowerCase().replace(/\s+/g, "-") ===
        initialCategoryParam.toLowerCase()
    );
    return found ? found.value : initialCategoryParam;
  };

  const [selectedCategory, setSelectedCategory] = useState<string>(getInitialCategory);
  const [selectedSort, setSelectedSort] = useState<string>("featured");
  const [products, setProducts] = useState<NekaraProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState<number>(12);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Load dynamic categories from Firestore
  useEffect(() => {
    async function loadDynamicCategories() {
      try {
        const firestoreCats = await getCategories();
        if (firestoreCats && firestoreCats.length > 0) {
          const list = [
            { label: "All Sarees", value: "All" },
            ...firestoreCats.map((c) => ({ label: c.name, value: c.name })),
          ];
          setCategories(list);
        }
      } catch (err) {
        console.warn("Using default category list:", err);
      }
    }
    loadDynamicCategories();
  }, []);

  // Sync category state when URL searchParams changes
  useEffect(() => {
    if (initialCategoryParam) {
      const match = categories.find(
        (c) =>
          c.value.toLowerCase().replace(/\s+/g, "-") ===
          initialCategoryParam.toLowerCase()
      );
      if (match) {
        setSelectedCategory(match.value);
      } else {
        setSelectedCategory(initialCategoryParam);
      }
    }
  }, [initialCategoryParam, categories]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getProducts({
        limit,
        category: selectedCategory,
        sort: selectedSort,
      });
      setProducts(res.products);
      setHasMore(res.products.length < res.total && res.products.length >= limit);
    } catch (err) {
      console.error("Shop: error fetching products:", err);
      setError("Unable to load the collection right now.");
    } finally {
      setIsLoading(false);
    }
  }, [limit, selectedCategory, selectedSort]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCategorySelect = (categoryValue: string) => {
    setSelectedCategory(categoryValue);
    setLimit(12);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSort(e.target.value);
  };

  const handleLoadMore = () => {
    setLimit((prev) => prev + 8);
  };

  return (
    <div className="w-full bg-[#FDFBF7] min-h-screen pb-20 pt-28 sm:pt-36">
      {/* =========================================================
          1. EDITORIAL COLLECTION HEADER
         ========================================================= */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center mb-10 sm:mb-14">
        {/* Subtle Indian decorative watermark */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="w-8 sm:w-12 h-[1px] bg-[#B58A45]/40" />
          <IndianOrnament size={20} className="text-[#B58A45]" />
          <span className="w-8 sm:w-12 h-[1px] bg-[#B58A45]/40" />
        </div>

        {/* Small Breadcrumb */}
        <div className="text-[10px] sm:text-xs tracking-[0.25em] font-sans font-semibold uppercase text-[#B58A45] mb-2">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2 text-[#3A2115]/30">/</span>
          <span>Shop</span>
        </div>

        {/* Main Heading */}
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal text-[#241A15] tracking-wide mb-3">
          The NEKARA Collection
        </h1>

        {/* Subtitle */}
        <p className="font-serif text-base sm:text-lg md:text-xl text-[#B58A45] italic font-light max-w-2xl mx-auto mb-2">
          Timeless Sarees. Crafted for Every Occasion.
        </p>

        {/* Supporting Copy */}
        <p className="font-sans text-xs sm:text-sm text-[#3A2115]/75 max-w-xl mx-auto">
          Explore handpicked silhouettes inspired by India&apos;s rich weaving traditions, celebrating pure silk, handlooms, and regal artistry.
        </p>
      </section>

      {/* =========================================================
          2. FILTER & SORT TOOLBAR
         ========================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-8 sm:mb-12">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-[#B58A45]/25">
          {/* Category Filter Pills / Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => handleCategorySelect(cat.value)}
                  className={cn(
                    "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-250 min-h-[38px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A45]",
                    isActive
                      ? "bg-[#02221D] text-[#FAF5ED] shadow-sm"
                      : "bg-[#FFFBF5] text-[#3A2115]/80 hover:text-[#02221D] hover:bg-[#FAF3E7] border border-[#B58A45]/25"
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Sort Dropdown & Product Counter */}
          <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
            <span className="text-xs text-[#3A2115]/70 font-sans">
              Showing <span className="font-semibold text-[#241A15]">{products.length}</span> Sarees
            </span>

            {/* Custom Styled Sort Dropdown */}
            <div className="relative inline-flex items-center">
              <label htmlFor="shop-sort" className="sr-only">Sort by</label>
              <select
                id="shop-sort"
                value={selectedSort}
                onChange={handleSortChange}
                className="appearance-none bg-[#FFFBF5] border border-[#B58A45]/30 rounded-xs px-3.5 py-2 pr-8 text-xs font-medium text-[#241A15] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A45] cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    Sort: {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon
                size={12}
                className="absolute right-2.5 pointer-events-none text-[#3A2115]/60"
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          3. PRODUCT GRID
         ========================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <ProductGrid
          products={products}
          isLoading={isLoading}
          error={error}
          onRetry={loadData}
          skeletonCount={limit}
        />

        {/* Load More Button */}
        {hasMore && !isLoading && !error && products.length > 0 && (
          <div className="mt-12 sm:mt-16 text-center">
            <button
              type="button"
              onClick={handleLoadMore}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xs bg-[#FFFBF5] hover:bg-[#FAF3E7] text-[#241A15] border border-[#B58A45]/40 hover:border-[#B58A45] font-sans font-semibold text-xs tracking-[0.18em] uppercase transition-all duration-300 shadow-xs hover:shadow-sm min-h-[44px]"
            >
              <span>LOAD MORE SAREES</span>
              <span aria-hidden="true">↓</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full bg-[#FDFBF7] min-h-screen pb-20 pt-36 px-4 max-w-7xl mx-auto">
          <ProductGridSkeleton count={8} />
        </div>
      }
    >
      <ShopInner />
    </Suspense>
  );
}
