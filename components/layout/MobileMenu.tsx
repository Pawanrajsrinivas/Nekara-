"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MOBILE_PRIMARY_NAV_ITEMS, MOBILE_SECONDARY_NAV_ITEMS } from "@/data/navigation";
import { CloseIcon, ChevronDownIcon, WishlistIcon, CartIcon, AccountIcon, OrdersIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const { user, profile, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const { wishlistCount } = useWishlist();

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

      {/* Slide-in navigation drawer: compact vertical layout using 100dvh and controlled internal scrolling */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
        className={cn(
          "fixed top-0 right-0 h-[100dvh] max-h-[100dvh] z-50 w-[85vw] max-w-[340px] sm:max-w-[360px] bg-[#02221D] text-[#FAF5ED] shadow-2xl flex flex-col justify-between transition-transform duration-350 ease-out border-l border-[#B58A45]/30 overflow-y-auto overflow-x-hidden",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Subtle Decorative Brand Floral / Peacock Artwork in Bottom-Right Corner */}
        <div className="absolute -bottom-8 -right-8 w-56 h-56 pointer-events-none opacity-15 select-none z-0">
          <div className="relative w-full h-full">
            <Image
              src="/images/brand/brand1.png"
              alt=""
              fill
              sizes="224px"
              className="object-contain"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Top & Navigation Content Container */}
        <div className="relative z-10 flex flex-col">
          {/* Compact Top Header */}
          <div className="flex items-center justify-between px-4.5 pt-3.5 pb-2.5 border-b border-[#B58A45]/20 bg-[#02221D]/95 backdrop-blur-xs">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 shrink-0 p-0.5 rounded-full ring-1 ring-[#B58A45]/40 bg-[#011C18]/80 overflow-hidden shadow-sm">
                <Image
                  src="/images/brand/brand1.png"
                  alt="NEKARA Official Brand Logo"
                  fill
                  sizes="36px"
                  className="object-contain drop-shadow-md"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-[15px] tracking-[0.22em] font-semibold text-[#FAF5ED] uppercase leading-tight">
                  NEKARA
                </span>
                <span className="text-[8px] tracking-[0.26em] text-[#B58A45] uppercase font-sans font-medium">
                  Sarees &amp; Textiles
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 -mr-1 text-[#FAF5ED] hover:text-[#D4AF37] transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A45] min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close navigation menu"
            >
              <CloseIcon size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* Compact Primary Navigation Links */}
          <nav className="px-5 py-2.5" aria-label="Mobile Primary Menu">
            <ul className="flex flex-col">
              {MOBILE_PRIMARY_NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center justify-between py-1.5 text-[13px] sm:text-[14px] font-medium uppercase tracking-[0.16em] transition-colors group min-h-[44px]",
                        isActive ? "text-[#D4AF37] font-semibold" : "text-[#FAF5ED] hover:text-[#D4AF37]"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span className="relative">
                        {item.label}
                        <span
                          className={cn(
                            "absolute -bottom-0.5 left-0 h-[1.5px] bg-[#B58A45] transition-all duration-300",
                            isActive ? "w-full" : "w-0 group-hover:w-full"
                          )}
                        />
                      </span>
                      {item.hasDropdown && (
                        <ChevronDownIcon
                          size={13}
                          className={cn(
                            "transition-transform -rotate-90",
                            isActive ? "text-[#D4AF37]" : "text-[#FAF5ED]/50 group-hover:text-[#D4AF37]"
                          )}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Compact Ornamental Divider */}
          <div className="px-5 my-1.5">
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-[#B58A45]/30" />
              <div className="absolute px-2.5 bg-[#02221D]">
                <div className="w-1.5 h-1.5 rotate-45 bg-[#B58A45]" />
              </div>
            </div>
          </div>

          {/* Compact Client Suite Navigation */}
          <div className="px-5 py-2" aria-label="Account and Quick Access">
            <span className="block text-[9px] font-semibold uppercase tracking-[0.25em] text-[#B58A45] mb-2">
              Client Suite
            </span>

            {/* User Profile / Sign In Status */}
            {isAuthenticated ? (
              <div className="flex items-center justify-between p-2 mb-2 bg-[#011C18]/90 border border-[#B58A45]/30 rounded-lg">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-[#B58A45]/20 border border-[#B58A45]/40 flex items-center justify-center text-[#B58A45] font-serif text-xs font-semibold overflow-hidden shrink-0">
                    {user?.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt=""
                        width={28}
                        height={28}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      (profile?.displayName || user?.email || "U").slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-[#FAF5ED] truncate leading-tight">
                      {profile?.displayName || user?.email?.split("@")[0]}
                    </p>
                    <p className="text-[8px] text-[#B58A45] tracking-wider uppercase leading-tight mt-0.5">
                      Patron of Handloom
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="text-[10px] text-[#FAF5ED]/60 hover:text-[#D4AF37] uppercase tracking-wider pl-2 min-h-[32px] flex items-center"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full py-2 px-3 mb-2 bg-[#B58A45]/15 hover:bg-[#B58A45]/25 border border-[#B58A45]/35 rounded-lg text-[10px] uppercase font-medium tracking-[0.18em] text-[#FAF5ED] transition-colors min-h-[40px]"
              >
                <AccountIcon size={13} className="text-[#B58A45]" />
                <span>Sign In / Register</span>
              </Link>
            )}

            <ul className="flex flex-col space-y-0.5">
              {MOBILE_SECONDARY_NAV_ITEMS.map((item) => {
                const getTargetHref = () => {
                  if (item.label === "Cart") {
                    return isAuthenticated ? "/cart" : "/login?redirect=/cart";
                  }
                  if (item.label === "Wishlist") {
                    return isAuthenticated ? "/wishlist" : "/login?redirect=/wishlist";
                  }
                  if (item.label === "My Account" || item.label === "My Orders") {
                    return isAuthenticated ? item.href : `/login?redirect=${encodeURIComponent(item.href)}`;
                  }
                  return item.href;
                };

                const getIcon = () => {
                  switch (item.label) {
                    case "Wishlist":
                      return <WishlistIcon size={15} strokeWidth={1.4} className="text-[#B58A45]" />;
                    case "My Orders":
                      return <OrdersIcon size={15} strokeWidth={1.4} className="text-[#B58A45]" />;
                    case "Cart":
                      return <CartIcon size={15} strokeWidth={1.4} className="text-[#B58A45]" />;
                    case "My Account":
                      return <AccountIcon size={15} strokeWidth={1.4} className="text-[#B58A45]" />;
                    default:
                      return <span className="w-3.5 h-3.5 rounded-full border border-[#B58A45]/40 inline-block" />;
                  }
                };

                return (
                  <li key={item.label}>
                    <Link
                      href={getTargetHref()}
                      onClick={onClose}
                      className="flex items-center justify-between py-1 text-[12px] sm:text-[13px] text-[#FAF5ED]/80 hover:text-[#D4AF37] transition-colors min-h-[38px] sm:min-h-[40px]"
                    >
                      <div className="flex items-center gap-2.5">
                        {getIcon()}
                        <span className="tracking-wide">{item.label}</span>
                      </div>
                      {item.label === "Cart" && isAuthenticated && totalItems > 0 && (
                        <span className="min-w-[17px] h-[17px] px-1 bg-[#851E2C] text-[#FAF5ED] text-[9px] font-bold rounded-full flex items-center justify-center border border-[#FAF5ED]/40">
                          {totalItems > 99 ? "99+" : totalItems}
                        </span>
                      )}
                      {item.label === "Wishlist" && isAuthenticated && wishlistCount > 0 && (
                        <span className="min-w-[17px] h-[17px] px-1 bg-[#B58A45] text-[#FAF5ED] text-[9px] font-bold rounded-full flex items-center justify-center border border-[#FAF5ED]/40">
                          {wishlistCount > 99 ? "99+" : wishlistCount}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Compact Drawer Footer / Heritage Note */}
        <div className="relative z-10 px-5 py-3 bg-[#011713]/90 border-t border-[#B58A45]/20 mt-auto">
          <p className="text-[10px] text-[#FAF5ED]/75 font-sans tracking-wide">
            Estd. 2001 · Handloom Heritage of India
          </p>
          <p className="text-[9px] text-[#B58A45] tracking-wider uppercase mt-0.5">
            Bengaluru · Varanasi · Kanchipuram
          </p>
        </div>
      </div>
    </div>
  );
}
