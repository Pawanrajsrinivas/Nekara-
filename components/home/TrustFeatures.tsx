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
        return <LotusMotifIcon size={36} className="text-[#B58A45] shrink-0 sm:w-10 sm:h-10" />;
      case "weave":
        return <LoomWeaveIcon size={36} className="text-[#B58A45] shrink-0 sm:w-10 sm:h-10" />;
      case "diamond":
        return <DiamondCraftIcon size={36} className="text-[#B58A45] shrink-0 sm:w-10 sm:h-10" />;
      case "delivery":
        return <DeliveryTruckIcon size={36} className="text-[#B58A45] shrink-0 sm:w-10 sm:h-10" />;
      default:
        return <LotusMotifIcon size={36} className="text-[#B58A45] shrink-0 sm:w-10 sm:h-10" />;
    }
  };

  return (
    <section
      aria-label="Brand Guarantees and Trust Features"
      className="relative w-full bg-[#FAF3E7] border-y border-[#B58A45]/25 py-5 sm:py-7 lg:py-8"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(181, 138, 69, 0.04) 0%, transparent 80%)`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 4 columns on desktop, clean balanced 2x2 grid on mobile/tablet */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-5 gap-x-3 sm:gap-x-6 lg:gap-x-8">
          {TRUST_FEATURES.map((feature) => (
            <div
              key={feature.id}
              className="flex items-center justify-start sm:justify-center gap-2.5 sm:gap-4 group transition-transform duration-300 hover:-translate-y-0.5"
            >
              {/* Feature Icon */}
              <div className="transition-transform duration-300 group-hover:scale-105 shrink-0">
                {getIcon(feature.iconName)}
              </div>

              {/* Feature Text */}
              <div className="flex flex-col text-left min-w-0">
                <h3 className="font-serif text-[13px] sm:text-[15px] lg:text-[16px] font-semibold text-[#3A2115] leading-snug tracking-wide group-hover:text-[#075E5A] transition-colors truncate sm:whitespace-normal">
                  {feature.title}
                </h3>
                {feature.subtitle && (
                  <span className="text-[10px] sm:text-xs text-[#3A2115]/65 font-sans tracking-normal mt-0.5 truncate sm:whitespace-normal">
                    {feature.subtitle}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
