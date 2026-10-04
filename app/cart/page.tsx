"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { IndianOrnament } from "@/components/ui/IndianOrnament";
import { formatINR } from "@/lib/products";
import { loadRazorpayScript } from "@/lib/razorpay";
import { cn } from "@/lib/utils";

const INDIAN_STATES = [
  "Karnataka",
  "Tamil Nadu",
  "Maharashtra",
  "Telangana",
  "Andhra Pradesh",
  "Kerala",
  "Delhi",
  "Gujarat",
  "West Bengal",
  "Uttar Pradesh",
  "Rajasthan",
  "Madhya Pradesh",
  "Bihar",
  "Punjab",
  "Haryana",
  "Odisha",
  "Assam",
  "Goa",
  "Jharkhand",
  "Chhattisgarh",
  "Uttarakhand",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Chandigarh",
  "Puducherry",
];

export default function CartPage() {
  const router = useRouter();
  const { user, profile, isAuthenticated, loading: authLoading } = useAuth();
  const {
    items,
    totalItems,
    totalAmount,
    formattedTotalAmount,
    updateQuantity,
    removeFromCart,
    loading: cartLoading,
    cartError,
    clearCartError,
    refreshLiveStock,
  } = useCart();

  // Checkout UI step state
  const [isCheckoutStep, setIsCheckoutStep] = useState<boolean>(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState<boolean>(false);
  const [paymentStepText, setPaymentStepText] = useState<string>("");
  const [paymentAlert, setPaymentAlert] = useState<{
    type: "error" | "info" | "success";
    message: string;
  } | null>(null);

  // Customer Shipping & Delivery Details
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    email: "",
    house: "",
    area: "",
    landmark: "",
    city: "",
    state: "Karnataka",
    postalCode: "",
  });

  // Pre-fill customer details from profile / auth when available
  useEffect(() => {
    if (user || profile) {
      setShippingAddress((prev) => ({
        ...prev,
        fullName: prev.fullName || profile?.displayName || user?.displayName || "",
        email: prev.email || profile?.email || user?.email || "",
        phone: prev.phone || profile?.phone || "",
      }));
    }
  }, [user, profile]);

  // Protect private cart page: unauthenticated visitors are redirected to /login?redirect=/cart
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?redirect=/cart");
    }
  }, [authLoading, isAuthenticated, router]);

  // Re-verify live stock whenever cart items are active
  useEffect(() => {
    if (isAuthenticated && items.length > 0) {
      refreshLiveStock();
    }
  }, [isAuthenticated, items.length, refreshLiveStock]);

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

  // Check if any item has stock conflicts
  const hasStockIssue = items.some(
    (item) =>
      typeof item.stock === "number" &&
      (item.stock <= 0 || item.quantity > item.stock)
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Handle Razorpay Standard Web Checkout
   * 1. Validates delivery details
   * 2. Pre-loads Razorpay checkout script
   * 3. Creates server-side Razorpay order (verifying live stock & price)
   * 4. Opens Razorpay modal
   * 5. Verifies HMAC-SHA256 signature server-side
   * 6. Atomically decrements stock and redirects to order confirmation
   */
  const handleInitiateRazorpay = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentAlert(null);

    // Validation
    if (!shippingAddress.fullName.trim()) {
      setPaymentAlert({ type: "error", message: "Please provide your full recipient name." });
      return;
    }
    const cleanPhone = shippingAddress.phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      setPaymentAlert({ type: "error", message: "Please enter a valid 10-digit mobile number." });
      return;
    }
    if (!shippingAddress.house.trim()) {
      setPaymentAlert({ type: "error", message: "Please enter your flat, house, or building details." });
      return;
    }
    if (!shippingAddress.area.trim()) {
      setPaymentAlert({ type: "error", message: "Please enter your street, road, or area locality." });
      return;
    }
    if (!shippingAddress.city.trim()) {
      setPaymentAlert({ type: "error", message: "Please enter your city." });
      return;
    }
    if (!shippingAddress.state.trim()) {
      setPaymentAlert({ type: "error", message: "Please select your state." });
      return;
    }
    const cleanPin = shippingAddress.postalCode.replace(/\D/g, "");
    if (!cleanPin || cleanPin.length !== 6) {
      setPaymentAlert({ type: "error", message: "Please enter a valid 6-digit postal PIN code." });
      return;
    }

    try {
      setIsPaymentLoading(true);
      setPaymentStepText("Connecting to secure Razorpay gateway...");

      // 1. Preload Razorpay client script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error(
          "Unable to load Razorpay payment gateway. Please verify your internet connection."
        );
      }

      // 2. Call server endpoint to validate live inventory & create Razorpay order
      setPaymentStepText("Validating stock & preparing order...");
      const fullDeliveryAddress = [
        shippingAddress.house.trim(),
        shippingAddress.area.trim(),
        shippingAddress.landmark.trim() ? `(Landmark: ${shippingAddress.landmark.trim()})` : "",
        shippingAddress.city.trim(),
        shippingAddress.state.trim(),
        cleanPin,
      ].filter(Boolean).join(", ");

      const structuredAddress = {
        fullName: shippingAddress.fullName.trim(),
        name: shippingAddress.fullName.trim(),
        phone: cleanPhone,
        email: shippingAddress.email.trim() || user.email || "",
        house: shippingAddress.house.trim(),
        area: shippingAddress.area.trim(),
        landmark: shippingAddress.landmark.trim(),
        address: fullDeliveryAddress,
        street: `${shippingAddress.house.trim()}, ${shippingAddress.area.trim()}`,
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        postalCode: cleanPin,
        pincode: cleanPin,
        country: "India",
      };

      const orderPayload = {
        userId: user.uid,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress: structuredAddress,
      };

      const createRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await createRes.json();
      if (!createRes.ok || !orderData.success) {
        await refreshLiveStock();
        throw new Error(orderData.error || "Failed to initialize order payment.");
      }

      // 3. Launch Razorpay Standard Modal
      setPaymentStepText("Awaiting payment completion...");
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "NEKARA",
        description: `Pure Handloom Saree Order ${orderData.orderId}`,
        image: "/images/brand/tab_logo.png",
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: shippingAddress.fullName.trim(),
          email: shippingAddress.email.trim() || user.email || "",
          contact: cleanPhone,
        },
        theme: {
          color: "#02221D",
        },
        modal: {
          ondismiss: function () {
            setIsPaymentLoading(false);
            setPaymentAlert({
              type: "info",
              message:
                "Payment was not completed. Your shopping bag and inventory remain safe and unchanged.",
            });
          },
        },
        handler: async function (response: any) {
          setIsPaymentLoading(true);
          setPaymentStepText("Verifying payment authenticity & securing your sarees...");

          try {
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: orderData.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                userId: user.uid,
                items: items.map((i) => ({
                  productId: i.productId,
                  name: i.nameSnapshot || i.name,
                  price: i.priceSnapshot || i.price,
                  quantity: i.quantity,
                  subtotal: (i.priceSnapshot || i.price) * i.quantity,
                  image: i.imageSnapshot || i.image,
                  slug: i.slug || i.productId,
                  fabric: i.fabric,
                  color: i.color,
                  colour: i.color,
                })),
                shippingAddress: structuredAddress,
                totalAmount,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              // Redirect to order confirmation page
              router.push(`/orders/${orderData.orderId}?payment=success`);
            } else {
              setPaymentAlert({
                type: "error",
                message:
                  verifyData.error ||
                  "Payment received, but verification encountered an issue. Please contact NEKARA support.",
              });
              setIsPaymentLoading(false);
            }
          } catch (verifyErr: any) {
            console.error("[RAZORPAY CLIENT VERIFICATION ERROR]:", verifyErr);
            setPaymentAlert({
              type: "error",
              message:
                "Network interruption while confirming payment. Please visit My Orders to verify your purchase status.",
            });
            setIsPaymentLoading(false);
          }
        },
      };

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.on("payment.failed", function (response: any) {
        setIsPaymentLoading(false);
        setPaymentAlert({
          type: "error",
          message: `Payment failed: ${
            response.error?.description || "Transaction was declined by bank."
          }. Your cart remains unchanged and no inventory was deducted.`,
        });
      });
      rzpInstance.open();
    } catch (err: any) {
      setIsPaymentLoading(false);
      setPaymentAlert({
        type: "error",
        message: err.message || "An unexpected error occurred during checkout.",
      });
    }
  };

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
            {isCheckoutStep ? "EXPRESS CHECKOUT" : "SHOPPING BAG"}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#241A15] font-normal tracking-wide">
            {isCheckoutStep ? "Delivery & Payment" : "Your Cart"}{" "}
            {totalItems > 0 && !isCheckoutStep && (
              <span className="text-xl sm:text-2xl text-[#3A2115]/60">
                ({totalItems} {totalItems === 1 ? "Saree" : "Sarees"})
              </span>
            )}
          </h1>
        </div>

        {/* Global Cart Error Banner */}
        {cartError && (
          <div className="max-w-3xl mx-auto mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xs text-xs text-amber-900 flex items-center justify-between shadow-xs">
            <span>{cartError}</span>
            <button
              type="button"
              onClick={clearCartError}
              className="text-amber-800 hover:text-amber-950 font-bold px-2"
              aria-label="Dismiss message"
            >
              ✕
            </button>
          </div>
        )}

        {/* Payment Notification Alert */}
        {paymentAlert && (
          <div
            className={cn(
              "max-w-3xl mx-auto mb-6 p-4 rounded-xs border text-xs flex items-center justify-between shadow-xs",
              paymentAlert.type === "error"
                ? "bg-red-50 border-red-200 text-red-900"
                : paymentAlert.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-amber-50 border-amber-200 text-amber-900"
            )}
          >
            <span>{paymentAlert.message}</span>
            <button
              type="button"
              onClick={() => setPaymentAlert(null)}
              className="font-bold px-2 hover:opacity-75"
              aria-label="Dismiss message"
            >
              ✕
            </button>
          </div>
        )}

        {/* =========================================================
            EMPTY CART STATE
           ========================================================= */}
        {isEmpty ? (
          <div className="max-w-md mx-auto bg-[#FFFBF5] rounded-xs border border-[#B58A45]/30 p-8 sm:p-12 text-center shadow-[0_4px_24px_rgba(58,33,21,0.04)]">
            <IndianOrnament size={28} className="text-[#B58A45] mb-4 mx-auto" />
            <h2 className="font-serif text-2xl text-[#241A15] font-normal mb-2">
              Your Shop Bag is Empty
            </h2>
            <p className="text-xs sm:text-sm text-[#3A2115]/70 max-w-xs mx-auto mb-6">
              You haven&apos;t added any sarees to your shopping bag yet. Explore our handcrafted collection of royal handlooms.
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
              ACTIVE CART / CHECKOUT (2-COLUMN DESKTOP / STACKED MOBILE)
             ========================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* LEFT COLUMN: EITHER ITEM LIST OR DELIVERY ADDRESS FORM (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-4">
              {!isCheckoutStep ? (
                /* STEP 1: ITEM LIST */
                <div className="space-y-4">
                  <div className="bg-[#FFFBF5] rounded-xs border border-[#B58A45]/30 divide-y divide-[#B58A45]/20 shadow-xs">
                    {items.map((item) => {
                      const isItemOutOfStock =
                        typeof item.stock === "number" && item.stock <= 0;
                      const isItemExceedingStock =
                        typeof item.stock === "number" &&
                        item.stock > 0 &&
                        item.quantity > item.stock;

                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start transition-colors",
                            isItemOutOfStock
                              ? "bg-red-50/40"
                              : isItemExceedingStock
                              ? "bg-amber-50/40"
                              : ""
                          )}
                        >
                          {/* Saree Thumbnail Image */}
                          <Link
                            href={`/product/${item.slug || item.productId}`}
                            className="relative w-24 sm:w-28 aspect-[3/4] rounded-xs overflow-hidden bg-[#FAF3E7] shrink-0 border border-[#B58A45]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A45]"
                          >
                            <Image
                              src={item.imageSnapshot || item.image}
                              alt={item.nameSnapshot || item.name}
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
                                {item.nameSnapshot || item.name}
                              </Link>
                              {(item.fabric || item.color) && (
                                <p className="text-[11px] text-[#3A2115]/65 font-sans mt-0.5">
                                  {[item.fabric, item.color].filter(Boolean).join(" • ")}
                                </p>
                              )}

                              {/* Inventory conflict status alerts */}
                              {isItemOutOfStock ? (
                                <div className="mt-1 text-[11px] font-medium text-red-700 flex items-center gap-1">
                                  <span>⚠️ This saree has sold out. Please remove it to proceed.</span>
                                </div>
                              ) : isItemExceedingStock ? (
                                <div className="mt-1 text-[11px] font-medium text-amber-800 flex items-center gap-1">
                                  <span>
                                    ⚠️ Stock reduced: Only {item.stock} available. Please reduce quantity to {item.stock}.
                                  </span>
                                </div>
                              ) : item.stock === 1 ? (
                                <div className="mt-1 text-[10px] font-medium text-amber-700">
                                  Only 1 unit remaining in inventory.
                                </div>
                              ) : null}
                            </div>

                            {/* Pricing Row */}
                            <div className="flex items-baseline gap-2 mt-2">
                              <span className="font-sans font-semibold text-sm sm:text-base text-[#241A15]">
                                {formatINR(item.priceSnapshot || item.price)}
                              </span>
                              {(item.originalPriceSnapshot || item.originalPrice) &&
                                (item.originalPriceSnapshot || item.originalPrice)! >
                                  (item.priceSnapshot || item.price) && (
                                  <span className="text-xs text-[#3A2115]/40 line-through font-sans">
                                    {formatINR(
                                      (item.originalPriceSnapshot || item.originalPrice)!
                                    )}
                                  </span>
                                )}
                            </div>

                            {/* Actions: Quantity Selector & Remove Button */}
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#B58A45]/15">
                              {/* Quantity Counter */}
                              <div className="flex items-center border border-[#B58A45]/40 rounded-xs bg-[#FAF6F0]">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(
                                      item.productId,
                                      Math.max(1, item.quantity - 1)
                                    )
                                  }
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
                                  onClick={() =>
                                    updateQuantity(item.productId, item.quantity + 1)
                                  }
                                  disabled={Boolean(
                                    typeof item.stock === "number" &&
                                      item.quantity >= item.stock
                                  )}
                                  className="w-8 h-8 flex items-center justify-center text-[#241A15] hover:bg-[#FAF3E7] disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium"
                                  aria-label={`Increase quantity of ${item.name}`}
                                >
                                  +
                                </button>
                              </div>

                              {/* Remove from Cart */}
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.productId)}
                                className="text-[11px] font-sans text-[#8B2626] hover:text-red-700 underline tracking-wider uppercase transition-colors min-h-[44px] flex items-center px-2"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
              ) : (
                /* STEP 2: SHIPPING & DELIVERY DETAILS FORM */
                <div className="space-y-6">
                  <div className="bg-[#FFFBF5] rounded-xs border border-[#B58A45]/30 p-6 sm:p-8 shadow-xs">
                    <div className="flex items-center justify-between pb-4 border-b border-[#B58A45]/20 mb-6">
                      <div>
                        <h2 className="font-serif text-xl sm:text-2xl text-[#241A15] font-normal">
                          Shipping &amp; Delivery Address
                        </h2>
                        <p className="text-xs text-[#3A2115]/60 mt-0.5">
                          Where should we deliver your pure silk sarees?
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsCheckoutStep(false)}
                        className="text-xs text-[#075E5A] hover:text-[#B58A45] underline font-semibold tracking-wider uppercase transition-colors"
                      >
                        ← Edit Cart
                      </button>
                    </div>

                    <form id="checkout-shipping-form" onSubmit={handleInitiateRazorpay} className="space-y-4">
                      {/* Full Name & Phone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-[#241A15] mb-1">
                            Recipient Full Name *
                          </label>
                          <input
                            type="text"
                            name="fullName"
                            required
                            value={shippingAddress.fullName}
                            onChange={handleInputChange}
                            placeholder="e.g. Priya Sharma"
                            className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#B58A45]/30 rounded-xs text-xs text-[#241A15] focus:outline-none focus:border-[#075E5A]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#241A15] mb-1">
                            Mobile Number (for delivery updates) *
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            required
                            value={shippingAddress.phone}
                            onChange={handleInputChange}
                            placeholder="e.g. 9876543210"
                            maxLength={10}
                            className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#B58A45]/30 rounded-xs text-xs text-[#241A15] focus:outline-none focus:border-[#075E5A]"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-medium text-[#241A15] mb-1">
                          Email Address (for order receipt &amp; tracking)
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={shippingAddress.email}
                          onChange={handleInputChange}
                          placeholder="client@nekara.luxury"
                          className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#B58A45]/30 rounded-xs text-xs text-[#241A15] focus:outline-none focus:border-[#075E5A]"
                        />
                      </div>

                      {/* House & Area */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-[#241A15] mb-1">
                            Flat / House No. / Building *
                          </label>
                          <input
                            type="text"
                            name="house"
                            required
                            value={shippingAddress.house}
                            onChange={handleInputChange}
                            placeholder="e.g. Flat 402, Royal Residency"
                            className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#B58A45]/30 rounded-xs text-xs text-[#241A15] focus:outline-none focus:border-[#075E5A]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#241A15] mb-1">
                            Street / Road / Area / Locality *
                          </label>
                          <input
                            type="text"
                            name="area"
                            required
                            value={shippingAddress.area}
                            onChange={handleInputChange}
                            placeholder="e.g. 5th Main, Indiranagar"
                            className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#B58A45]/30 rounded-xs text-xs text-[#241A15] focus:outline-none focus:border-[#075E5A]"
                          />
                        </div>
                      </div>

                      {/* Landmark */}
                      <div>
                        <label className="block text-xs font-medium text-[#241A15] mb-1">
                          Landmark (Optional)
                        </label>
                        <input
                          type="text"
                          name="landmark"
                          value={shippingAddress.landmark}
                          onChange={handleInputChange}
                          placeholder="e.g. Near Silk Board Junction"
                          className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#B58A45]/30 rounded-xs text-xs text-[#241A15] focus:outline-none focus:border-[#075E5A]"
                        />
                      </div>

                      {/* City, State, PIN */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-[#241A15] mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            name="city"
                            required
                            value={shippingAddress.city}
                            onChange={handleInputChange}
                            placeholder="e.g. Bengaluru"
                            className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#B58A45]/30 rounded-xs text-xs text-[#241A15] focus:outline-none focus:border-[#075E5A]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#241A15] mb-1">
                            State *
                          </label>
                          <select
                            name="state"
                            value={shippingAddress.state}
                            onChange={handleInputChange}
                            className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#B58A45]/30 rounded-xs text-xs text-[#241A15] focus:outline-none focus:border-[#075E5A]"
                          >
                            {INDIAN_STATES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#241A15] mb-1">
                            PIN Code *
                          </label>
                          <input
                            type="text"
                            name="postalCode"
                            required
                            maxLength={6}
                            value={shippingAddress.postalCode}
                            onChange={handleInputChange}
                            placeholder="e.g. 560001"
                            className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#B58A45]/30 rounded-xs text-xs text-[#241A15] focus:outline-none focus:border-[#075E5A]"
                          />
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY & PAYMENT BUTTON (lg:col-span-5) */}
            <div className="lg:col-span-5">
              <div className="bg-[#FFFBF5] rounded-xs border border-[#B58A45]/30 p-6 sm:p-7 shadow-[0_4px_24px_rgba(58,33,21,0.04)] sticky top-28 sm:top-36 space-y-5">
                <h2 className="font-serif text-xl text-[#241A15] font-normal border-b border-[#B58A45]/20 pb-3">
                  {isCheckoutStep ? "Checkout Summary" : "Order Summary"}
                </h2>

                {/* Items preview during checkout step */}
                {isCheckoutStep && (
                  <div className="max-h-48 overflow-y-auto divide-y divide-[#B58A45]/15 pr-1 space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="pt-2 flex items-center justify-between text-xs">
                        <span className="text-[#3A2115] truncate max-w-[200px]">
                          {item.nameSnapshot || item.name} ({item.quantity}x)
                        </span>
                        <span className="font-medium text-[#241A15]">
                          {formatINR((item.priceSnapshot || item.price) * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-3 text-xs sm:text-sm font-sans text-[#3A2115]/80">
                  <div className="flex items-center justify-between">
                    <span>Subtotal ({totalItems} {totalItems === 1 ? "saree" : "sarees"})</span>
                    <span className="font-semibold text-[#241A15]">
                      {formattedTotalAmount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Insured Delivery</span>
                    <span className="text-[#075E5A] font-medium">
                      Complimentary
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#3A2115]/60">
                    <span>Applicable Taxes</span>
                    <span>Included</span>
                  </div>

                  <div className="border-t border-[#B58A45]/25 pt-3 flex items-baseline justify-between text-base sm:text-lg">
                    <span className="font-serif text-[#241A15] font-medium">
                      Total Payable
                    </span>
                    <span className="font-sans font-bold text-[#075E5A]">
                      {formattedTotalAmount}
                    </span>
                  </div>
                </div>

                {/* Conflict Notice if stock issue detected */}
                {hasStockIssue && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-xs text-[11px] text-amber-900">
                    Please adjust quantities or remove unavailable sarees before proceeding to checkout.
                  </div>
                )}

                {/* Step 1 CTA: Proceed to Delivery & Payment */}
                {!isCheckoutStep ? (
                  <button
                    type="button"
                    disabled={hasStockIssue}
                    onClick={() => setIsCheckoutStep(true)}
                    className={cn(
                      "w-full h-12 rounded-xs font-sans font-semibold text-xs tracking-[0.18em] uppercase transition-all duration-300 shadow-sm flex items-center justify-center gap-2 min-h-[44px]",
                      hasStockIssue
                        ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                        : "bg-[#02221D] hover:bg-[#075E5A] text-[#FAF5ED] hover:shadow-md cursor-pointer"
                    )}
                  >
                    <span>{hasStockIssue ? "Adjust Quantities to Proceed" : "Proceed to Checkout"}</span>
                    <span aria-hidden="true">→</span>
                  </button>
                ) : (
                  /* Step 2 CTA: Pay via Razorpay */
                  <div className="space-y-3">
                    <button
                      type="submit"
                      form="checkout-shipping-form"
                      disabled={hasStockIssue || isPaymentLoading}
                      className={cn(
                        "w-full h-12 rounded-xs font-sans font-semibold text-xs tracking-[0.18em] uppercase transition-all duration-300 shadow-sm flex items-center justify-center gap-2 min-h-[44px] cursor-pointer",
                        hasStockIssue || isPaymentLoading
                          ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                          : "bg-[#02221D] hover:bg-[#075E5A] text-[#FAF5ED] hover:shadow-md"
                      )}
                    >
                      {isPaymentLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#FAF5ED] border-t-transparent rounded-full animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>🔒 Pay {formattedTotalAmount} via Razorpay</span>
                        </>
                      )}
                    </button>

                    {isPaymentLoading && paymentStepText && (
                      <p className="text-[11px] text-center text-[#B58A45] font-medium animate-pulse">
                        {paymentStepText}
                      </p>
                    )}

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setIsCheckoutStep(false)}
                        className="text-xs text-[#3A2115]/60 hover:text-[#241A15] transition-colors"
                      >
                        ← Back to Shopping Bag
                      </button>
                    </div>
                  </div>
                )}

                {/* Trust Badges */}
                <div className="pt-3 border-t border-[#B58A45]/15 space-y-2 text-[11px] text-[#3A2115]/70 font-sans">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🏛️</span>
                    <span>100% Certified Silk Mark Guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">✈️</span>
                    <span>Free Nationwide Express Delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🔒</span>
                    <span>Official Razorpay Encrypted Gateway (UPI, Cards, NetBanking)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🛡️</span>
                    <span>Zero inventory deducted until verified payment</span>
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
