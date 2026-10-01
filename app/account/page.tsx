"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { IndianOrnament } from "@/components/ui/IndianOrnament";
import { CartIcon } from "@/components/ui/Icons";

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const [avatarError, setAvatarError] = useState(false);

  // Protect private account page
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?redirect=/account");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSignOut = async () => {
    await logout();
    router.replace("/");
  };

  if (authLoading) {
    return (
      <div className="w-full min-h-screen pt-36 pb-20 flex items-center justify-center bg-[#FDFBF7]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#B58A45] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#3A2115]/60 font-sans tracking-widest uppercase">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Determine user avatar initials
  const displayName = profile?.displayName || user.displayName || user.email?.split("@")[0] || "Valued Client";
  const email = profile?.email || user.email || "";
  const photoURL = profile?.photoURL || user.photoURL;

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "N";

  return (
    <div className="w-full min-h-screen pt-28 sm:pt-36 pb-20 bg-[#FDFBF7]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* =========================================================
            HEADER BREADCRUMB & TITLE
           ========================================================= */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="w-8 h-[1px] bg-[#B58A45]/40" />
            <IndianOrnament size={20} className="text-[#B58A45]" />
            <span className="w-8 h-[1px] bg-[#B58A45]/40" />
          </div>

          <span className="text-[10px] sm:text-xs font-sans font-semibold tracking-[0.22em] uppercase text-[#B58A45] block mb-1">
            CLIENT PORTAL
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#241A15] font-normal tracking-wide">
            My Account
          </h1>
        </div>

        {/* =========================================================
            PROFILE OVERVIEW CARD
           ========================================================= */}
        <div className="bg-[#FFFBF5] rounded-xs border border-[#B58A45]/30 p-6 sm:p-8 shadow-[0_4px_24px_rgba(58,33,21,0.04)] mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b border-[#B58A45]/20 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
              {/* Avatar Photo or Monogram Circle */}
              <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden border-2 border-[#B58A45]/40 bg-[#FAF3E7] flex items-center justify-center shadow-sm shrink-0">
                {photoURL && !avatarError ? (
                  <Image
                    src={photoURL}
                    alt={displayName}
                    fill
                    sizes="88px"
                    className="object-cover"
                    unoptimized
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <span className="font-serif text-2xl sm:text-3xl text-[#075E5A] font-semibold">
                    {initials}
                  </span>
                )}
              </div>

              <div>
                <h2 className="font-serif text-xl sm:text-2xl text-[#241A15] font-normal">
                  Welcome, {displayName}
                </h2>
                <p className="text-xs sm:text-sm text-[#3A2115]/70 font-sans mt-0.5">
                  {email}
                </p>
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF3E7] border border-[#B58A45]/30 text-[10px] font-sans font-semibold tracking-wider text-[#075E5A] uppercase">
                  <span>★</span>
                  <span>NEKARA Patron</span>
                </div>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={handleSignOut}
              className="px-5 py-2.5 rounded-xs border border-[#8B2626]/40 hover:bg-[#FAF0F0] text-[#8B2626] font-sans font-medium text-xs tracking-wider uppercase transition-colors shrink-0 min-h-[44px] flex items-center justify-center"
            >
              Sign Out
            </button>
          </div>

          {/* Quick Access Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <Link
              href="/cart"
              className="p-4 rounded-xs bg-[#FAF6F0] border border-[#B58A45]/20 hover:border-[#B58A45]/60 hover:bg-[#FAF3E7] transition-all flex items-center justify-between group min-h-[44px]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#02221D] text-[#FAF5ED] flex items-center justify-center shrink-0">
                  <CartIcon size={18} strokeWidth={1.5} />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-[#241A15]">
                    Shopping Bag
                  </span>
                  <span className="text-[11px] text-[#3A2115]/60">
                    {totalItems} {totalItems === 1 ? "item" : "items"}
                  </span>
                </div>
              </div>
              <span className="text-[#B58A45] group-hover:translate-x-1 transition-transform" aria-hidden="true">
                →
              </span>
            </Link>

            <Link
              href="/shop"
              className="p-4 rounded-xs bg-[#FAF6F0] border border-[#B58A45]/20 hover:border-[#B58A45]/60 hover:bg-[#FAF3E7] transition-all flex items-center justify-between group min-h-[44px]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#C89B3C] text-[#241A15] flex items-center justify-center shrink-0 font-serif text-sm">
                  ❦
                </div>
                <div>
                  <span className="block text-xs font-semibold text-[#241A15]">
                    Explore Sarees
                  </span>
                  <span className="text-[11px] text-[#3A2115]/60">
                    Curated Collection
                  </span>
                </div>
              </div>
              <span className="text-[#B58A45] group-hover:translate-x-1 transition-transform" aria-hidden="true">
                →
              </span>
            </Link>

            <div className="p-4 rounded-xs bg-[#FAF6F0] border border-[#B58A45]/20 flex items-center justify-between min-h-[44px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#075E5A] text-[#FAF5ED] flex items-center justify-center shrink-0 text-sm">
                  🛡️
                </div>
                <div>
                  <span className="block text-xs font-semibold text-[#241A15]">
                    Silk Mark Guarantee
                  </span>
                  <span className="text-[11px] text-[#3A2115]/60">
                    100% Certified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            MY ORDERS SECTION
           ========================================================= */}
        <div className="bg-[#FFFBF5] rounded-xs border border-[#B58A45]/30 p-6 sm:p-8 shadow-[0_4px_24px_rgba(58,33,21,0.04)]">
          <div className="flex items-center justify-between pb-4 border-b border-[#B58A45]/20 mb-6">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl text-[#241A15] font-normal">
                My Orders
              </h2>
              <p className="text-xs text-[#3A2115]/65 font-sans mt-0.5">
                Past purchases and tracking
              </p>
            </div>
          </div>

          <div className="py-12 px-4 text-center bg-[#FAF6F0] rounded-xs border border-[#B58A45]/20">
            <IndianOrnament size={24} className="text-[#B58A45] mb-3 mx-auto" />
            <h3 className="font-serif text-lg text-[#241A15] font-normal mb-1">
              No orders yet
            </h3>
            <p className="text-xs text-[#3A2115]/70 max-w-sm mx-auto mb-5">
              Your orders will appear here after your first purchase. Discover our handcrafted heirlooms in the shop.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-xs bg-[#02221D] hover:bg-[#075E5A] text-[#FAF5ED] font-sans font-semibold text-xs tracking-[0.16em] uppercase transition-all shadow-sm min-h-[44px]"
            >
              Browse Sarees
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
