import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { IndianOrnament } from "@/components/ui/IndianOrnament";
import { LoomWeaveIcon, LotusMotifIcon, DiamondCraftIcon } from "@/components/ui/TrustIcons";

export const metadata: Metadata = {
  title: "NEKARA — Our Story | Sarees & Textiles",
  description:
    "Discover NEKARA's story, Indian textile heritage, craftsmanship and timeless approach to sarees.",
};

const CRAFT_VALUES = [
  {
    number: "01",
    title: "MASTERFUL CRAFT",
    description:
      "Honouring centuries of inherited loom wisdom and the rhythmic dedication of master weavers across historical textile clusters.",
  },
  {
    number: "02",
    title: "TIMELESS TEXTILES",
    description:
      "Yarns and drapes crafted to endure through sacred ceremonies, celebratory moments, and to be passed down with pride.",
  },
  {
    number: "03",
    title: "AUTHENTIC WEAVES",
    description:
      "Preserving unadulterated pure silk fibers, certified natural dyes, and verified zari craftsmanship without synthetic shortcuts.",
  },
  {
    number: "04",
    title: "CONTEMPORARY ELEGANCE",
    description:
      "Fluid, lightweight drapes tailored to feel natural and effortless for the modern woman while retaining regal heritage stature.",
  },
];

const REGIONAL_TRADITIONS = [
  {
    id: "banaras",
    name: "Banarasi Heritage",
    region: "VARANASI, UTTAR PRADESH",
    description:
      "Renowned for opulent gold and silver zari, intricate kadwa floral jaal, and centuries of royal patronage on the banks of the sacred Ganges.",
    image: "/images/categories/banarasi-sarees.jpg",
    alt: "Intricate handwoven Banarasi gold zari floral motif",
    href: "/shop?category=banarasi-sarees",
  },
  {
    id: "kanchipuram",
    name: "Kanchipuram Silks",
    region: "TAMIL NADU",
    description:
      "Celebrated for heavy mulberry silk, the ancient korvai interlocking border technique, and motifs inspired by South Indian temple architecture.",
    image: "/images/categories/kanchipuram-sarees.jpg",
    alt: "Traditional pure Kanchipuram silk saree with contrast temple border",
    href: "/shop?category=kanchipuram-sarees",
  },
  {
    id: "chanderi",
    name: "Chanderi Handlooms",
    region: "MADHYA PRADESH",
    description:
      "Characterized by its featherweight sheer texture, fine silk-cotton yarn composition, and delicate gold zari bootis handwoven on traditional pit looms.",
    image: "/images/categories/cotton-sarees.jpg",
    alt: "Delicate Chanderi handloom silk cotton drape with gold border",
    href: "/shop?category=cotton-sarees",
  },
  {
    id: "contemporary",
    name: "Festive & Party Wear",
    region: "PAN-INDIAN ATELIER",
    description:
      "Contemporary couture drapes embracing fluid silhouettes, refined modern hues, and artisanal accents designed for celebratory evenings.",
    image: "/images/categories/party-wear.jpg",
    alt: "Contemporary luxury designer saree for celebratory occasions",
    href: "/shop?category=party-wear",
  },
];

const PROMISES = [
  {
    title: "CRAFT",
    subtitle: "Sacred Loom Techniques",
    description:
      "Deep reverence for traditional handloom methods, refusing rapid industrial shortcuts in favor of enduring artisanal integrity.",
  },
  {
    title: "QUALITY",
    subtitle: "Certified Yarns & Zari",
    description:
      "Meticulous curation of certified mulberry silks, natural handspun fibers, and tested zari threads that stand the test of time.",
  },
  {
    title: "TIMELESSNESS",
    subtitle: "Beyond Seasonal Trends",
    description:
      "Silhouettes and palettes conceived to transcend ephemeral fashion seasons, destined to become cherished family heirlooms.",
  },
  {
    title: "HERITAGE",
    subtitle: "Preserving Guild Dignity",
    description:
      "Sustaining the living legacy, dignity, and creative future of India's master weaving families across generational clusters.",
  },
];

