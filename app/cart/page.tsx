"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { IndianOrnament } from "@/components/ui/IndianOrnament";
import { formatINR } from "@/lib/products";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { items, totalItems, totalAmount, formattedTotalAmount, updateQuantity, removeFromCart, loading: cartLoading } = useCart();

  // Protect private cart page: unauthenticated visitors are redirected to /login?redirect=/cart
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?redirect=/cart");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || (isAuthenticated && cartLoading)) {
    return (
      <div className="w-full min-h-screen pt-36 pb-20 flex items-center justify-center bg-[#FDFBF7]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#B58A45] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#3A2115]/60 font-sans tracking-widest uppercase">
            Loading your shopping bag...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const isEmpty = items.length === 0;

  return (
    <div className="w-full min-h-screen pt-28 sm:pt-36 pb-20 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* =========================================================
            HEADER & BREADCRUMB
           ========================================================= */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="w-8 h-[1px] bg-[#B58A45]/40" />
            <IndianOrnament size={20} className="text-[#B58A45]" />
            <span className="w-8 h-[1px] bg-[#B58A45]/40" />
          </div>

          <span className="text-[10px] sm:text-xs font-sans font-semibold tracking-[0.22em] uppercase text-[#B58A45] block mb-1">
            SHOPPING BAG
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#241A15] font-normal tracking-wide">
            Your Cart {totalItems > 0 && <span className="text-xl sm:text-2xl text-[#3A2115]/60">({totalItems} {totalItems === 1 ? "Item" : "Items"})</span>}
          </h1>
        </div>

        {/* =========================================================
            EMPTY CART STATE
           ========================================================= */}
        {isEmpty ? (
          <div className="max-w-md mx-auto bg-[#FFFBF5] rounded-xs border border-[#B58A45]/30 p-8 sm:p-12 text-center shadow-[0_4px_24px_rgba(58,33,21,0.04)]">
            <IndianOrnament size={28} className="text-[#B58A45] mb-4 mx-auto" />
            <h2 className="font-serif text-2xl text-[#241A15] font-normal mb-2">
              Your bag is empty
            </h2>
            <p className="text-xs sm:text-sm text-[#3A2115]/70 max-w-xs mx-auto mb-6">
              You haven&apos;t added any sarees to your shopping bag yet. Explore our handcrafted collection.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-8 py-3 rounded-xs bg-[#02221D] hover:bg-[#075E5A] text-[#FAF5ED] font-sans font-semibold text-xs tracking-[0.18em] uppercase transition-all shadow-sm min-h-[44px]"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          /* =========================================================
              ACTIVE CART (2-COLUMN DESKTOP / STACKED MOBILE)
             ========================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* LEFT COLUMN: ITEM LIST (lg:col-span-8) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-[#FFFBF5] rounded-xs border border-[#B58A45]/30 divide-y divide-[#B58A45]/20 shadow-xs">
                {items.map((item) => (
                  <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                    {/* Saree Thumbnail Image */}
                    <Link
                      href={`/product/${item.slug || item.productId}`}
                      className="relative w-24 sm:w-28 aspect-[3/4] rounded-xs overflow-hidden bg-[#FAF3E7] shrink-0 border border-[#B58A45]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A45]"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    </Link>

                    {/* Saree Information & Controls */}
                    <div className="flex-1 flex flex-col justify-between w-full min-h-[120px]">
                      <div>
                        {item.categoryName && (
                          <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#B58A45] block">
                            {item.categoryName}
                          </span>
                        )}
                        <Link
                          href={`/product/${item.slug || item.productId}`}
                          className="font-serif text-base sm:text-lg text-[#241A15] hover:text-[#075E5A] transition-colors leading-snug line-clamp-1 block mt-0.5"
                        >
                          {item.name}
                        </Link>
                        {(item.fabric || item.color) && (
                          <p className="text-[11px] text-[#3A2115]/65 font-sans mt-0.5">
                            {[item.fabric, item.color].filter(Boolean).join(" • ")}
                          </p>
                        )}
                      </div>

                      {/* Pricing Row */}
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="font-sans font-semibold text-sm sm:text-base text-[#241A15]">
                          {formatINR(item.price)}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-xs text-[#3A2115]/40 line-through font-sans">
                            {formatINR(item.originalPrice)}
                          </span>
                        )}
                      </div>

                      {/* Actions: Quantity Selector & Remove Button */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#B58A45]/15">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-[#B58A45]/40 rounded-xs bg-[#FAF6F0]">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center text-[#241A15] hover:bg-[#FAF3E7] disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium"
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-sans font-semibold text-xs text-[#241A15]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={Boolean(item.stock && item.quantity >= item.stock)}
                            className="w-8 h-8 flex items-center justify-center text-[#241A15] hover:bg-[#FAF3E7] disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium"
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            +
                          </button>
                        </div>

                        {/* Remove from Cart */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-[11px] font-sans text-[#8B2626] hover:text-red-700 underline tracking-wider uppercase transition-colors min-h-[44px] flex items-center px-2"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Shopping Link */}
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-xs font-sans text-[#075E5A] hover:text-[#B58A45] tracking-wider uppercase font-semibold transition-colors"
                >
                  <span aria-hidden="true">←</span>
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY (lg:col-span-4) */}
            <div className="lg:col-span-4">
              <div className="bg-[#FFFBF5] rounded-xs border border-[#B58A45]/30 p-6 sm:p-7 shadow-[0_4px_24px_rgba(58,33,21,0.04)] sticky top-28 sm:top-36 space-y-5">
                <h2 className="font-serif text-xl text-[#241A15] font-normal border-b border-[#B58A45]/20 pb-3">
                  Order Summary
                </h2>

                <div className="space-y-3 text-xs sm:text-sm font-sans text-[#3A2115]/80">
                  <div className="flex items-center justify-between">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="font-semibold text-[#241A15]">{formattedTotalAmount}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Insured Delivery</span>
                    <span className="text-[#075E5A] font-medium">Complimentary</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#3A2115]/60">
                    <span>Applicable Taxes</span>
                    <span>Included</span>
                  </div>

                  <div className="border-t border-[#B58A45]/25 pt-3 flex items-baseline justify-between text-base sm:text-lg">
                    <span className="font-serif text-[#241A15] font-medium">Estimated Total</span>
                    <span className="font-sans font-bold text-[#075E5A]">{formattedTotalAmount}</span>
                  </div>
                </div>

                {/* Checkout Action Button */}
                <button
                  type="button"
                  onClick={() => alert("Checkout and payment integration will be activated in the upcoming chapter.")}
                  className="w-full h-12 rounded-xs bg-[#02221D] hover:bg-[#075E5A] text-[#FAF5ED] font-sans font-semibold text-xs tracking-[0.18em] uppercase transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <span>Proceed to Checkout</span>
                  <span aria-hidden="true">→</span>
                </button>

                {/* Trust Badges */}
                <div className="pt-3 border-t border-[#B58A45]/15 space-y-2 text-[11px] text-[#3A2115]/70 font-sans">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🛡️</span>
                    <span>100% Certified Silk Mark Guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">✈️</span>
                    <span>Free Nationwide Express Delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🔒</span>
                    <span>Encrypted &amp; Secure Checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
