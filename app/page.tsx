"use client";

import React, { useEffect, useState, useMemo } from "react";
import { HeroSlider } from "@/components/home/HeroSlider";
import { TrustFeatures } from "@/components/home/TrustFeatures";
import { CategorySection } from "@/components/home/CategorySection";
import { ShopByStyle } from "@/components/home/ShopByStyle";
import { DynamicProductSection } from "@/components/home/DynamicProductSection";
import { BrandStory } from "@/components/home/BrandStory";
import { CraftsmanshipSection } from "@/components/home/CraftsmanshipSection";
import { CollectionCta } from "@/components/home/CollectionCta";
import { JournalSection } from "@/components/home/JournalSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { ProductSkeleton } from "@/components/products/ProductSkeleton";
import { HomeSection, NekaraProduct, NekaraCategory } from "@/types/product";
import { getProducts, getCategories } from "@/lib/products";
import {
  getHomeSections,
  DEFAULT_STOREFRONT_SECTIONS,
} from "@/lib/storefront";

export default function HomePage() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [products, setProducts] = useState<NekaraProduct[]>([]);
  const [categories, setCategories] = useState<NekaraCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomepageMerchandising() {
      try {
        setLoading(true);

        // Fetch homeSections, products, and categories concurrently
        const [sectionsData, productsResult, categoriesData] = await Promise.all([
          getHomeSections(),
          getProducts({ limit: 100 }),
          getCategories(),
        ]);

        const allActiveProducts = productsResult.products || [];
        setProducts(allActiveProducts);
        setCategories(categoriesData || []);

        if (sectionsData && sectionsData.length > 0) {
          setSections(sectionsData);
        } else {
          setSections(DEFAULT_STOREFRONT_SECTIONS);
        }
      } catch (err) {
        console.warn("[NEKARA Storefront] Failed to load home sections, using fallback:", err);
        setSections(DEFAULT_STOREFRONT_SECTIONS);
      } finally {
        setLoading(false);
      }
    }

    loadHomepageMerchandising();
  }, []);

  // Filter hero section and optional shopByStyle section
  const heroSection = sections.find((s) => s.id === "hero") || DEFAULT_STOREFRONT_SECTIONS[0];
  const shopByStyleSection = sections.find((s) => s.id === "shopByStyle");

  // The 3 Core Homepage Sections in exact requested order:
  // 1. New Arrivals: active == true && newArrival == true
  // 2. Trending Sarees: active == true && featured == true
  // 3. Bestsellers: active == true && bestseller == true
  const homepageProductSections = useMemo(() => {
    const activeProducts = products.filter((p) => p.active !== false);

    const newArrivalsList = activeProducts.filter((p) => p.newArrival === true);
    const trendingList = activeProducts.filter((p) => p.featured === true);
    const bestsellersList = activeProducts.filter((p) => p.bestseller === true);

    const list: {
      section: HomeSection;
      products: NekaraProduct[];
    }[] = [
      {
        section: {
          id: "newArrivals",
          title: "New Arrivals",
          subtitle: "Fresh additions directly from our master artisan looms",
          enabled: true,
          mode: "automatic",
          productIds: [],
          displayOrder: 1,
          limit: 8,
        },
        products: newArrivalsList,
      },
      {
        section: {
          id: "trending",
          title: "Trending Sarees",
          subtitle: "Discover the sarees everyone is loving",
          enabled: true,
          mode: "automatic",
          productIds: [],
          displayOrder: 2,
          limit: 8,
        },
        products: trendingList,
      },
      {
        section: {
          id: "bestsellers",
          title: "Bestsellers",
          subtitle: "Our most cherished and celebrated heirloom weaves",
          enabled: true,
          mode: "automatic",
          productIds: [],
          displayOrder: 3,
          limit: 8,
        },
        products: bestsellersList,
      },
    ];

    return list;
  }, [products]);

  return (
    <div className="w-full">
      {/* 1. Hero Experience */}
      {heroSection && (
        <HeroSlider
          enabled={heroSection.enabled !== false}
          title={heroSection.title}
          subtitle={heroSection.subtitle}
        />
      )}

      {/* 2. Premium Trust / Brand Values Strip */}
      <TrustFeatures />

      {/* 3. Explore by Category (Strictly dynamic from Firestore) */}
      <CategorySection categories={categories} />

      {/* 4. Optional Shop By Style if configured and has categories */}
      {shopByStyleSection && shopByStyleSection.enabled && (
        <ShopByStyle
          title={shopByStyleSection.title}
          subtitle={shopByStyleSection.subtitle}
          categoryIds={shopByStyleSection.categoryIds}
        />
      )}

      {/* 5. Loading State Skeletons */}
      {loading ? (
        <section className="relative w-full bg-[#FAF6F0] py-10 sm:py-16 overflow-hidden border-t border-[#B58A45]/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-8 w-48 bg-[#E5D8C5]/40 rounded mb-8 animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductSkeleton key={`home-skel-${i}`} />
              ))}
            </div>
          </div>
        </section>
      ) : (
        /* 6. The 3 Core Homepage Sections (New Arrivals, Trending Sarees, Bestsellers) */
        homepageProductSections.map(({ section, products: sectionProducts }) => {
          // Gracefully hide sections that have 0 products matching the criteria
          if (sectionProducts.length === 0) {
            return null;
          }

          return (
            <DynamicProductSection
              key={section.id}
              section={section}
              products={sectionProducts}
            />
          );
        })
      )}

      {/* 7. Brand Story & Heritage Lineage */}
      <BrandStory />

      {/* 8. The Art of the Weave / Craftsmanship */}
      <CraftsmanshipSection />

      {/* 9. Collection Call-to-Action */}
      <CollectionCta />

      {/* 10. From the NEKARA Journal */}
      <JournalSection />

      {/* 11. Privileged Access / Newsletter */}
      <NewsletterSection />
    </div>
  );
}
