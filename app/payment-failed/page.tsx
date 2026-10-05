"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { IndianOrnament } from "@/components/ui/IndianOrnament";
import { loadRazorpayScript } from "@/lib/razorpay-client";
import { getOrderById } from "@/lib/orders";
import { NekaraOrder } from "@/types/order";
import { formatINR } from "@/lib/products";

function PaymentFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const orderId = searchParams.get("orderId") || "";
  const statusParam = (searchParams.get("status") || "cancelled").toLowerCase();
  const isCancelled = statusParam === "cancelled";

  const [order, setOrder] = useState<NekaraOrder | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (orderId && user) {
      getOrderById(orderId, user.uid)
        .then((data) => {
          if (data) setOrder(data);
        })
        .catch((err) => console.warn("[PAYMENT FAILED] Could not load order details:", err));
    }
  }, [orderId, user]);

  const handleRemoveOrder = async () => {
    if (!orderId || !user) return;

    try {
      setIsDeleting(true);
      const idToken = await user.getIdToken().catch(() => null);
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (idToken) headers["Authorization"] = `Bearer ${idToken}`;

      const res = await fetch("/api/orders/remove-order", {
        method: "POST",
        headers,
        body: JSON.stringify({ orderId, userId: user.uid }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to remove order.");
      }

      router.push("/orders");
    } catch (err: any) {
      alert(err.message || "Failed to remove order.");
      setIsDeleting(false);
    }
  };

  const displayOrderId = orderId
    ? orderId.startsWith("NK-")
      ? orderId
      : `NK-${orderId}`
    : null;

  const handleRetryPayment = async () => {
    if (!orderId) {
      router.push("/cart");
      return;
    }

    try {
      setIsRetrying(true);
      setRetryError(null);

      // 1. Ensure Razorpay checkout script is loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Unable to connect to Razorpay. Please check your network.");
      }

      // 2. Request fresh Razorpay order for this existing orderId
      const idToken = user ? await user.getIdToken().catch(() => null) : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (idToken) {
        headers["Authorization"] = `Bearer ${idToken}`;
      }

      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers,
        body: JSON.stringify({
          orderId,
          userId: user?.uid || "guest",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Could not re-initialize payment for this order.");
      }

      // 3. Open Razorpay Modal directly
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "NEKARA",
        description: `Retry Payment for Order ${orderId}`,
        image: "/images/brand/tab_logo.png",
        order_id: data.razorpayOrderId,
        theme: {
          color: "#02221D",
        },
        modal: {
          ondismiss: function () {
            setIsRetrying(false);
            // Re-mark as cancelled on server
            fetch("/api/razorpay/cancel-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId,
                status: "Cancelled",
                reason: "Customer dismissed retry checkout window",
              }),
            }).catch(() => {});
          },
        },
        handler: async function (response: any) {
          try {
            const verifyToken = user ? await user.getIdToken().catch(() => null) : null;
            const verifyHeaders: Record<string, string> = { "Content-Type": "application/json" };
            if (verifyToken) {
              verifyHeaders["Authorization"] = `Bearer ${verifyToken}`;
            }

            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: verifyHeaders,
              body: JSON.stringify({
                orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                userId: user?.uid || "",
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData?.success) {
              router.push(`/orders/${orderId}?payment=success`);
            } else {
              setRetryError(verifyData?.error || "Payment verification failed. Please try again.");
              setIsRetrying(false);
            }
          } catch (err: any) {
            setRetryError(err.message || "Failed to verify transaction.");
            setIsRetrying(false);
          }
        },
      };

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.on("payment.failed", function (response: any) {
        setIsRetrying(false);
        setRetryError(response.error?.description || "Payment attempt failed.");
        fetch("/api/razorpay/cancel-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            status: "Failed",
            reason: response.error?.description || "Payment failed",
          }),
        }).catch(() => {});
      });

      rzpInstance.open();
    } catch (err: any) {
      setRetryError(err.message || "Could not start payment. Please return to cart.");
      setIsRetrying(false);
    }
  };

  return (
    <div className="w-full min-h-screen pt-28 sm:pt-36 pb-24 bg-[#FDFBF7]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Ornamental Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="w-8 h-[1px] bg-[#B58A45]/40" />
            <IndianOrnament size={20} className="text-[#B58A45]" />
            <span className="w-8 h-[1px] bg-[#B58A45]/40" />
          </div>
          <span className="text-[10px] sm:text-xs font-sans font-semibold tracking-[0.22em] uppercase text-[#B58A45] block">
            PAYMENT STATUS
          </span>
        </div>

        {/* Main Card */}
        <div className="bg-[#FFFBF5] rounded-xs border border-[#B58A45]/30 p-6 sm:p-10 shadow-[0_4px_24px_rgba(58,33,21,0.05)] text-center">
          {/* Status Icon */}
          <div className="w-16 h-16 rounded-full bg-[#FAF3E7] border border-[#B58A45]/30 flex items-center justify-center mx-auto mb-5 text-[#991B1B]">
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.7}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-2xl sm:text-3xl text-[#241A15] font-normal tracking-wide mb-2">
            {isCancelled ? "Payment Cancelled" : "Payment Unsuccessful"}
          </h1>

          <p className="text-xs sm:text-sm text-[#3A2115]/75 max-w-md mx-auto mb-6 leading-relaxed">
            {isCancelled
              ? "Your payment was not completed because the checkout window was closed. You can retry whenever you are ready."
              : "Your payment could not be processed at this time. Please check your payment details or try a different payment method."}
          </p>

          {/* Safe Reservation Notice */}
          <div className="bg-[#FAF6F0] rounded-xs border border-[#B58A45]/20 p-4 text-left text-xs text-[#3A2115]/80 space-y-2 mb-6">
            <div className="flex items-start gap-2.5">
              <span className="text-[#B58A45] font-bold text-sm shrink-0">·</span>
              <p>
                <strong className="font-semibold text-[#02221D]">Order not confirmed:</strong>{" "}
                Your order has not been placed and no inventory or sarees have been reserved.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-[#B58A45] font-bold text-sm shrink-0">·</span>
              <p>
                <strong className="font-semibold text-[#02221D]">Shopping bag intact:</strong>{" "}
                The items are still safely saved in your shopping bag.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-[#B58A45] font-bold text-sm shrink-0">·</span>
              <p>
                <strong className="font-semibold text-[#02221D]">Debited amount safety:</strong>{" "}
                If money was debited from your bank account but payment did not complete, it will be automatically handled according to your bank or payment provider&apos;s reversal timeline (usually 5–7 business days).
              </p>
            </div>
          </div>

          {/* Reference Order ID */}
          {displayOrderId && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF3E7] border border-[#B58A45]/30 text-xs font-sans text-[#3A2115]/80 mb-6">
              <span className="text-[10px] uppercase font-semibold text-[#B58A45]">Order ID:</span>
              <span className="font-bold text-[#02221D]">{displayOrderId}</span>
            </div>
          )}

          {/* Error Banner if retry failed */}
          {retryError && (
            <div className="mb-6 p-3 rounded-xs bg-[#FEE2E2] border border-[#FECACA] text-xs text-[#991B1B]">
              {retryError}
            </div>
          )}

          {/* Selected Sarees Snapshot */}
          {order && order.items && order.items.length > 0 && (
            <div className="mb-6 p-4 sm:p-5 rounded-xs bg-[#FAF6F0] border border-[#B58A45]/20 text-left">
              <h4 className="font-serif text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#241A15] mb-3">
                Selected Sarees ({order.items.length})
              </h4>
              <div className="divide-y divide-[#B58A45]/15">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-14 bg-[#FAF3E7] rounded-xs overflow-hidden shrink-0 border border-[#B58A45]/20">
                        <Image
                          src={item.image || "/images/categories/silk-sarees.jpg"}
                          alt={item.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-serif text-xs sm:text-sm text-[#241A15] truncate font-medium">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-[#3A2115]/60 font-sans">
                          Qty: {item.quantity} · {formatINR(item.price)}
                        </p>
                      </div>
                    </div>
                    {(item.slug || item.productId) && (
                      <Link
                        href={`/product/${item.slug || item.productId}`}
                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-xs border border-[#075E5A]/40 hover:bg-[#075E5A] text-[#075E5A] hover:text-[#FAF5ED] font-sans font-medium text-[11px] uppercase tracking-wider transition-colors shrink-0"
                      >
                        View Product
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {orderId ? (
              <button
                type="button"
                onClick={handleRetryPayment}
                disabled={isRetrying}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 rounded-xs bg-[#02221D] hover:bg-[#075E5A] text-[#FAF5ED] font-sans font-semibold text-xs tracking-[0.18em] uppercase transition-all shadow-md min-h-[46px] disabled:opacity-50"
              >
                {isRetrying ? "Opening Checkout..." : "Try Payment Again"}
              </button>
            ) : null}

            {order && order.items && order.items.length === 1 && (order.items[0].slug || order.items[0].productId) && (
              <Link
                href={`/product/${order.items[0].slug || order.items[0].productId}`}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xs border border-[#075E5A] text-[#075E5A] hover:bg-[#075E5A] hover:text-[#FAF5ED] font-sans font-semibold text-xs tracking-[0.18em] uppercase transition-all min-h-[46px]"
              >
                View Product
              </Link>
            )}

            <Link
              href="/cart"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xs border border-[#02221D] text-[#02221D] hover:bg-[#02221D]/5 font-sans font-semibold text-xs tracking-[0.18em] uppercase transition-all min-h-[46px]"
            >
              Back to Cart
            </Link>

            {orderId && (
              <Link
                href={`/orders/${orderId}`}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xs border border-[#B58A45]/40 text-[#B58A45] hover:text-[#02221D] hover:border-[#02221D] font-sans font-semibold text-xs tracking-[0.18em] uppercase transition-all min-h-[46px]"
              >
                View Order
              </Link>
            )}

            {orderId && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-xs border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-800 font-sans font-semibold text-xs tracking-[0.18em] uppercase transition-all min-h-[46px]"
              >
                Remove Order
              </button>
            )}

            <Link
              href="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xs text-[#3A2115]/70 hover:text-[#02221D] font-sans font-semibold text-xs tracking-[0.18em] uppercase transition-all min-h-[46px]"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      {/* Soft-Delete Confirmation Dialog Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-[#FFFBF5] border border-[#B58A45]/30 rounded-xs p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#02221D]">
              Remove this order?
            </h3>
            <p className="text-xs sm:text-sm text-[#3A2115]/75 font-sans leading-relaxed">
              Are you sure you want to remove this cancelled payment order? This will remove the uncompleted order from your purchase history.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xs border border-[#B58A45]/40 text-[#3A2115] hover:bg-[#FAF6F0] font-sans font-semibold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleRemoveOrder}
                className="px-4 py-2 rounded-xs bg-rose-700 hover:bg-rose-800 text-white font-sans font-semibold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? "Removing..." : "Remove Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen pt-36 pb-20 flex items-center justify-center bg-[#FDFBF7]">
          <div className="w-8 h-8 border-2 border-[#B58A45] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PaymentFailedContent />
    </Suspense>
  );
}
