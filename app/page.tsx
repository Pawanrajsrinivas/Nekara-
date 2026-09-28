import React from "react";
import { HeroSlider } from "@/components/home/HeroSlider";
import { TrustFeatures } from "@/components/home/TrustFeatures";
import { CategorySection } from "@/components/home/CategorySection";
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

      {/* 4. Our Signature Sarees (Dynamic DummyJSON-powered) */}
      <SignatureSarees />

      {/* 5. Brand Story & Heritage Lineage */}
      <BrandStory />

      {/* 6. The Art of the Weave / Craftsmanship */}
      <CraftsmanshipSection />

      {/* 7. Collection Call-to-Action */}
      <CollectionCta />

      {/* 8. From the NEKARA Journal */}
      <JournalSection />

      {/* 9. Privileged Access / Newsletter */}
      <NewsletterSection />
    </div>
  );
}
