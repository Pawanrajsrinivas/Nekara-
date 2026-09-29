"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { NekaraProduct } from "@/types/product";
import { WishlistIcon, CartIcon } from "@/components/ui/Icons";
import { IndianOrnament } from "@/components/ui/IndianOrnament";
import { ProductCard } from "@/components/products/ProductCard";
import { cn } from "@/lib/utils";

interface ProductDetailViewProps {
  product: NekaraProduct;
  relatedProducts?: NekaraProduct[];
}

export function ProductDetailView({ product, relatedProducts = [] }: ProductDetailViewProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "details" | "care" | "shipping">("description");

  const activeImage = images[selectedImageIndex] || product.image;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (product.stock && next > product.stock) return product.stock;
      return next;
    });
  };

  const handleAddToCart = async () => {
    // If client is not signed in, redirect to login while preserving destination & cart action
    if (!isAuthenticated) {
      const dest = `/product/${encodeURIComponent(product.slug || product.id)}`;
      router.push(`/login?redirect=${encodeURIComponent(dest)}&action=addToCart&qty=${quantity}`);
      return;
    }

    const success = await addToCart(product, quantity);
    if (success) {
      setIsAddedToCart(true);
      setTimeout(() => {
        setIsAddedToCart(false);
      }, 2800);
    }
  };

  const toggleWishlist = () => {
    setIsWishlisted((prev) => !prev);
  };

  const isOutOfStock = product.availability === "Out of Stock" || product.stock <= 0;

  return (
    <div className="w-full bg-[#FDFBF7] min-h-screen pt-28 sm:pt-36 pb-20">
      {/* =========================================================
          1. BREADCRUMBS
         ========================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center flex-wrap gap-2 text-[11px] sm:text-xs font-sans tracking-wider text-[#3A2115]/60"
        >
          <Link href="/" className="hover:text-[#075E5A] transition-colors">
            HOME
          </Link>
          <span className="text-[#B58A45]/40">/</span>
          <Link href="/shop" className="hover:text-[#075E5A] transition-colors">
            SHOP
          </Link>
          <span className="text-[#B58A45]/40">/</span>
          <Link
            href={`/shop?category=${encodeURIComponent(product.categoryName)}`}
            className="hover:text-[#075E5A] transition-colors uppercase"
          >
            {product.categoryName}
          </Link>
          <span className="text-[#B58A45]/40">/</span>
          <span className="text-[#241A15] font-medium truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </nav>
      </div>

      {/* =========================================================
          2. MAIN PRODUCT SECTION (GALLERY + DETAILS)
         ========================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start">
          {/* =========================================================
              LEFT COLUMN: IMAGE GALLERY (5 or 6 cols on lg)
             ========================================================= */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col-reverse md:flex-row gap-4">
            {/* Vertical Thumbnails List (Desktop) / Horizontal (Mobile) */}
            {images.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[580px] pb-2 md:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0">
                {images.map((imgUrl, index) => {
                  const isSelected = index === selectedImageIndex;
                  return (
                    <button
                      key={imgUrl + index}
                      type="button"
                      onClick={() => setSelectedImageIndex(index)}
                      className={cn(
                        "relative w-16 sm:w-20 aspect-[3/4] shrink-0 rounded-xs overflow-hidden border-2 transition-all duration-200 bg-[#FAF3E7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A45]",
                        isSelected
                          ? "border-[#075E5A] shadow-md scale-102"
                          : "border-[#B58A45]/20 hover:border-[#B58A45]/60 opacity-80 hover:opacity-100"
                      )}
                      aria-label={`View image thumbnail ${index + 1}`}
                    >
                      <Image
                        src={imgUrl}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Main Primary Image Display */}
            <div className="relative flex-1 aspect-[3/4] rounded-xs overflow-hidden bg-[#FAF3E7] border border-[#B58A45]/20 shadow-[0_8px_30px_rgba(58,33,21,0.06)] group">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-103"
              />

              {/* Badge */}
              {product.badge && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-block px-3 py-1 bg-[#FAF5ED]/95 backdrop-blur-xs text-[#075E5A] border border-[#B58A45]/30 text-[10px] font-sans font-bold tracking-[0.2em] uppercase rounded-xs shadow-sm">
                    {product.badge}
                  </span>
                </div>
              )}

              {/* Discount Tag */}
              {product.discountPercentage && (
                <div className="absolute bottom-4 left-4 z-10">
                  <span className="inline-block px-2.5 py-1 bg-[#8B2626] text-[#FFFBF5] text-[10px] font-sans font-semibold tracking-wider uppercase rounded-xs shadow-sm">
                    {product.discountPercentage}% OFF
                  </span>
                </div>
              )}

              {/* Wishlist Button */}
              <div className="absolute top-3 right-3 z-10">
                <button
                  type="button"
                  onClick={toggleWishlist}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-white/90 hover:text-[#B58A45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A45] transition-colors"
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-sm",
                      isWishlisted
                        ? "bg-[#075E5A] text-[#F7F0E4]"
                        : "bg-black/40 hover:bg-black/60 text-white"
                    )}
                  >
                    <WishlistIcon size={18} strokeWidth={2} filled={isWishlisted} />
                  </div>
                </button>
              </div>

              {/* Subtle bottom vignette */}
              <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* =========================================================
              RIGHT COLUMN: PRODUCT DETAILS & ACTIONS (6 cols on lg)
             ========================================================= */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-start">
            {/* Category / Subtitle Eyebrow */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] sm:text-xs font-sans font-semibold tracking-[0.2em] uppercase text-[#B58A45]">
                {product.categoryName}
              </span>
              {product.collection && (
                <>
                  <span className="text-[#B58A45]/40">•</span>
                  <span className="text-[11px] sm:text-xs font-sans tracking-wider text-[#3A2115]/60 italic">
                    {product.collection}
                  </span>
                </>
              )}
            </div>

            {/* Product Title */}
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#241A15] font-normal leading-tight tracking-wide mb-2">
              {product.name}
            </h1>

            {/* Subtitle / Short Description */}
            {product.subtitle && (
              <p className="font-sans text-xs sm:text-sm text-[#3A2115]/75 mb-4">
                {product.subtitle}
              </p>
            )}

            {/* Price Row */}
            <div className="flex items-baseline gap-3 mb-4 pb-4 border-b border-[#B58A45]/20">
              <span className="font-sans font-semibold text-2xl sm:text-3xl text-[#241A15] tracking-tight">
                {product.formattedPrice}
              </span>
              {product.formattedOriginalPrice && (
                <span className="text-base sm:text-lg text-[#3A2115]/45 line-through">
                  {product.formattedOriginalPrice}
                </span>
              )}
              {product.discountPercentage && (
                <span className="text-xs font-semibold text-[#075E5A] bg-[#075E5A]/10 px-2 py-0.5 rounded-xs tracking-wider">
                  Save {product.discountPercentage}%
                </span>
              )}
              <span className="text-[11px] text-[#3A2115]/60 ml-auto">
                Inclusive of all taxes
              </span>
            </div>

            {/* Availability Indicator */}
            <div className="flex items-center gap-2 mb-6">
              <span
                className={cn(
                  "w-2.5 h-2.5 rounded-full inline-block",
                  isOutOfStock
                    ? "bg-red-500"
                    : product.availability === "Low Stock"
                    ? "bg-amber-500 animate-pulse"
                    : "bg-[#075E5A]"
                )}
              />
              <span className="text-xs font-sans font-medium text-[#241A15]">
                {isOutOfStock
                  ? "Sold Out — Made to Order Inquiries Welcome"
                  : product.availability === "Low Stock"
                  ? `Only ${product.stock} left in stock — Order soon`
                  : "In Stock — Dispatched within 24 to 48 hours"}
              </span>
            </div>

            {/* Specifications Summary Grid */}
            <div className="bg-[#FAF6F0] rounded-xs border border-[#B58A45]/25 p-4 sm:p-5 mb-6 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#3A2115]/60 block text-[10px] tracking-wider uppercase font-semibold">
                  Fabric
                </span>
                <span className="text-[#241A15] font-medium font-serif text-sm">
                  {product.fabric || "Pure Mulberry Silk"}
                </span>
              </div>
              <div>
                <span className="text-[#3A2115]/60 block text-[10px] tracking-wider uppercase font-semibold">
                  Weave & Technique
                </span>
                <span className="text-[#241A15] font-medium font-serif text-sm">
                  {product.weave || "Artisanal Handloom"}
                </span>
              </div>
              <div>
                <span className="text-[#3A2115]/60 block text-[10px] tracking-wider uppercase font-semibold">
                  Primary Shade
                </span>
                <span className="text-[#241A15] font-medium font-serif text-sm">
                  {product.color || "Heritage Tint"}
                </span>
              </div>
              <div>
                <span className="text-[#3A2115]/60 block text-[10px] tracking-wider uppercase font-semibold">
                  Occasion
                </span>
                <span className="text-[#241A15] font-medium font-serif text-sm">
                  {product.occasion || "Celebration & Bridal"}
                </span>
              </div>
            </div>

            {/* Quantity Selector + Add To Bag Actions */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4">
                {/* Quantity Control */}
                <div className="flex items-center border border-[#B58A45]/40 rounded-xs bg-[#FFFBF5]">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={isOutOfStock || quantity <= 1}
                    className="w-10 h-11 flex items-center justify-center text-[#241A15] hover:bg-[#FAF3E7] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-sans font-semibold text-xs text-[#241A15]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    disabled={isOutOfStock || Boolean(product.stock && quantity >= product.stock)}
                    className="w-10 h-11 flex items-center justify-center text-[#241A15] hover:bg-[#FAF3E7] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Primary Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={cn(
                    "flex-1 h-11 px-6 rounded-xs font-sans font-semibold text-xs tracking-[0.18em] uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-sm min-h-[44px]",
                    isOutOfStock
                      ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                      : isAddedToCart
                      ? "bg-[#075E5A] text-[#FAF5ED]"
                      : "bg-[#02221D] hover:bg-[#075E5A] text-[#FAF5ED] hover:shadow-md"
                  )}
                >
                  <CartIcon size={16} />
                  <span>{isAddedToCart ? "ADDED TO YOUR BAG ✓" : isOutOfStock ? "SOLD OUT" : "ADD TO SHOPPING BAG"}</span>
                </button>
              </div>

              {/* WhatsApp Concierge Consultation Link */}
              <a
                href={`https://wa.me/919999999999?text=${encodeURIComponent(
                  `Hello NEKARA, I would like to inquire about the saree: ${product.name} (Ref: ${product.sku || product.id})`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 rounded-xs border border-[#075E5A]/50 hover:border-[#075E5A] hover:bg-[#075E5A]/5 text-[#075E5A] font-sans font-medium text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-2 min-h-[44px]"
              >
                <span>Consult Stylist via WhatsApp</span>
                <span aria-hidden="true">💬</span>
              </a>
            </div>

            {/* Trust Assurances */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-[#B58A45]/20 text-center">
              <div className="flex flex-col items-center p-2">
                <span className="text-lg mb-1">🏛️</span>
                <span className="text-[10px] font-sans font-semibold text-[#241A15] uppercase tracking-wider">
                  Silk Mark Certified
                </span>
                <span className="text-[9px] text-[#3A2115]/65">100% Pure Silks</span>
              </div>
              <div className="flex flex-col items-center p-2">
                <span className="text-lg mb-1">✈️</span>
                <span className="text-[10px] font-sans font-semibold text-[#241A15] uppercase tracking-wider">
                  Complimentary Shipping
                </span>
                <span className="text-[9px] text-[#3A2115]/65">Insured Across India</span>
              </div>
              <div className="flex flex-col items-center p-2">
                <span className="text-lg mb-1">✨</span>
                <span className="text-[10px] font-sans font-semibold text-[#241A15] uppercase tracking-wider">
                  Heirloom Weave
                </span>
                <span className="text-[9px] text-[#3A2115]/65">Master Handloom</span>
              </div>
              <div className="flex flex-col items-center p-2">
                <span className="text-lg mb-1">🔒</span>
                <span className="text-[10px] font-sans font-semibold text-[#241A15] uppercase tracking-wider">
                  Secure Checkout
                </span>
                <span className="text-[9px] text-[#3A2115]/65">Encrypted Payments</span>
              </div>
            </div>

            {/* Accordion / Tabbed Details */}
            <div className="mt-8">
              {/* Tab Headers */}
              <div className="flex border-b border-[#B58A45]/25 gap-2 overflow-x-auto [scrollbar-width:none]">
                <button
                  type="button"
                  onClick={() => setActiveTab("description")}
                  className={cn(
                    "pb-2.5 px-3 text-xs font-sans tracking-wider uppercase transition-colors shrink-0 font-medium",
                    activeTab === "description"
                      ? "text-[#075E5A] border-b-2 border-[#075E5A] font-semibold"
                      : "text-[#3A2115]/60 hover:text-[#241A15]"
                  )}
                >
                  Story & Description
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("details")}
                  className={cn(
                    "pb-2.5 px-3 text-xs font-sans tracking-wider uppercase transition-colors shrink-0 font-medium",
                    activeTab === "details"
                      ? "text-[#075E5A] border-b-2 border-[#075E5A] font-semibold"
                      : "text-[#3A2115]/60 hover:text-[#241A15]"
                  )}
                >
                  Dimensions & Blouse
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("care")}
                  className={cn(
                    "pb-2.5 px-3 text-xs font-sans tracking-wider uppercase transition-colors shrink-0 font-medium",
                    activeTab === "care"
                      ? "text-[#075E5A] border-b-2 border-[#075E5A] font-semibold"
                      : "text-[#3A2115]/60 hover:text-[#241A15]"
                  )}
                >
                  Wash & Care
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("shipping")}
                  className={cn(
                    "pb-2.5 px-3 text-xs font-sans tracking-wider uppercase transition-colors shrink-0 font-medium",
                    activeTab === "shipping"
                      ? "text-[#075E5A] border-b-2 border-[#075E5A] font-semibold"
                      : "text-[#3A2115]/60 hover:text-[#241A15]"
                  )}
                >
                  Delivery & Returns
                </button>
              </div>

              {/* Tab Content Panels */}
              <div className="py-4 text-xs sm:text-sm text-[#3A2115]/80 leading-relaxed font-sans">
                {activeTab === "description" && (
                  <div className="space-y-3">
                    <p>
                      {product.description ||
                        "A majestic manifestation of royal Indian textile traditions. Handwoven with certified silk threads and accentuated by authentic metallic zari highlights, this drape personifies timeless grace and artisanal prestige."}
                    </p>
                    {product.sku && (
                      <p className="text-[11px] text-[#3A2115]/50">
                        Item SKU: <span className="font-mono text-[#241A15]">{product.sku}</span>
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "details" && (
                  <ul className="space-y-2 list-disc pl-5">
                    <li>
                      <strong>Saree Length:</strong> 5.5 meters of uninterrupted handcrafted elegance.
                    </li>
                    <li>
                      <strong>Blouse Piece:</strong> Included (0.8 meter unstitched blouse fabric matching pallu accents).
                    </li>
                    <li>
                      <strong>Weaving Technique:</strong> Interlocking warp and weft traditional pit-loom technique.
                    </li>
                    <li>
                      <strong>Zari Quality:</strong> Tested and certified electroplated zari for enduring radiance.
                    </li>
                  </ul>
                )}

                {activeTab === "care" && (
                  <ul className="space-y-2 list-disc pl-5">
                    <li>Strictly Dry Clean only to preserve delicate silk filaments and zari sheen.</li>
                    <li>Wrap in breathable muslin or unbleached pure cotton fabric when storing.</li>
                    <li>Refold periodically along different crease lines to preserve fabric integrity.</li>
                    <li>Do not spray perfumes, deodorants, or water droplets directly onto the saree.</li>
                    <li>Iron on gentle reverse side using a protective cotton press cloth.</li>
                  </ul>
                )}

                {activeTab === "shipping" && (
                  <ul className="space-y-2 list-disc pl-5">
                    <li>
                      <strong>Domestic Shipping:</strong> Free express insured delivery across India within 3–5 business days.
                    </li>
                    <li>
                      <strong>Packaging:</strong> Arrives in NEKARA signature luxury archival keepsake gift box.
                    </li>
                    <li>
                      <strong>Authenticity:</strong> Accompanied by official Silk Mark hologram certifying genuine handloom origin.
                    </li>
                    <li>
                      <strong>Returns & Exchange:</strong> 7-day hassle-free return or exchange for unworn sarees with security tags intact.
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          3. RELATED PRODUCTS ("You May Also Cherish")
         ========================================================= */}
      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24 pt-12 border-t border-[#B58A45]/20">
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="w-8 h-[1px] bg-[#B58A45]/40" />
              <IndianOrnament size={18} className="text-[#B58A45]" />
              <span className="w-8 h-[1px] bg-[#B58A45]/40" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#241A15] font-normal tracking-wide">
              You May Also Cherish
            </h2>
            <p className="text-xs sm:text-sm text-[#3A2115]/65 mt-1 font-sans">
              Handpicked complementary sarees from our master weavers
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.slice(0, 4).map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
