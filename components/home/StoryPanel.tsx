import React from "react";
import Link from "next/link";
import Image from "next/image";
import { IndianOrnament } from "@/components/ui/IndianOrnament";
import { cn } from "@/lib/utils";

interface StoryPanelProps {
  className?: string;
}

export function StoryPanel({ className }: StoryPanelProps) {
  return (
    <aside
      aria-label="NEKARA Brand Heritage Story"
      className={cn(
        "relative flex flex-col justify-between p-6 sm:p-7 lg:p-8 bg-[#FAF3E7] border border-[#B58A45]/35 rounded-xs overflow-hidden shadow-[0_4px_16px_rgba(58,33,21,0.04)]",
        className
      )}
    >
      {/* Subtle Background Indian Motif Watermark */}
      <div className="absolute -bottom-8 -right-8 w-48 h-48 sm:w-56 sm:h-56 pointer-events-none opacity-10 select-none z-0">
        <div className="relative w-full h-full">
          <Image
            src="/images/brand/tab%20logo.png"
            alt=""
            fill
            sizes="224px"
            className="object-contain"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Decorative Top Accent Corner */}
      <div className="relative z-10 flex items-center justify-between mb-4 sm:mb-6">
        <IndianOrnament size={20} className="text-[#B58A45]" />
        <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.25em] text-[#B58A45]">
          Estd. 2001
        </span>
      </div>

      {/* Main Story Content */}
      <div className="relative z-10 space-y-3.5 sm:space-y-4 my-auto">
        <h3 className="font-serif text-2xl sm:text-3xl lg:text-[28px] font-normal text-[#241A15] leading-[1.18] tracking-wide uppercase">
          A STORY
          <br />
          WOVEN IN
          <br />
          <span className="text-[#B58A45] font-medium">TRADITION</span>
        </h3>

        <div className="w-10 h-[1.5px] bg-[#B58A45]/50 my-2" />

        <p className="font-sans text-[12px] sm:text-[13px] leading-relaxed text-[#3A2115]/80">
          For over two decades, NEKARA has been bringing you the finest sarees, blending traditional craftsmanship with contemporary elegance.
        </p>
      </div>

      {/* CTA Button */}
      <div className="relative z-10 mt-6 sm:mt-8 pt-4 border-t border-[#B58A45]/20">
        <Link
          href="/about"
          className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xs bg-[#C89B3C] hover:bg-[#B58A45] text-[#241A15] font-sans font-semibold text-[11px] sm:text-xs tracking-[0.18em] uppercase transition-all duration-300 shadow-sm hover:shadow-md min-h-[44px]"
        >
          <span>OUR STORY</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </aside>
  );
}
