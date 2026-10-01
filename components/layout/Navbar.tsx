"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { MAIN_NAV_ITEMS } from "@/data/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import {
  SearchIcon,
  WishlistIcon,
  AccountIcon,
  CartIcon,
  MenuIcon,
  ChevronDownIcon,
  OrdersIcon,
} from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  const { user, profile, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const { wishlistCount } = useWishlist();
  const avatarUrl = profile?.photoURL || user?.photoURL;

  // An opaque cream navbar is used when scrolled OR when on interior pages like /shop
  const isOpaque = isScrolled || !isHomePage;

  // Monitor scroll position with high performance passive listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 24) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 w-full transition-all duration-350 ease-out",
          isOpaque
            ? "bg-[#FAF5ED]/95 backdrop-blur-md border-b border-[#3A2115]/10 shadow-[0_4px_24px_-4px_rgba(58,33,21,0.08)] py-2.5 sm:py-3.5"
            : "bg-gradient-to-b from-black/55 via-black/25 to-transparent py-3 sm:py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* =========================================
                BRAND LOGO (Left-aligned on both mobile & desktop)
               ========================================= */}
            <div className="flex items-center">
              <Logo />
            </div>

            {/* =========================================
                DESKTOP: CENTER (Primary Navigation Links)
               ========================================= */}
            <nav
              className="hidden md:flex items-center space-x-7 lg:space-x-9"
              aria-label="Main Navigation"
            >
              {MAIN_NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <div key={item.label} className="relative group">
                    <Link
                      href={item.href}
                      className={cn(
                        "relative inline-flex items-center gap-1 py-1 text-[13px] lg:text-[14px] uppercase tracking-[0.14em] font-medium transition-colors duration-300",
                        isActive
                          ? isOpaque
                            ? "text-[#075E5A] font-semibold"
                            : "text-[#D4AF37] font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                          : isOpaque
                          ? "text-[#241A15] hover:text-[#075E5A]"
                          : "text-[#FAF5ED] hover:text-[#D4AF37] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span>{item.label}</span>
                      {item.hasDropdown && (
                        <ChevronDownIcon
                          size={12}
                          className={cn(
                            "transition-transform duration-200 group-hover:rotate-180 opacity-70 group-hover:opacity-100",
                            isOpaque ? "text-[#241A15]" : "text-[#FAF5ED]"
                          )}
                        />
                      )}
                      {/* Animated Underline */}
                      <span
                        className={cn(
                          "absolute bottom-0 left-0 w-full h-[1.5px] transition-transform duration-300 origin-center",
                          isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                          isOpaque ? "bg-[#075E5A]" : "bg-[#D4AF37]"
                        )}
                      />
                    </Link>

                  {/* Future Dropdown Anchor Shell */}
                  {item.hasDropdown && item.subItems && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 ease-out transform group-hover:translate-y-0 translate-y-1">
                      <div className="min-w-[220px] rounded-sm bg-[#FAF5ED] text-[#241A15] shadow-xl border border-[#3A2115]/10 py-3 px-4">
                        <ul className="space-y-2">
                          {item.subItems.map((sub) => (
                            <li key={sub.label}>
                              <Link
                                href={sub.href}
                                className="block text-[13px] py-1 text-[#3A2115]/85 hover:text-[#075E5A] hover:translate-x-1 transition-all"
                              >
                                {sub.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )})}
            
            </nav>

            {/* =========================================
                RIGHT CONTROLS:
                Desktop: Search, Wishlist, Account, Cart
                Mobile: Wishlist, Cart, Menu Button
               ========================================= */}
            <div className="flex items-center space-x-1.5 sm:space-x-3 lg:space-x-5">
              {/* Search Button (Desktop only) */}
              <button
                type="button"
                className={cn(
                  "hidden sm:inline-flex p-1.5 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A45]",
                  isOpaque
                    ? "text-[#241A15] hover:text-[#075E5A]"
                    : "text-[#FAF5ED] hover:text-[#D4AF37] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                )}
                aria-label="Search collection"
              >
                <SearchIcon size={19} strokeWidth={1.5} />
              </button>

              {/* Wishlist Button (Tablet & Desktop) */}
              <Link
                href="/wishlist"
                className={cn(
                  "hidden sm:inline-flex relative p-1.5 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A45]",
                  isOpaque
                    ? "text-[#241A15] hover:text-[#075E5A]"
                    : "text-[#FAF5ED] hover:text-[#D4AF37] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                )}
                aria-label={`View wishlist with ${wishlistCount} items`}
              >
                <WishlistIcon size={19} strokeWidth={1.5} />
                {isAuthenticated && wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-[#B58A45] text-[#FAF5ED] text-[9px] font-bold rounded-full flex items-center justify-center border border-[#FAF5ED] shadow-sm animate-in fade-in zoom-in duration-200">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Account Button & Luxury Dropdown (Desktop only) */}
              <div
                className="relative hidden md:block"
                onMouseEnter={() => setAccountDropdownOpen(true)}
                onMouseLeave={() => setAccountDropdownOpen(false)}
              >
                <Link
                  href={isAuthenticated ? "/account" : "/login?redirect=/account"}
                  onClick={() => setAccountDropdownOpen(false)}
                  className={cn(
                    "inline-flex items-center justify-center p-1.5 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A45]",
                    isOpaque
                      ? "text-[#241A15] hover:text-[#075E5A]"
                      : "text-[#FAF5ED] hover:text-[#D4AF37] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                  )}
                  aria-label={isAuthenticated ? "Client account" : "Sign in to your account"}
                  title={isAuthenticated ? (profile?.displayName || user?.email || "Account") : "Sign In"}
                >
                  {isAuthenticated && avatarUrl ? (
                    <div className="w-5 h-5 rounded-full overflow-hidden border border-[#B58A45]/60 relative">
                      <Image
                        src={avatarUrl}
                        alt={profile?.displayName || "Account"}
                        width={20}
                        height={20}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <AccountIcon size={19} strokeWidth={1.5} />
                  )}
                </Link>

                {/* Desktop Account Dropdown Menu */}
                {isAuthenticated && accountDropdownOpen && (
                  <div className="absolute right-0 top-full pt-2 w-56 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="bg-[#FFFBF5] rounded-xs border border-[#B58A45]/30 shadow-[0_8px_30px_rgba(58,33,21,0.12)] p-2">
                      <div className="px-3 py-2 border-b border-[#B58A45]/20">
                        <p className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#B58A45]">
                          Client Portal
                        </p>
                        <p className="text-xs font-serif text-[#241A15] font-normal truncate mt-0.5">
                          {profile?.displayName || user?.displayName || user?.email?.split("@")[0] || "Valued Patron"}
                        </p>
                      </div>

                      <ul className="py-1 text-xs font-sans">
                        <li>
                          <Link
                            href="/account"
                            onClick={() => setAccountDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-[#241A15] hover:text-[#075E5A] hover:bg-[#FAF3E7] rounded-xs transition-colors"
                          >
                            <AccountIcon size={15} className="text-[#B58A45]" />
                            <span>My Account</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/orders"
                            onClick={() => setAccountDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-[#241A15] hover:text-[#075E5A] hover:bg-[#FAF3E7] rounded-xs transition-colors"
                          >
                            <OrdersIcon size={15} className="text-[#B58A45]" />
                            <span>My Orders</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/wishlist"
                            onClick={() => setAccountDropdownOpen(false)}
                            className="flex items-center justify-between px-3 py-2 text-[#241A15] hover:text-[#075E5A] hover:bg-[#FAF3E7] rounded-xs transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <WishlistIcon size={15} className="text-[#B58A45]" />
                              <span>Wishlist</span>
                            </div>
                            {wishlistCount > 0 && (
                              <span className="min-w-[18px] h-[18px] px-1 bg-[#FAF3E7] text-[#075E5A] border border-[#B58A45]/40 text-[10px] font-bold rounded-full flex items-center justify-center">
                                {wishlistCount}
                              </span>
                            )}
                          </Link>
                        </li>
                      </ul>

                      <div className="pt-1 border-t border-[#B58A45]/20">
                        <button
                          type="button"
                          onClick={async () => {
                            setAccountDropdownOpen(false);
                            await logout();
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-[#8B2626] hover:bg-[#FAF0F0] rounded-xs transition-colors font-medium tracking-wide uppercase text-[11px]"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Shopping Bag / Cart Button (Tablet & Desktop) */}
              <Link
                href={isAuthenticated ? "/cart" : "/login?redirect=/cart"}
                className={cn(
                  "hidden sm:inline-flex relative p-1.5 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A45]",
                  isOpaque
                    ? "text-[#241A15] hover:text-[#075E5A]"
                    : "text-[#FAF5ED] hover:text-[#D4AF37] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                )}
                aria-label={`Shopping bag with ${totalItems} items`}
              >
                <CartIcon size={19} strokeWidth={1.5} />
                {isAuthenticated && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#851E2C] text-[#FAF5ED] text-[10px] font-bold rounded-full flex items-center justify-center border border-[#FAF5ED] shadow-sm animate-in fade-in zoom-in duration-200">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
                <span className="sr-only">{totalItems} items in bag</span>
              </Link>

              {/* Mobile Cart Button (Mobile only) */}
              <Link
                href={isAuthenticated ? "/cart" : "/login?redirect=/cart"}
                className={cn(
                  "sm:hidden relative p-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A45] min-w-[40px] min-h-[40px] flex items-center justify-center",
                  isOpaque
                    ? "text-[#241A15] hover:text-[#075E5A]"
                    : "text-[#FAF5ED] hover:text-[#D4AF37] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                )}
                aria-label={`Shopping bag with ${totalItems} items`}
              >
                <CartIcon size={20} strokeWidth={1.75} />
                {isAuthenticated && totalItems > 0 && (
                  <span className="absolute top-1 -right-0.5 min-w-[17px] h-[17px] px-1 bg-[#851E2C] text-[#FAF5ED] text-[10px] font-bold rounded-full flex items-center justify-center border border-[#FAF5ED] shadow-sm">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Hamburger Button */}
              <div className="flex items-center md:hidden">
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(true)}
                  className={cn(
                    "p-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A45] min-w-[44px] min-h-[44px] flex items-center justify-center",
                    isOpaque
                      ? "text-[#241A15] hover:text-[#075E5A]"
                      : "text-[#FAF5ED] hover:text-[#D4AF37] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                  )}
                  aria-label="Open navigation menu"
                  aria-expanded={isMobileMenuOpen}
                >
                  <MenuIcon size={24} strokeWidth={1.75} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Dedicated Mobile Menu Drawer */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}
