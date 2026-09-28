"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface HeroSlide {
  id: number;
  image: string;
  alt: string;
  subtitle: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  // Specific mobile focus position to keep woman/peacock/saree uncropped
  mobileObjectPosition: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    image: "/images/hero/slide 1.png",
    alt: "NEKARA Indian Heritage in Every Thread - Luxury Bridal Silk Sarees",
    subtitle: "THE HEIRLOOM EDITION",
    title: "HERITAGE\nIN EVERY THREAD",
    description: "Timeless Sarees. Modern Elegance.",
    ctaText: "VIEW COLLECTION →",
    ctaLink: "/collections",
    mobileObjectPosition: "object-[75%_center] sm:object-[72%_center] md:object-center",
  },
  {
    id: 2,
    image: "/images/hero/slide 2.png",
    alt: "NEKARA Royal Festive Handloom Weaves Collection",
    subtitle: "ROYAL FESTIVE WEAVES",
    title: "WOVEN WITH\nTIMELESS MAJESTY",
    description: "Centuries of Craftsmanship in Pure Silk.",
    ctaText: "VIEW COLLECTION →",
    ctaLink: "/shop?category=silk-sarees",
    mobileObjectPosition: "object-[68%_center] sm:object-[64%_center] md:object-center",
  },
  {
    id: 3,
    image: "/images/hero/slide 3.png",
    alt: "NEKARA Banarasi & Kanjeevaram Heirloom Creations",
    subtitle: "ARTISANAL MASTERPIECES",
    title: "ELEGANCE IN\nEVERY WEAVE",
    description: "Handcrafted by Master Artisans Across India.",
    ctaText: "VIEW COLLECTION →",
    ctaLink: "/collections",
    mobileObjectPosition: "object-[80%_center] sm:object-[76%_center] md:object-center",
  },
];

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  // Subtle auto-advance every 7 seconds
  useEffect(() => {
    const timer = setInterval(nextSlide, 7000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section
      aria-label="NEKARA Featured Hero Slider"
      className="relative w-full h-[54vh] min-h-[420px] max-h-[500px] sm:h-[70vh] sm:min-h-[520px] md:h-[84vh] md:min-h-[600px] lg:h-[88vh] lg:min-h-[660px] md:max-h-[880px] overflow-hidden bg-[#123F38]"
    >
      {/* Slides Background Images */}
      {HERO_SLIDES.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out",
            index === currentSlide ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
          )}
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            sizes="100vw"
            priority={index === 0}
            unoptimized
            className={cn(
              "object-cover transition-all duration-700",
              slide.mobileObjectPosition
            )}
          />

          {/* Vignette & Contrast Overlays:
              Mobile: Stronger bottom-to-top gradient so woman & peacock stay clear on top while text is 100% readable below
              Desktop: Left-to-right gradient for cinematic side-by-side presentation */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 via-50% to-transparent md:bg-gradient-to-r md:from-black/65 md:via-black/30 md:to-transparent pointer-events-none" />
          <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30 pointer-events-none" />
        </div>
      ))}

      {/* Hero Content Area */}
      <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-6 sm:pb-12 md:pb-18 lg:pb-24 pt-16 sm:pt-20">
        <div className="max-w-xl text-left space-y-2.5 sm:space-y-4">
          {/* Subtitle / Brand Edition Tag */}
          <div className="flex items-center gap-2">
            <span className="w-5 sm:w-6 h-[1px] bg-[#B58A45]" />
            <span className="font-sans text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.3em] uppercase text-[#EFE2D0] font-semibold drop-shadow-md">
              {HERO_SLIDES[currentSlide].subtitle}
            </span>
          </div>

          {/* Hero Main Heading */}
          <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-[#FAF5ED] leading-[1.15] sm:leading-[1.1] tracking-wide whitespace-pre-line drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
            {HERO_SLIDES[currentSlide].title}
          </h1>

          {/* Description */}
          <p className="font-serif text-xs sm:text-base md:text-lg lg:text-xl text-[#F7F0E4]/90 tracking-wide drop-shadow-md italic">
            {HERO_SLIDES[currentSlide].description}
          </p>

          {/* CTA Button */}
          <div className="pt-1.5 sm:pt-3">
            <Link
              href={HERO_SLIDES[currentSlide].ctaLink}
              className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-7 sm:py-3 rounded-sm bg-[#C89B3C] hover:bg-[#B58A45] text-[#241A15] font-sans font-semibold text-[11px] sm:text-xs tracking-[0.16em] sm:tracking-[0.2em] uppercase transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <span>{HERO_SLIDES[currentSlide].ctaText}</span>
            </Link>
          </div>
        </div>

        {/* Slide Numbers & Arrow Controls (responsive spacing & alignment) */}
        <div className="mt-5 sm:mt-8 flex items-center justify-between sm:justify-start gap-4 sm:gap-6 pt-1">
          {/* Numbers: 01 02 03 */}
          <div className="flex items-center space-x-3 sm:space-x-4 text-[11px] sm:text-xs font-mono tracking-widest text-[#FAF5ED]/80">
            {HERO_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={cn(
                  "relative py-1 transition-all min-h-[36px] flex items-center",
                  idx === currentSlide
                    ? "text-[#FAF5ED] font-bold"
                    : "text-[#FAF5ED]/50 hover:text-[#FAF5ED]/80"
                )}
                aria-label={`Go to slide ${idx + 1}`}
              >
                <span>{`0${idx + 1}`}</span>
                {idx === currentSlide && (
                  <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#B58A45]" />
                )}
              </button>
            ))}
          </div>

          {/* Prev / Next Arrows */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={prevSlide}
              className="w-8 h-8 rounded-full border border-[#FAF5ED]/40 flex items-center justify-center text-[#FAF5ED] hover:border-[#B58A45] hover:text-[#B58A45] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B58A45]"
              aria-label="Previous slide"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={nextSlide}
              className="w-8 h-8 rounded-full border border-[#FAF5ED]/40 flex items-center justify-center text-[#FAF5ED] hover:border-[#B58A45] hover:text-[#B58A45] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B58A45]"
              aria-label="Next slide"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
