"use client";

import React, { useEffect, useState } from "react";
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
  resolveSectionProducts,
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

        // If Firestore homeSections has documents, use them; otherwise use default fallback
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

  // Filter enabled sections and sort by displayOrder
  const enabledSections = (sections.length > 0 ? sections : DEFAULT_STOREFRONT_SECTIONS)
    .filter((s) => s.enabled !== false)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  // Find hero and shopByStyle configuration if present
  const heroSection = enabledSections.find((s) => s.id === "hero");
  const otherSections = enabledSections.filter((s) => s.id !== "hero");

  return (
    <div className="w-full">
      {/* 1. Hero Experience */}
      {heroSection && (
        <HeroSlider
          enabled={heroSection.enabled}
          title={heroSection.title}
          subtitle={heroSection.subtitle}
        />
      )}

      {/* 2. Premium Trust / Brand Values Strip */}
      <TrustFeatures />

      {/* 3. Explore by Category (Strictly dynamic from Firestore) */}
      <CategorySection categories={categories} />

      {/* 4. Loading State Skeletons */}
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
        /* 5. Dynamic Homepage Sections (Featured, New Arrivals, Bestsellers) */
        otherSections.map((section) => {
          if (section.id === "shopByStyle") {
            return (
              <ShopByStyle
                key="shopByStyle"
                title={section.title}
                subtitle={section.subtitle}
                categoryIds={section.categoryIds}
              />
            );
          }

          // Product-based sections (Featured, New Arrivals, Bestsellers, Offers)
          const sectionProducts = resolveSectionProducts(section, products);

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

      {/* 6. Brand Story & Heritage Lineage */}
      <BrandStory />

      {/* 7. The Art of the Weave / Craftsmanship */}
      <CraftsmanshipSection />

      {/* 8. Collection Call-to-Action */}
      <CollectionCta />

      {/* 9. From the NEKARA Journal */}
      <JournalSection />

      {/* 10. Privileged Access / Newsletter */}
      <NewsletterSection />
    </div>
  );
}
