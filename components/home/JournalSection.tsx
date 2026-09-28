import React from "react";
import Image from "next/image";
import Link from "next/link";
import { IndianOrnament } from "@/components/ui/IndianOrnament";

const JOURNAL_ARTICLES = [
  {
    id: "kanchipura-art",
    title: "The Art of Kanchipuram Weaving",
    category: "TEXTILE HERITAGE",
    readTime: "5 MIN READ",
    description:
      "Discover the centuries-old korvai interlocking tradition behind one of India's most celebrated temple silk sarees.",
    image: "/images/categories/kanchipuram-sarees.jpg",
    alt: "Traditional Kanchipuram gold zari borders and silk weave",
    href: "/journal",
  },
  {
    id: "banarasi-story",
    title: "The Story Behind Banarasi Silk",
    category: "ZARI & MOTIFS",
    readTime: "4 MIN READ",
    description:
      "Exploring centuries of artistry and royal patronage woven into every intricate kadwa floral jaal on the banks of the Ganges.",
    image: "/images/categories/silk-sarees.jpg",
    alt: "Artisan detail of pure Banarasi gold zari floral jaal",
    href: "/journal",
  },
  {
    id: "modern-draping",
    title: "How to Drape a Saree for Modern Occasions",
    category: "STYLE & DRAPING",
    readTime: "3 MIN READ",
    description:
      "Timeless elegance styled for contemporary celebrations, weddings, and evening receptions with fluid grace.",
    image: "/images/categories/designer-sarees.jpg",
    alt: "Contemporary silhouette of luxury silk drape",
    href: "/journal",
  },
];

export function JournalSection() {
  return (
    <section
      aria-label="From the NEKARA Journal"
      className="relative w-full bg-[#FFFBF5] py-16 sm:py-24 lg:py-28 overflow-hidden"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* =========================================================
            SECTION HEADER
           ========================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14 pb-5 border-b border-[#B58A45]/25">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-[1px] bg-[#B58A45]" />
              <span className="font-sans text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-[#B58A45]">
                EDITORIAL ARCHIVES
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-[34px] font-normal tracking-wide text-[#241A15]">
              From the NEKARA Journal
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#3A2115]/70 mt-1 max-w-xl">
              Stories of Indian textiles, craftsmanship, culture, and modern draping.
            </p>
          </div>

          <Link
            href="/journal"
            className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium tracking-wider text-[#B58A45] hover:text-[#075E5A] transition-colors shrink-0 min-h-[44px]"
            aria-label="View all stories from the NEKARA journal"
          >
            <span>View All Stories</span>
            <span
              className="inline-block transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            >
              →
            </span>
          </Link>
        </div>

        {/* =========================================================
            3 EDITORIAL CARDS
           ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {JOURNAL_ARTICLES.map((article) => (
            <article
              key={article.id}
              className="group flex flex-col bg-[#FFFBF5] border border-[#B58A45]/20 hover:border-[#B58A45]/50 rounded-xs overflow-hidden transition-all duration-300 shadow-[0_4px_16px_rgba(58,33,21,0.03)] hover:shadow-[0_8px_24px_rgba(181,138,69,0.12)] hover:-translate-y-0.5"
            >
              <Link href={article.href} className="flex flex-col h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A45]">
                {/* Article Image Container */}
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#FAF3E7]">
                  <Image
                    src={article.image}
                    alt={article.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-600 ease-out group-hover:scale-104"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Article Content */}
                <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between bg-[#FFFBF5]">
                  <div>
                    {/* Category & Read Time */}
                    <div className="flex items-center justify-between text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-[#B58A45] mb-2.5">
                      <span>{article.category}</span>
                      <span className="text-[#3A2115]/50 font-normal">{article.readTime}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-lg sm:text-[19px] font-normal leading-snug text-[#241A15] group-hover:text-[#075E5A] transition-colors mb-2 line-clamp-2">
                      {article.title}
                    </h3>

                    {/* Description */}
                    <p className="font-sans text-xs sm:text-[13px] leading-relaxed text-[#3A2115]/75 line-clamp-3">
                      {article.description}
                    </p>
                  </div>

                  {/* Read Story CTA */}
                  <div className="mt-5 pt-3 border-t border-[#B58A45]/15 flex items-center justify-between">
                    <span className="text-[11px] font-sans font-semibold text-[#B58A45] group-hover:text-[#075E5A] tracking-[0.16em] uppercase flex items-center gap-1">
                      <span>READ STORY</span>
                      <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
