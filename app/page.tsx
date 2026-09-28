import React from "react";
import { HeroSlider } from "@/components/home/HeroSlider";
import { TrustFeatures } from "@/components/home/TrustFeatures";
import { CategorySection } from "@/components/home/CategorySection";
import { ShopByStyle } from "@/components/home/ShopByStyle";
import { SignatureSarees } from "@/components/home/SignatureSarees";
import { BrandStory } from "@/components/home/BrandStory";
import { CraftsmanshipSection } from "@/components/home/CraftsmanshipSection";
import { CollectionCta } from "@/components/home/CollectionCta";
import { JournalSection } from "@/components/home/JournalSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";

export default function HomePage() {
  return (
    <div className="w-full">
      {/* 1. Hero Experience */}
      <HeroSlider />

      {/* 2. Premium Trust / Brand Values Strip */}
      <TrustFeatures />

      {/* 3. Explore by Category */}
      <CategorySection />

      {/* 4. Curated Shop by Style */}
      <ShopByStyle />

      {/* 5. Our Signature Sarees (Dynamic DummyJSON-powered) */}
      <SignatureSarees />

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
