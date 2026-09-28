"use client";

import React, { useState } from "react";
import { IndianOrnament } from "@/components/ui/IndianOrnament";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim() || !emailRegex.test(email)) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setStatus("success");
    setEmail("");
    setErrorMessage("");
  };

  return (
    <section
      aria-label="Join the NEKARA Circle"
      className="relative w-full bg-[#FAF6F0] py-16 sm:py-20 lg:py-24 border-t border-[#B58A45]/20 overflow-hidden text-center"
    >
      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6">
        {/* Subtle Medallion */}
        <div className="flex justify-center mb-3">
          <IndianOrnament size={20} className="text-[#B58A45]" />
        </div>

        {/* Eyebrow */}
        <span className="block font-sans text-[10px] sm:text-xs font-semibold tracking-[0.28em] uppercase text-[#B58A45] mb-2 sm:mb-3">
          PRIVILEGED ACCESS
        </span>

        {/* Heading */}
        <h2 className="font-serif text-2xl sm:text-3xl lg:text-[38px] font-normal text-[#241A15] tracking-wide mb-3 leading-tight uppercase">
          Stay in the NEKARA Circle
        </h2>

        {/* Supporting Copy */}
        <p className="font-sans text-xs sm:text-sm text-[#3A2115]/75 max-w-md mx-auto mb-8 sm:mb-9 leading-relaxed">
          Be the first to discover rare heirloom drapes, weaving stories from master artisan clusters, and private preview access.
        </p>

        {/* Newsletter Form */}
        {status === "success" ? (
          <div className="bg-[#FFFBF5] border border-[#B58A45]/40 rounded-xs p-5 shadow-xs transition-all">
            <span className="font-serif text-base sm:text-lg text-[#075E5A] font-medium block">
              Welcome to the NEKARA circle.
            </span>
            <span className="text-xs text-[#3A2115]/70 mt-1 block">
              You will receive our curated textile stories and private collection announcements.
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2.5 max-w-md mx-auto" noValidate>
            <div className="w-full relative">
              <label htmlFor="newsletter-email" className="sr-only">
                Your email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 rounded-xs bg-[#FFFBF5] border border-[#B58A45]/35 focus:border-[#075E5A] focus:outline-none focus:ring-1 focus:ring-[#075E5A] text-xs sm:text-sm text-[#241A15] placeholder:text-[#3A2115]/40 min-h-[44px] transition-colors"
                aria-required="true"
                aria-invalid={status === "error"}
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto shrink-0 px-6 py-3 rounded-xs bg-[#02221D] hover:bg-[#075E5A] text-[#FAF5ED] font-sans font-semibold text-xs tracking-[0.18em] uppercase transition-all duration-300 min-h-[44px] shadow-sm flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A45]"
            >
              <span>JOIN</span>
              <span aria-hidden="true">→</span>
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="mt-2 text-xs text-[#B23B3B] font-sans" role="alert">
            {errorMessage}
          </p>
        )}

        <p className="text-[10px] text-[#3A2115]/50 font-sans mt-4 tracking-wide">
          We honor your privacy. Unsubscribe seamlessly at any time.
        </p>
      </div>
    </section>
  );
}
