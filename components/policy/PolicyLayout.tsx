import React from "react";
import Link from "next/link";
import { IndianOrnament } from "@/components/ui/IndianOrnament";

interface PolicyLayoutProps {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  intro?: string;
  currentPath: "/shipping" | "/returns" | "/terms" | "/privacy";
  children: React.ReactNode;
}

const POLICY_LINKS = [
  { href: "/shipping", label: "Shipping & Delivery" },
  { href: "/returns", label: "Return, Exchange & Refund" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/privacy", label: "Privacy Policy" },
];

export function PolicyLayout({
  title,
  subtitle = "Legal & Customer Policies",
  lastUpdated = "October 2026",
  intro,
  currentPath,
  children,
}: PolicyLayoutProps) {
  return (
    <div className="w-full bg-[#F9F0EA] min-h-screen text-[#241A15] pt-24 sm:pt-28 pb-16 sm:pb-24">
      {/* Restrained Hero Header */}
      <section className="relative w-full border-b border-[#B58A45]/20 bg-[#FAF5ED]/80 py-10 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-6 h-[1px] bg-[#B58A45]" />
            <span className="text-[10px] sm:text-xs font-sans font-semibold uppercase tracking-[0.25em] text-[#B58A45]">
              {subtitle}
            </span>
            <span className="w-6 h-[1px] bg-[#B58A45]" />
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl lg:text-[42px] font-normal tracking-wide text-[#02221D] leading-tight mb-4">
            {title}
          </h1>

          <div className="flex justify-center mb-4">
            <IndianOrnament size={20} className="text-[#B58A45]" />
          </div>

          {intro && (
            <p className="font-serif text-sm sm:text-base text-[#3A2115]/80 max-w-2xl mx-auto leading-relaxed italic">
              {intro}
            </p>
          )}

          <div className="mt-4 pt-3 border-t border-[#B58A45]/15 inline-flex items-center gap-2 text-xs text-[#3A2115]/60 font-sans">
            <span>Last updated:</span>
            <span className="font-medium text-[#02221D]">{lastUpdated}</span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {/* Policy Navigation Bar */}
        <nav
          aria-label="Related Policies"
          className="mb-8 sm:mb-12 pb-4 border-b border-[#B58A45]/20 flex items-center gap-2 sm:gap-4 overflow-x-auto [scrollbar-width:none]"
        >
          {POLICY_LINKS.map((link) => {
            const isCurrent = currentPath === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-sans uppercase tracking-wider py-1.5 px-3 rounded-xs whitespace-nowrap transition-colors shrink-0 ${
                  isCurrent
                    ? "bg-[#02221D] text-[#FAF5ED] font-semibold shadow-xs"
                    : "text-[#3A2115]/70 hover:text-[#075E5A] hover:bg-[#FAF5ED]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Content Column */}
        <article className="prose prose-stone max-w-none space-y-8 sm:space-y-10 leading-relaxed text-[#241A15]">
          {children}
        </article>

        {/* Footer Actions / Return to Shopping */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-[#B58A45]/25 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xs bg-[#02221D] hover:bg-[#075E5A] text-[#FAF5ED] text-xs font-semibold uppercase tracking-[0.18em] transition-colors shadow-sm min-h-[44px]"
          >
            <span>← Return to Shopping</span>
          </Link>

          <p className="text-xs text-[#3A2115]/70 font-sans text-center sm:text-right">
            Have questions? Reach us via our official support channels below.
          </p>
        </div>
      </main>
    </div>
  );
}
