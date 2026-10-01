"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { IndianOrnament } from "@/components/ui/IndianOrnament";
import { WishlistIcon, CartIcon, TrashIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import { NekaraProduct } from "@/types/product";

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { wishlistProducts, wishlistCount, loading: wishlistLoading, removeFromWishlist } = useWishlist();
  const { addToCart, cartError, clearCartError } = useCart();

  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // Protect private wishlist page
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?redirect=/wishlist");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleAddToCart = async (product: NekaraProduct) => {
    clearCartError();
    setAddingId(product.id);
    const success = await addToCart(product, 1);
    setAddingId(null);

    if (success) {
      setAddedId(product.id);
      setTimeout(() => {
        setAddedId(null);
      }, 3000);
    }
  };

  if (authLoading) {
    return (
      <div className="w-full min-h-screen pt-36 pb-20 flex items-center justify-center bg-[#FDFBF7]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#B58A45] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#3A2115]/60 font-sans tracking-widest uppercase">
            Loading your wishlist...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="w-full min-h-screen pt-28 sm:pt-36 pb-24 bg-[#FDFBF7]">
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
            CURATED SELECTIONS
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#241A15] font-normal tracking-wide">
            My Wishlist
          </h1>
          <p className="text-xs sm:text-sm text-[#3A2115]/70 max-w-md mx-auto mt-2">
            Save the sarees you love and come back to them anytime.
          </p>

          {wishlistCount > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF3E7] border border-[#B58A45]/30 text-xs font-sans text-[#075E5A] font-medium">
              <span>{wishlistCount} {wishlistCount === 1 ? "saree saved" : "sarees saved"}</span>
            </div>
          )}
        </div>

        {/* Global Cart Error Banner if any */}
        {cartError && (
          <div className="max-w-md mx-auto mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xs text-xs text-amber-900 flex items-center justify-between">
            <span>{cartError}</span>
            <button
              type="button"
              onClick={clearCartError}
              className="text-amber-700 hover:text-amber-950 font-bold px-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* =========================================================
            LOADING SKELETONS
           ========================================================= */}
        {wishlistLoading && wishlistProducts.length === 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-[#FFFBF5] rounded-xs border border-[#B58A45]/20 overflow-hidden animate-pulse"
              >
                <div className="w-full aspect-[3/4] bg-[#FAF3E7]" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-[#FAF3E7] rounded w-3/4" />
                  <div className="h-3 bg-[#FAF3E7] rounded w-1/2" />
                  <div className="h-8 bg-[#FAF3E7] rounded w-full mt-3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            EMPTY WISHLIST STATE
           ========================================================= */}
        {!wishlistLoading && wishlistCount === 0 && (
          <div className="max-w-md mx-auto py-16 px-6 text-center bg-[#FFFBF5] rounded-xs border border-[#B58A45]/30 shadow-[0_4px_24px_rgba(58,33,21,0.04)]">
            <div className="w-16 h-16 rounded-full bg-[#FAF3E7] border border-[#B58A45]/30 flex items-center justify-center mx-auto mb-4 text-[#B58A45]">
              <WishlistIcon size={28} strokeWidth={1.2} />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl text-[#241A15] font-normal mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-xs sm:text-sm text-[#3A2115]/70 mb-6 leading-relaxed">
              Save your favorite sarees here and find them easily later. Explore our master weavers&apos; handloom creations.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-8 py-3 rounded-xs bg-[#02221D] hover:bg-[#075E5A] text-[#FAF5ED] font-sans font-semibold text-xs tracking-[0.18em] uppercase transition-all shadow-md min-h-[44px]"
            >
              Explore Sarees
            </Link>
          </div>
        )}

        {/* =========================================================
            WISHLIST PRODUCT GRID
           ========================================================= */}
        {wishlistProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {wishlistProducts.map((product) => {
              const isOutOfStock =
                product.availability === "Out of Stock" || product.stock <= 0;
              const isArchived = product.category === "Archived";
              const displayImage =
                imgErrors[product.id] || !product.image
                  ? "/images/categories/silk-sarees.jpg"
                  : product.image;

              return (
                <div
                  key={product.id}
                  className="group relative flex flex-col bg-[#FFFBF5] rounded-xs border border-[#B58A45]/25 hover:border-[#B58A45]/60 transition-all duration-300 shadow-[0_4px_16px_rgba(58,33,21,0.04)] hover:shadow-[0_8px_24px_rgba(181,138,69,0.12)] overflow-hidden"
                >
                  {/* Top Image Container */}
                  <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#FAF3E7]">
                    <Image
                      src={displayImage}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-104"
                      onError={() =>
                        setImgErrors((prev) => ({ ...prev, [product.id]: true }))
                      }
                    />

                    {/* Stock Status Badge */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      {isOutOfStock ? (
                        <span className="inline-block px-2 py-0.5 bg-[#8B2626]/90 text-[#FAF5ED] text-[9px] font-sans font-bold tracking-[0.14em] uppercase rounded-xs shadow-xs">
                          Out of Stock
                        </span>
                      ) : product.stock < 5 ? (
                        <span className="inline-block px-2 py-0.5 bg-amber-800/90 text-[#FAF5ED] text-[9px] font-sans font-bold tracking-[0.14em] uppercase rounded-xs shadow-xs">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 bg-[#075E5A]/90 text-[#FAF5ED] text-[9px] font-sans font-bold tracking-[0.14em] uppercase rounded-xs shadow-xs">
                          In Stock
                        </span>
                      )}
                    </div>

                    {/* Remove From Wishlist Button */}
                    <div className="absolute top-2 right-2 z-20">
                      <button
                        type="button"
                        onClick={() => removeFromWishlist(product.id)}
                        className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-white/90 hover:text-red-400 focus-visible:outline-none transition-colors"
                        aria-label={`Remove ${product.name} from wishlist`}
                        title="Remove from wishlist"
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-black/45 hover:bg-black/70 text-white backdrop-blur-md transition-all shadow-sm">
                          <TrashIcon size={14} />
                        </div>
                      </button>
                    </div>

                    {/* Subtle vignette */}
                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                  </div>

                  {/* Product Details & Actions */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-sans font-medium uppercase tracking-[0.16em] text-[#B58A45] block mb-0.5">
                        {product.category || "Handloom Saree"}
                      </span>

                      <h3 className="font-serif text-base text-[#241A15] font-normal leading-snug line-clamp-1 group-hover:text-[#075E5A] transition-colors">
                        {product.name}
                      </h3>

                      {product.subtitle && (
                        <p className="text-[11px] text-[#3A2115]/60 font-sans line-clamp-1 mt-0.5">
                          {product.subtitle}
                        </p>
                      )}

                      {/* Pricing Row */}
                      {!isArchived && (
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="font-serif text-base font-semibold text-[#075E5A]">
                            {product.formattedPrice}
                          </span>
                          {product.formattedOriginalPrice && (
                            <span className="text-xs text-[#3A2115]/50 line-through font-sans">
                              {product.formattedOriginalPrice}
                            </span>
                          )}
                          {product.discountPercentage && (
                            <span className="text-[10px] font-bold text-[#8B2626]">
                              {product.discountPercentage}% OFF
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons Row */}
                    <div className="pt-4 mt-3 border-t border-[#B58A45]/20 flex flex-col gap-2">
                      {isArchived ? (
                        <div className="text-center py-2">
                          <span className="text-xs text-[#8B2626] font-medium block mb-2">
                            Product no longer available
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFromWishlist(product.id)}
                            className="w-full py-2 rounded-xs border border-[#8B2626]/40 text-[#8B2626] text-xs font-semibold tracking-wider uppercase hover:bg-red-50 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            disabled={isOutOfStock || addingId === product.id}
                            className={cn(
                              "w-full h-10 px-4 rounded-xs font-sans font-semibold text-xs tracking-[0.16em] uppercase transition-all duration-200 flex items-center justify-center gap-2 shadow-xs min-h-[44px]",
                              isOutOfStock
                                ? "bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300"
                                : addedId === product.id
                                ? "bg-[#075E5A] text-[#FAF5ED]"
                                : "bg-[#02221D] hover:bg-[#075E5A] text-[#FAF5ED]"
                            )}
                          >
                            <CartIcon size={14} />
                            <span>
                              {addedId === product.id
                                ? "Added to Bag ✓"
                                : addingId === product.id
                                ? "Adding..."
                                : isOutOfStock
                                ? "Out of Stock"
                                : "Add to Bag"}
                            </span>
                          </button>

                          <Link
                            href={product.href}
                            className="w-full h-9 rounded-xs border border-[#B58A45]/40 hover:border-[#075E5A] text-[#241A15] hover:text-[#075E5A] font-sans font-medium text-xs tracking-wider uppercase transition-colors flex items-center justify-center min-h-[40px]"
                          >
                            View Details
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
