"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MOBILE_PRIMARY_NAV_ITEMS, MOBILE_SECONDARY_NAV_ITEMS } from "@/data/navigation";
import { CloseIcon, ChevronDownIcon, WishlistIcon, CartIcon, AccountIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  // Prevent body scrolling when the mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key press for accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 md:hidden transition-all duration-300",
        isOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"
      )}
    >
      {/* Dark backdrop with smooth fade */}
      <div
        className={cn(
          "fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in navigation drawer from right with required #02221D deep-green background */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
        className={cn(
          "fixed top-0 right-0 bottom-0 z-50 w-[85vw] max-w-[340px] sm:max-w-[360px] bg-[#02221D] text-[#FAF5ED] shadow-2xl flex flex-col justify-between transition-transform duration-350 ease-out border-l border-[#B58A45]/30 overflow-y-auto overflow-x-hidden",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Subtle Decorative Brand Floral / Peacock Artwork in Bottom-Right Corner */}
        <div className="absolute -bottom-10 -right-10 w-64 h-64 sm:w-72 sm:h-72 pointer-events-none opacity-20 select-none z-0">
          <div className="relative w-full h-full">
            <Image
              src="/images/brand/brand1.png"
              alt=""
              fill
              sizes="288px"
              className="object-contain"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Top Header of Drawer */}
        <div className="relative z-10">
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#B58A45]/20 bg-[#02221D]/90 backdrop-blur-xs">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 shrink-0 p-0.5 rounded-full ring-1 ring-[#B58A45]/40 bg-[#011C18]/80 overflow-hidden shadow-sm">
                <Image
                  src="/images/brand/brand1.png"
                  alt="NEKARA Official Brand Logo"
                  fill
                  sizes="44px"
                  className="object-contain drop-shadow-md"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-[17px] tracking-[0.22em] font-semibold text-[#FAF5ED] uppercase leading-tight">
                  NEKARA
                </span>
                <span className="text-[9px] tracking-[0.28em] text-[#B58A45] uppercase font-sans font-medium">
                  Sarees &amp; Textiles
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 -mr-2 text-[#FAF5ED] hover:text-[#D4AF37] transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A45] min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close navigation menu"
            >
              <CloseIcon size={22} strokeWidth={1.5} />
            </button>
          </div>

          {/* Primary Navigation Links */}
          <nav className="px-6 py-6" aria-label="Mobile Primary Menu">
            <ul className="flex flex-col space-y-1">
              {MOBILE_PRIMARY_NAV_ITEMS.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center justify-between py-3 text-[14px] sm:text-[15px] font-medium uppercase tracking-[0.16em] text-[#FAF5ED] hover:text-[#D4AF37] transition-colors group min-h-[44px]"
                  >
                    <span className="relative">
                      {item.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-[#B58A45] transition-all duration-300 group-hover:w-full" />
                    </span>
                    {item.hasDropdown && (
                      <ChevronDownIcon
                        size={14}
                        className="text-[#FAF5ED]/50 group-hover:text-[#D4AF37] -rotate-90 transition-transform"
                      />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Elegant Ornamental Divider */}
          <div className="px-6 my-2">
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-[#B58A45]/30" />
              <div className="absolute px-3 bg-[#02221D]">
                <div className="w-1.5 h-1.5 rotate-45 bg-[#B58A45]" />
              </div>
            </div>
          </div>

          {/* Secondary Client Navigation */}
          <div className="px-6 py-4" aria-label="Account and Quick Access">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B58A45] mb-3">
              Client Suite
            </span>
            <ul className="flex flex-col space-y-2">
              {MOBILE_SECONDARY_NAV_ITEMS.map((item) => {
                const getIcon = () => {
                  switch (item.label) {
                    case "Wishlist":
                      return <WishlistIcon size={16} strokeWidth={1.4} className="text-[#B58A45]" />;
                    case "Cart":
                      return <CartIcon size={16} strokeWidth={1.4} className="text-[#B58A45]" />;
                    case "My Account":
                      return <AccountIcon size={16} strokeWidth={1.4} className="text-[#B58A45]" />;
                    default:
                      return null;
                  }
                };

                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center gap-3 py-2 text-[13px] text-[#FAF5ED]/80 hover:text-[#D4AF37] transition-colors min-h-[40px]"
                    >
                      {getIcon()}
                      <span className="tracking-wide">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Drawer Footer / Brand Heritage Note */}
        <div className="relative z-10 px-6 py-5 bg-[#011713]/80 border-t border-[#B58A45]/20 mt-auto">
          <p className="text-[11px] text-[#FAF5ED]/75 font-sans tracking-wide">
            Estd. 2001 · Handloom Heritage of India
          </p>
          <p className="text-[10px] text-[#B58A45] tracking-wider uppercase mt-0.5">
            Bengaluru · Varanasi · Kanchipuram
          </p>
        </div>
      </div>
    </div>
  );
}
