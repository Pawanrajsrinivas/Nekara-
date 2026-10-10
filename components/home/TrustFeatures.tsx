import React from "react";
import { TRUST_FEATURES } from "@/data/trustFeatures";
import {
  LotusMotifIcon,
  LoomWeaveIcon,
  DiamondCraftIcon,
  DeliveryTruckIcon,
} from "@/components/ui/TrustIcons";

export function TrustFeatures() {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "lotus":
        return <LotusMotifIcon size={24} className="text-[#B58A45] shrink-0 sm:w-6 sm:h-6" />;
      case "weave":
        return <LoomWeaveIcon size={24} className="text-[#B58A45] shrink-0 sm:w-6 sm:h-6" />;
      case "diamond":
        return <DiamondCraftIcon size={24} className="text-[#B58A45] shrink-0 sm:w-6 sm:h-6" />;
      case "delivery":
        return <DeliveryTruckIcon size={24} className="text-[#B58A45] shrink-0 sm:w-6 sm:h-6" />;
      default:
        return <LotusMotifIcon size={24} className="text-[#B58A45] shrink-0 sm:w-6 sm:h-6" />;
    }
  };

  // Render a single sequence of trust feature pills
  const renderSequence = (keyPrefix: string) => (
    <div key={keyPrefix} className="flex items-center gap-8 sm:gap-12 lg:gap-16 pr-8 sm:pr-12 lg:pr-16 shrink-0">
      {TRUST_FEATURES.map((feature) => (
        <div
          key={`${keyPrefix}-${feature.id}`}
          className="flex items-center gap-3 shrink-0 py-1"
        >
          {/* Feature Icon */}
          <div className="shrink-0 p-1.5 rounded-full bg-[#B58A45]/10 border border-[#B58A45]/20">
            {getIcon(feature.iconName)}
          </div>

          {/* Feature Text */}
          <div className="flex flex-col text-left whitespace-nowrap">
            <span className="font-serif text-[13px] sm:text-[14px] font-semibold text-[#02221D] leading-tight tracking-wide">
              {feature.title}
            </span>
            {feature.subtitle && (
              <span className="text-[10px] sm:text-[11px] text-[#3A2115]/65 font-sans tracking-normal mt-0.5">
                {feature.subtitle}
              </span>
            )}
          </div>

          {/* Subtle separator dot */}
          <span className="ml-6 sm:ml-10 text-[#B58A45]/40 text-xs select-none" aria-hidden="true">
            ✦
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <section
      aria-label="Brand Guarantees and Trust Features"
      className="relative w-full bg-[#FAF3E7] border-y border-[#B58A45]/25 py-2.5 sm:py-3 overflow-hidden select-none"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(181, 138, 69, 0.05) 0%, transparent 80%)`,
      }}
    >
      {/* Outer container with soft gradient edge masks */}
      <div className="relative w-full overflow-hidden">
        {/* Left and Right edge fade masks for smooth entry/exit */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#FAF3E7] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#FAF3E7] to-transparent z-10 pointer-events-none" />

        {/* CSS Marquee continuous moving row */}
        <div className="animate-marquee flex items-center">
          {renderSequence("seq1")}
          {renderSequence("seq2")}
          {renderSequence("seq3")}
          {renderSequence("seq4")}
        </div>
      </div>
    </section>
  );
}