export default function AboutPage() {
  return (
    <div className="w-full bg-[#FDFBF7] text-[#241A15] overflow-x-clip">
      {/* =========================================================
          1. HERO SECTION: Full-Width Luxury Editorial Composition
         ========================================================= */}
      <section
        aria-label="About NEKARA - Editorial Hero"
        className="relative w-full h-[66vh] min-h-[480px] max-h-[620px] sm:h-[76vh] sm:min-h-[540px] md:h-[84vh] md:min-h-[620px] lg:h-[88vh] lg:min-h-[680px] overflow-hidden bg-[#123F38]"
      >
        {/* Background Hero Photography */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/images/hero/slide 2.png"
            alt="NEKARA Handcrafted Saree Heritage"
            fill
            sizes="100vw"
            priority
            unoptimized
            className="object-cover object-[78%_center] sm:object-[70%_center] md:object-center transition-transform duration-1000 ease-out"
          />

          {/* Luxury Contrast Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 via-55% to-black/30 md:bg-gradient-to-r md:from-black/75 md:via-black/40 md:to-transparent pointer-events-none" />
          <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/40 pointer-events-none" />
        </div>

        {/* Hero Content Area */}
        <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-8 sm:pb-14 md:pb-20 lg:pb-24 pt-24 sm:pt-28">
          <div className="max-w-2xl text-left space-y-2.5 sm:space-y-4">
            {/* Small Eyebrow */}
            <div className="flex items-center gap-2.5">
              <span className="w-6 sm:w-8 h-[1.5px] bg-[#B58A45]" />
              <span className="font-sans text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#EFE2D0] font-semibold drop-shadow-md">
                OUR STORY
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="font-serif text-2xl min-[380px]:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-[#FAF5ED] leading-[1.15] sm:leading-[1.1] tracking-wide uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]">
              Weaving a Legacy
              <br />
              <span className="font-normal italic text-[#D4AF37] font-serif lowercase">of</span> Elegance
            </h1>

            {/* Supporting Text */}
            <p className="font-serif text-xs sm:text-base md:text-lg text-[#F7F0E4]/90 tracking-wide drop-shadow-md italic max-w-xl leading-relaxed">
              Where generations of Indian craftsmanship meet contemporary elegance.
            </p>

            {/* CTA Button */}
            <div className="pt-2 sm:pt-4">
              <Link
                href="/craftsmanship"
                className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-3.5 rounded-xs bg-[#C89B3C] hover:bg-[#B58A45] text-[#241A15] font-sans font-semibold text-[11px] sm:text-xs tracking-[0.2em] uppercase transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 min-h-[44px]"
              >
                <span>EXPLORE OUR CRAFTSMANSHIP</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          2. BRAND INTRODUCTION: "A STORY WOVEN IN TRADITION"
         ========================================================= */}
      <section
        aria-label="Brand Introduction"
        className="relative w-full bg-[#FDFBF7] py-16 sm:py-24 lg:py-28 overflow-hidden border-b border-[#B58A45]/20"
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-start">
            {/* Left: Heading & Central Motif */}
            <div className="lg:col-span-5 text-left">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 sm:w-7 h-[1px] bg-[#B58A45]" />
                <span className="font-sans text-[10px] sm:text-xs font-semibold tracking-[0.28em] uppercase text-[#B58A45]">
                  FOUNDED 2001
                </span>
              </div>

              <h2 className="font-serif text-2xl sm:text-4xl lg:text-[44px] font-normal text-[#241A15] leading-[1.18] tracking-wide mb-4 sm:mb-6 uppercase">
                A Story
                <br />
                Woven In
                <br />
                <span className="font-light italic text-[#075E5A] font-serif lowercase">tradition</span>
              </h2>

              <div className="flex items-center gap-3">
                <div className="w-12 h-[1.5px] bg-[#B58A45]/50" />
                <IndianOrnament size={20} className="text-[#B58A45]" />
              </div>
            </div>

            {/* Right: Rich Editorial Content */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-xs sm:text-[15px] leading-relaxed text-[#3A2115]/80 font-sans text-left">
              <p className="font-serif text-base sm:text-lg text-[#075E5A] italic leading-relaxed">
                &ldquo;NEKARA was born from a deep appreciation for India&apos;s extraordinary weaving traditions — from the looms of Kanchipuram and Banaras to the artistry carried forward by generations of master weavers.&rdquo;
              </p>

              <p>
                Established in 2001, our journey began with a singular devotion: to preserve the living rhythm of the handloom and bring the timeless majesty of Indian textiles to discerning women across the globe. We saw that in an era of rapid mass-production, the sacred patience of handspun mulberry silk, kadwa zari motifs, and vegetable dyeing was at risk of becoming a forgotten language.
              </p>

              <p>
                At NEKARA, every drape is crafted as an heirloom piece. We work in harmonic partnership with revered artisan guilds across Varanasi, Kanchipuram, Chanderi, and Bengal, ensuring fair patronage, respect for traditional methods, and uncompromising fabric integrity.
              </p>

              <p>
                Our collections celebrate the balance between classical heritage and modern grace. Whether an opulent bridal Kanjeevaram rich with temple borders or an airy handloom drape for intimate celebrations, a NEKARA saree is made to accompany life&apos;s most meaningful memories.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          3. HERITAGE IMAGE SECTION: "CRAFTED THROUGH GENERATIONS"
         ========================================================= */}
      <section
        aria-label="Crafted Through Generations"
        className="relative w-full bg-[#FAF6F0] py-16 sm:py-24 lg:py-28 overflow-hidden border-b border-[#B58A45]/20"
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Left Image Showcase with Asymmetrical Frame */}
            <div className="lg:col-span-7">
              <div className="relative mx-auto max-w-xl lg:max-w-none">
                {/* Decorative Offset Gold Frame */}
                <div className="absolute -inset-3 sm:-inset-4 border border-[#B58A45]/35 rounded-xs pointer-events-none" />

                <div className="relative w-full h-[290px] xs:h-[340px] sm:h-[440px] lg:h-[500px] rounded-xs overflow-hidden bg-[#FAF3E7] shadow-[0_8px_32px_rgba(58,33,21,0.08)]">
                  <Image
                    src="/images/categories/banarasi-sarees.jpg"
                    alt="Master artisan weaving pure Banarasi gold zari motifs"
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover object-center transition-transform duration-700 hover:scale-102"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                  {/* Floating Heritage Seal */}
                  <div className="absolute bottom-4 left-4 z-10 bg-[#FAF5ED]/95 backdrop-blur-md px-3.5 py-2 border border-[#B58A45]/40 rounded-xs shadow-sm flex items-center gap-2.5">
                    <IndianOrnament size={16} className="text-[#B58A45]" />
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.24em] text-[#075E5A]">
                      Estd. 2001 · Handloom Lineage
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Editorial Copy */}
            <div className="lg:col-span-5 text-left space-y-4 sm:space-y-5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-[1.5px] bg-[#B58A45]" />
                <span className="font-sans text-[10px] sm:text-xs font-semibold tracking-[0.26em] uppercase text-[#B58A45]">
                  TIMELESS DEVOTION
                </span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl lg:text-[38px] font-normal leading-tight text-[#241A15] tracking-wide uppercase">
                Crafted Through
                <br />
                <span className="font-light italic text-[#B58A45] lowercase font-serif">generations</span>
              </h2>

              <p className="font-sans text-xs sm:text-[14px] leading-relaxed text-[#3A2115]/80">
                To weave a single heirloom saree requires weeks — sometimes months — of focused devotion. In the homes of master weavers, the craft is an oral and tactile history passed quietly from father to son, mother to daughter.
              </p>

              <p className="font-sans text-xs sm:text-[14px] leading-relaxed text-[#3A2115]/80">
                The rhythm of the wooden shuttle, the metallic gleam of pure silver zari wound in silk, and the mathematical symmetry of sacred temple borders cannot be replicated by automated machines. Every slight variation is a signature of human touch, patience, and cultural pride.
              </p>

              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-xs font-sans font-semibold uppercase tracking-[0.2em] text-[#075E5A] hover:text-[#B58A45] transition-colors group"
                >
                  <span>EXPLORE OUR CURATED COLLECTIONS</span>
                  <span className="inline-block transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          4. THE ART OF WEAVING: Visual Storytelling Alternating Grid
         ========================================================= */}
      <section
        aria-label="The Art of Weaving"
        className="relative w-full bg-[#FFFBF5] py-16 sm:py-24 lg:py-28 overflow-hidden border-b border-[#B58A45]/20"
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-18">
            <div className="flex items-center justify-center gap-3 mb-2.5">
              <span className="w-8 sm:w-12 h-[1px] bg-[#B58A45]/40" />
              <span className="text-[10px] sm:text-xs font-sans font-semibold uppercase tracking-[0.28em] text-[#B58A45]">
                SACRED PROCESS
              </span>
              <span className="w-8 sm:w-12 h-[1px] bg-[#B58A45]/40" />
            </div>

            <h2 className="font-serif text-2xl sm:text-4xl lg:text-[42px] font-normal tracking-wide text-[#241A15] leading-[1.2] mb-3 uppercase">
              The Art of Weaving
            </h2>

            <div className="flex justify-center mb-3">
              <IndianOrnament size={20} className="text-[#B58A45]" />
            </div>

            <p className="font-sans text-xs sm:text-sm text-[#3A2115]/75 max-w-xl mx-auto">
              How raw mulberry filaments, pure silver zari, and ancient hand-manipulated jacquards coalesce into poetry.
            </p>
          </div>

          {/* Step 1: [IMAGE] on left, [TEXT] on right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center mb-16 sm:mb-24">
            <div className="lg:col-span-6">
              <div className="relative w-full h-[240px] xs:h-[280px] sm:h-[360px] lg:h-[400px] rounded-xl overflow-hidden border border-[#B58A45]/30 shadow-md">
                <Image
                  src="/images/categories/silk-sarees.jpg"
                  alt="Raw Mulberry Silk spinning and pit-loom setup"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 hover:scale-103"
                />
              </div>
            </div>

            <div className="lg:col-span-6 text-left space-y-3.5 sm:space-y-4">
              <span className="font-mono text-xs text-[#B58A45] tracking-widest uppercase font-semibold">
                PHASE I · YARN &amp; WARP HARMONY
              </span>
              <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl text-[#241A15] font-normal uppercase leading-snug">
                The Natural Mulberry Fiber
              </h3>
              <p className="font-sans text-xs sm:text-[14px] leading-relaxed text-[#3A2115]/80">
                Before a shuttle ever moves across the loom, thousands of individual silk filaments are painstakingly reeled, degummed, and washed. Master dye-masters then formulate bespoke herbal and mineral baths to achieve shades that will not fade over decades of joyous family gatherings.
              </p>
              <p className="font-sans text-xs sm:text-[14px] leading-relaxed text-[#3A2115]/80">
                Setting up the warp on a traditional pit-loom can take up to ten days, requiring mathematically precise counting of each strand to ensure tensile perfection.
              </p>
            </div>
          </div>

          {/* Step 2: [TEXT] on left, [IMAGE] on right (Desktop), Stacked naturally on Mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1 text-left space-y-3.5 sm:space-y-4">
              <span className="font-mono text-xs text-[#B58A45] tracking-widest uppercase font-semibold">
                PHASE II · PURE ZARI &amp; ARCHITECTURAL MOTIFS
              </span>
              <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl text-[#241A15] font-normal uppercase leading-snug">
                The Kadwa &amp; Korvai Techniques
              </h3>
              <p className="font-sans text-xs sm:text-[14px] leading-relaxed text-[#3A2115]/80">
                In classical Kanchipuram and Banaras weaving, the borders and pallu require separate shuttles handled concurrently. The ancient Korvai technique interlocks the heavy border with the body like woven puzzle teeth, allowing deep contrasting jewel tones to meet cleanly.
              </p>
              <p className="font-sans text-xs sm:text-[14px] leading-relaxed text-[#3A2115]/80">
                Kadwa zari motifs are individually engraved and knotted by hand — leaving no floating threads on the reverse side of the cloth — producing a drape that feels supple against the skin yet glimmers with regal weight.
              </p>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="relative w-full h-[240px] xs:h-[280px] sm:h-[360px] lg:h-[400px] rounded-xl overflow-hidden border border-[#B58A45]/30 shadow-md">
                <Image
                  src="/images/categories/kanchipuram-sarees.jpg"
                  alt="Intricate Temple border gold zari interlocking"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 hover:scale-103"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          5. CRAFTSMANSHIP VALUES: 4 Pillars of Excellence
         ========================================================= */}
      <section
        aria-label="Our Craftsmanship Values"
        className="relative w-full bg-[#FAF6F0] py-16 sm:py-24 lg:py-28 overflow-hidden border-b border-[#B58A45]/20"
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-18">
            <span className="text-[10px] sm:text-xs font-sans font-semibold uppercase tracking-[0.28em] text-[#B58A45] block mb-2">
              PILLARS OF NEKARA
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl lg:text-[40px] font-normal tracking-wide text-[#241A15] uppercase">
              Craftsmanship Values
            </h2>
            <div className="flex justify-center mt-3 mb-2">
              <IndianOrnament size={18} className="text-[#B58A45]" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {CRAFT_VALUES.map((val) => (
              <div
                key={val.number}
                className="bg-[#FFFBF5] border border-[#B58A45]/25 p-6 sm:p-7 rounded-xs shadow-xs hover:border-[#B58A45]/60 hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <span className="font-mono text-xs text-[#B58A45] tracking-widest font-semibold block mb-3 group-hover:text-[#075E5A] transition-colors">
                    {val.number}
                  </span>
                  <h3 className="font-serif text-lg font-medium tracking-[0.12em] text-[#241A15] uppercase mb-2.5">
                    {val.title}
                  </h3>
                  <div className="w-8 h-[1px] bg-[#B58A45]/40 mb-3" />
                  <p className="font-sans text-xs sm:text-[13px] leading-relaxed text-[#3A2115]/75">
                    {val.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          6. REGIONAL HERITAGE: "FROM INDIA'S LOOMS"
         ========================================================= */}
      <section
        aria-label="Regional Heritage - From India's Looms"
        className="relative w-full bg-[#FFFBF5] py-16 sm:py-24 lg:py-28 overflow-hidden border-b border-[#B58A45]/20"
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14 pb-5 border-b border-[#B58A45]/25">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-5 h-[1px] bg-[#B58A45]" />
                <span className="font-sans text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-[#B58A45]">
                  WEAVING GEOGRAPHIES
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-[36px] font-normal tracking-wide text-[#241A15] uppercase">
                From India&apos;s Looms
              </h2>
            </div>

            <Link
              href="/shop"
              className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium tracking-wider text-[#B58A45] hover:text-[#075E5A] transition-colors shrink-0 min-h-[44px]"
            >
              <span>Explore All Looms</span>
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Regional Cards Grid: 4 columns on desktop, 2-col on tablet/mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {REGIONAL_TRADITIONS.map((reg) => (
              <div
                key={reg.id}
                className="group flex flex-col bg-[#FAF6F0] border border-[#B58A45]/25 rounded-xs overflow-hidden shadow-xs hover:border-[#B58A45] hover:shadow-lg transition-all duration-300"
              >
                <Link href={reg.href} className="flex flex-col h-full focus-visible:outline-none">
                  {/* Card Image */}
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#FAF3E7]">
                    <Image
                      src={reg.image}
                      alt={reg.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-600 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-[#FAF6F0]">
                    <div>
                      <span className="font-sans text-[9px] font-semibold tracking-[0.22em] uppercase text-[#B58A45] block mb-1">
                        {reg.region}
                      </span>
                      <h3 className="font-serif text-lg text-[#241A15] font-normal leading-snug group-hover:text-[#075E5A] transition-colors mb-2">
                        {reg.name}
                      </h3>
                      <p className="font-sans text-xs text-[#3A2115]/75 leading-relaxed line-clamp-3">
                        {reg.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-[#B58A45]/15 flex items-center justify-between">
                      <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.18em] text-[#B58A45] group-hover:text-[#075E5A] flex items-center gap-1">
                        <span>VIEW SAREES</span>
                        <span aria-hidden="true">→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          7. BRAND PHILOSOPHY: Powerful Dark Green Manifesto (#02221D)
         ========================================================= */}
      <section
        aria-label="Brand Philosophy"
        className="relative w-full bg-[#02221D] text-[#FAF5ED] py-20 sm:py-28 overflow-hidden text-center border-y border-[#B58A45]/30"
      >
        {/* Subtle Background Watermark */}
        <div className="absolute -top-16 -right-16 w-80 h-80 pointer-events-none opacity-[0.08] select-none z-0">
          <div className="relative w-full h-full">
            <Image
              src="/images/brand/brand1.png"
              alt=""
              fill
              sizes="320px"
              className="object-contain"
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-4">
            <IndianOrnament size={24} className="text-[#B58A45]" />
          </div>

          <span className="font-sans text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase text-[#B58A45] block mb-3">
            PHILOSOPHY &amp; ETHOS
          </span>

          <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-[54px] font-light leading-[1.18] sm:leading-[1.14] tracking-wide text-[#FAF5ED] mb-6 uppercase">
            Beauty That Belongs
            <br />
            <span className="font-normal italic text-[#D4AF37] lowercase font-serif">to</span> Generations
          </h2>

          <p className="font-serif text-sm sm:text-lg md:text-xl text-[#EFE2D0]/90 italic font-light max-w-2xl mx-auto mb-6 leading-relaxed">
            &ldquo;A saree is never merely six yards of silk. It is an heirloom of memory, a chronicle of patience, and an enduring celebration of India&apos;s cultural pride.&rdquo;
          </p>

          <p className="font-sans text-xs sm:text-[14px] text-[#EFE2D0]/70 max-w-xl mx-auto leading-relaxed">
            We measure our success not in fleeting seasonal trends, but in the weddings blessed, ceremonies dignified, and ancestral weaving traditions sustained for the next century.
          </p>
        </div>
      </section>

      {/* =========================================================
          8. EDITORIAL IMAGE COLLAGE: Fashion Magazine Layout
         ========================================================= */}
      <section
        aria-label="Editorial Collage"
        className="relative w-full bg-[#FAF6F0] py-16 sm:py-24 lg:py-28 overflow-hidden border-b border-[#B58A45]/20"
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <span className="text-[10px] sm:text-xs font-sans font-semibold uppercase tracking-[0.28em] text-[#B58A45] block mb-1.5">
              THE NEKARA ARCHIVE
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-[36px] font-normal tracking-wide text-[#241A15] uppercase">
              Echoes of Elegance
            </h2>
          </div>

          {/* Asymmetrical 3-image collage */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
            {/* Large Featured Image (7 cols) */}
            <div className="lg:col-span-7">
              <div className="relative w-full h-[280px] xs:h-[320px] sm:h-[420px] lg:h-[500px] rounded-2xl overflow-hidden border border-[#B58A45]/30 shadow-md">
                <Image
                  src="/images/categories/silk-sarees.jpg"
                  alt="Pure woven silk drape detail"
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover object-center transition-transform duration-700 hover:scale-103"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-5 left-5 right-5 text-left text-[#FAF5ED]">
                  <span className="text-[10px] tracking-[0.25em] text-[#D4AF37] font-sans uppercase font-semibold block mb-1">
                    TIMELESS DRAPES
                  </span>
                  <p className="font-serif text-lg sm:text-xl font-normal leading-snug">
                    Pure handspun silk infused with certified gold zari.
                  </p>
                </div>
              </div>
            </div>

            {/* Two Smaller Images (5 cols) */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
              <div className="relative w-full h-[180px] xs:h-[200px] sm:h-[240px] lg:h-[238px] rounded-2xl overflow-hidden border border-[#B58A45]/25 shadow-sm">
                <Image
                  src="/images/categories/designer-sarees.jpg"
                  alt="Contemporary occasion drape"
                  fill
                  sizes="(max-width: 640px) 100vw, 40vw"
                  className="object-cover object-center transition-transform duration-700 hover:scale-104"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 text-left">
                  <span className="text-[9px] tracking-widest text-[#D4AF37] uppercase font-sans font-semibold">
                    CONTEMPORARY SILHOUETTES
                  </span>
                </div>
              </div>

              <div className="relative w-full h-[180px] xs:h-[200px] sm:h-[240px] lg:h-[238px] rounded-2xl overflow-hidden border border-[#B58A45]/25 shadow-sm">
                <Image
                  src="/images/hero/slide 1.png"
                  alt="Bridal heirloom saree creation"
                  fill
                  sizes="(max-width: 640px) 100vw, 40vw"
                  className="object-cover object-[70%_center] transition-transform duration-700 hover:scale-104"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 text-left">
                  <span className="text-[9px] tracking-widest text-[#D4AF37] uppercase font-sans font-semibold">
                    THE BRIDAL HEIRLOOM
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          9. OUR PROMISE: Spacious 4-Statement Section
         ========================================================= */}
      <section
        aria-label="Our Promise"
        className="relative w-full bg-[#FFFBF5] py-16 sm:py-24 lg:py-28 overflow-hidden border-b border-[#B58A45]/20"
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-18">
            <span className="text-[10px] sm:text-xs font-sans font-semibold uppercase tracking-[0.28em] text-[#B58A45] block mb-2">
              UNCOMPROMISED COMMITMENT
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl lg:text-[40px] font-normal tracking-wide text-[#241A15] uppercase">
              Our Promise
            </h2>
            <div className="flex justify-center mt-3 mb-2">
              <IndianOrnament size={18} className="text-[#B58A45]" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {PROMISES.map((item) => (
              <div key={item.title} className="text-center sm:text-left space-y-2">
                <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#241A15] uppercase tracking-wide">
                  {item.title}
                </h3>
                <span className="text-[10px] sm:text-[11px] font-sans text-[#B58A45] uppercase tracking-[0.22em] font-semibold block">
                  {item.subtitle}
                </span>
                <p className="font-sans text-xs sm:text-[13px] leading-relaxed text-[#3A2115]/75 pt-1">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          10. FINAL CALL TO ACTION: "DISCOVER THE ART BEHIND EVERY WEAVE"
         ========================================================= */}
      <section
        aria-label="Discover the Art Behind Every Weave"
        className="relative w-full bg-[#02221D] py-16 sm:py-24 overflow-hidden text-center text-[#FAF5ED]"
      >
        {/* Corner Watermarks */}
        <div className="absolute -top-16 -left-16 w-64 h-64 sm:w-80 sm:h-80 pointer-events-none opacity-10 select-none z-0">
          <div className="relative w-full h-full">
            <Image
              src="/images/brand/brand1.png"
              alt=""
              fill
              sizes="320px"
              className="object-contain -scale-x-100"
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="absolute -bottom-16 -right-16 w-64 h-64 sm:w-80 sm:h-80 pointer-events-none opacity-10 select-none z-0">
          <div className="relative w-full h-full">
            <Image
              src="/images/brand/brand1.png"
              alt=""
              fill
              sizes="320px"
              className="object-contain"
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-3">
            <IndianOrnament size={22} className="text-[#B58A45]" />
          </div>

          <span className="block font-sans text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase text-[#B58A45] mb-3">
            HERITAGE IN MOTION
          </span>

          <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-light leading-[1.18] sm:leading-[1.14] tracking-wide text-[#FAF5ED] mb-4 sm:mb-6 uppercase">
            Discover the Art
            <br />
            Behind Every Weave
          </h2>

          <p className="font-serif text-sm sm:text-base md:text-lg text-[#EFE2D0]/85 italic font-light max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
            Explore the craftsmanship, textures and traditions that make every NEKARA saree special.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-5">
            <Link
              href="/craftsmanship"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xs bg-[#C89B3C] hover:bg-[#B58A45] text-[#241A15] font-sans font-semibold text-xs tracking-[0.2em] uppercase transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 min-h-[46px]"
            >
              <span>EXPLORE CRAFTSMANSHIP</span>
              <span aria-hidden="true">→</span>
            </Link>

            <Link
              href="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xs bg-transparent hover:bg-[#FAF5ED]/10 text-[#FAF5ED] border border-[#B58A45]/60 hover:border-[#B58A45] font-sans font-semibold text-xs tracking-[0.2em] uppercase transition-all duration-300 min-h-[46px]"
            >
              <span>SHOP SAREES</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
