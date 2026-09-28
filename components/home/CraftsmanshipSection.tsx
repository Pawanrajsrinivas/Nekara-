import React from "react";
import { IndianOrnament } from "@/components/ui/IndianOrnament";
import { LoomWeaveIcon, LotusMotifIcon, DiamondCraftIcon } from "@/components/ui/TrustIcons";

const CRAFT_HIGHLIGHTS = [
  {
    icon: LoomWeaveIcon,
    title: "HANDWOVEN",
    subtitle: "Sacred Loom Tradition",
    description:
      "Crafted with patience, rhythmic precision, and centuries of inherited loom wisdom passed down through generations of master weavers.",
  },
  {
    icon: DiamondCraftIcon,
    title: "TIMELESS ZARI",
    subtitle: "Certified Pure Zari",
    description:
      "Intricate motifs inspired by temple architecture, royal flora, and celestial geometry woven with certified gold and silver zari threads.",
  },
  {
    icon: LotusMotifIcon,
    title: "ARTISAN CRAFT",
    subtitle: "Empowering Weaving Guilds",
    description:
      "Celebrating the hands, dignity, and cultural legacy behind every weave across Varanasi, Kanchipuram, Chanderi, and Bengal.",
  },
];

export function CraftsmanshipSection() {
  return (
    <section
      aria-label="The Art of the Weave - Craftsmanship"
      className="relative w-full bg-[#FAF6F0] py-16 sm:py-24 lg:py-28 overflow-hidden border-t border-[#B58A45]/20"
    >
      {/* Background Radial Texture */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#B58A45 1.5px, transparent 1.5px), radial-gradient(#3A2115 1px, #FAF6F0 1px)`,
          backgroundSize: "40px 40px",
          backgroundPosition: "0 0, 20px 20px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* =========================================================
            SECTION HEADER
           ========================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="w-8 sm:w-12 h-[1px] bg-[#B58A45]/40" />
            <span className="text-[10px] sm:text-xs font-sans font-semibold uppercase tracking-[0.28em] text-[#B58A45]">
              HERITAGE &amp; ARTISANSHIP
            </span>
            <span className="w-8 sm:w-12 h-[1px] bg-[#B58A45]/40" />
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl lg:text-[40px] font-normal tracking-wide text-[#241A15] leading-[1.2] mb-4">
            The Art of the Weave
          </h2>

          {/* Central Ornament */}
          <div className="flex justify-center mb-4">
            <IndianOrnament size={20} className="text-[#B58A45]" />
          </div>

          <p className="font-sans text-xs sm:text-[14px] leading-relaxed text-[#3A2115]/75 max-w-2xl mx-auto">
            Every NEKARA saree begins with a profound respect for the hands behind it. From carefully selected natural mulberry yarns to intricate kadwa zari work, our collections celebrate the artisans and living traditions that make Indian textiles extraordinary.
          </p>
        </div>

        {/* =========================================================
            3 CRAFTSMANSHIP HIGHLIGHTS (Editorial Columns with Minimal Dividers)
           ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 relative">
          {CRAFT_HIGHLIGHTS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex flex-col items-center text-center group p-6 sm:p-8 relative transition-all duration-300"
              >
                {/* Minimal vertical divider between columns on desktop */}
                {index > 0 && (
                  <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 h-36 w-[1px] bg-gradient-to-b from-transparent via-[#B58A45]/30 to-transparent pointer-events-none" />
                )}

                {/* Subtle Artisan Icon Emblem */}
                <div className="w-14 h-14 rounded-full flex items-center justify-center border border-[#B58A45]/30 bg-[#FFFBF5] text-[#B58A45] mb-5 group-hover:scale-105 group-hover:border-[#B58A45] group-hover:text-[#075E5A] transition-all duration-300 shadow-xs">
                  <Icon size={28} />
                </div>

                {/* Title */}
                <h3 className="font-serif text-lg sm:text-xl font-medium tracking-[0.14em] text-[#241A15] uppercase mb-1 group-hover:text-[#075E5A] transition-colors">
                  {item.title}
                </h3>

                {/* Subtitle */}
                <span className="text-[11px] font-sans text-[#B58A45] tracking-[0.2em] uppercase font-semibold mb-3">
                  {item.subtitle}
                </span>

                {/* Description */}
                <p className="font-sans text-xs sm:text-[13px] leading-relaxed text-[#3A2115]/75 max-w-xs">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
