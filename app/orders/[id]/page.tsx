"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getOrderById } from "@/lib/orders";
import { formatINR } from "@/lib/products";
import { NekaraOrder, OrderStatus } from "@/types/order";
import { IndianOrnament } from "@/components/ui/IndianOrnament";
import { ArrowLeftIcon, CheckIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

function renderOrderBadges(order: NekaraOrder) {
  const payUpper = (
    order.paymentStatus ||
    (order.status === "PAID" ? "Paid" : order.status === "Cancelled" ? "Cancelled" : order.status === "Failed" ? "Failed" : "Pending")
  ).toUpperCase();
  const orderUpper = (order.orderStatus || order.status || "Pending").toUpperCase();

  let paymentBadge = null;
  if (payUpper === "PAID") {
    paymentBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold bg-[#EBF5EE] text-[#064238] border border-[#C2E3CD]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#064238]" />
        Payment Completed
      </span>
    );
  } else if (payUpper === "CANCELLED") {
    paymentBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold bg-[#FAF6F0] text-[#786D5F] border border-[#D9CDBB]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#786D5F]" />
        Payment Cancelled
      </span>
    );
  } else if (payUpper === "FAILED") {
    paymentBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
        Payment Failed
      </span>
    );
  } else if (payUpper === "REFUNDED") {
    paymentBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold bg-purple-50 text-purple-900 border border-purple-200">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-700" />
        Payment Refunded
      </span>
    );
  } else if (payUpper.includes("REFUND PENDING") || payUpper.includes("REFUND PROCESSING")) {
    paymentBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold bg-purple-50/70 text-purple-800 border border-purple-200">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
        Refund Processing
      </span>
    );
  } else if (payUpper.includes("REFUND FAILED")) {
    paymentBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold bg-rose-100 text-rose-900 border border-rose-300">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-700" />
        Refund Failed
      </span>
    );
  } else {
    paymentBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold bg-[#FAF3E7] text-[#B58A45] border border-[#B58A45]/30">
        <span className="w-1.5 h-1.5 rounded-full bg-[#B58A45]" />
        Payment Pending
      </span>
    );
  }

  let orderBadge = null;
  if (orderUpper === "DELIVERED") {
    orderBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold bg-[#EBF5EE] text-[#064238] border border-[#C2E3CD]">
        Delivered
      </span>
    );
  } else if (orderUpper === "SHIPPED") {
    orderBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
        Dispatched / In Transit
      </span>
    );
  } else if (orderUpper === "CONFIRMED" || orderUpper === "PROCESSING") {
    orderBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold bg-[#02221D]/10 text-[#02221D] border border-[#02221D]/20">
        Order Confirmed
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {paymentBadge}
      {orderBadge}
    </div>
  );
}

function formatDetailDate(timestamp: any): string {
  if (!timestamp) return "Recent";

  try {
    let date: Date;
    if (typeof timestamp.toDate === "function") {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }

    if (isNaN(date.getTime())) return "Recent";

    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "Recent";
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<NekaraOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [isPaymentSuccessBanner, setIsPaymentSuccessBanner] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("payment") === "success") {
        setIsPaymentSuccessBanner(true);
      }
    }
  }, []);

  const handleRemoveOrder = async () => {
    if (!user || !order) return;

    try {
      setIsDeleting(true);
      const idToken = await user.getIdToken().catch(() => null);
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (idToken) headers["Authorization"] = `Bearer ${idToken}`;

      const res = await fetch("/api/orders/remove-order", {
        method: "POST",
        headers,
        body: JSON.stringify({ orderId: order.id, userId: user.uid }),
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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/login?redirect=/orders/${encodeURIComponent(orderId)}`);
    }
  }, [authLoading, isAuthenticated, router, orderId]);

  useEffect(() => {
    async function loadOrder() {
      if (!user || !orderId) return;

      try {
        setLoading(true);
        const data = await getOrderById(orderId, user.uid);
        if (!data) {
          setNotFound(true);
        } else {
          setOrder(data);
        }
      } catch (err) {
        console.error("[NEKARA ORDERS] Error loading order details:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadOrder();
    }
  }, [user, orderId]);

  if (authLoading || (loading && !notFound)) {
    return (
      <div className="w-full min-h-screen pt-36 pb-20 flex items-center justify-center bg-[#FDFBF7]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#B58A45] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#3A2115]/60 font-sans tracking-widest uppercase">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="w-full min-h-screen pt-36 pb-24 bg-[#FDFBF7]">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="p-8 bg-[#FFFBF5] rounded-xs border border-[#B58A45]/30 shadow-md">
            <h2 className="font-serif text-2xl text-[#241A15] mb-2">Order Not Found</h2>
            <p className="text-xs text-[#3A2115]/70 mb-6">
              The requested order does not exist or you do not have permission to view it.
            </p>
            <Link
              href="/orders"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-xs bg-[#02221D] hover:bg-[#075E5A] text-[#FAF5ED] font-sans font-semibold text-xs tracking-wider uppercase transition-all shadow-sm"
            >
              Back to My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const displayId = order.id.startsWith("NK-")
    ? order.id
    : `NK-${order.id.slice(-8).toUpperCase()}`;

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="w-full min-h-screen pt-28 sm:pt-36 pb-24 bg-[#FDFBF7]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-xs font-sans text-[#3A2115]/70 hover:text-[#075E5A] transition-colors"
          >
            <ArrowLeftIcon size={14} />
            <span>Back to My Orders</span>
          </Link>
        </div>

        {/* Payment Confirmation Banner */}
        {(isPaymentSuccessBanner || order.paymentStatus === "Paid" || order.status === "PAID") && (
          <div className="bg-[#EBF5EE] border border-[#C2E3CD] rounded-xs p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
            <div className="w-8 h-8 rounded-full bg-[#064238] text-[#FAF5ED] flex items-center justify-center shrink-0 mt-0.5">
              <CheckIcon size={16} />
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-base font-bold text-[#064238]">
                Payment Successful &amp; Order Confirmed
              </h3>
              <p className="text-xs text-[#064238]/80 font-sans mt-0.5 leading-relaxed">
                Thank you for your patronage! Your transaction has been securely verified with Razorpay, and our master weavers are preparing your sarees for insured delivery.
              </p>
              <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
                {order.items.length === 1 && (order.items[0].slug || order.items[0].productId) ? (
                  <Link
                    href={`/product/${order.items[0].slug || order.items[0].productId}`}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-xs bg-[#064238] hover:bg-[#02221D] text-[#FAF5ED] font-sans font-semibold text-xs tracking-wider uppercase transition-all shadow-xs"
                  >
                    View Purchased Saree →
                  </Link>
                ) : order.items.length > 1 ? (
                  <a
                    href="#order-items"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-xs bg-[#064238] hover:bg-[#02221D] text-[#FAF5ED] font-sans font-semibold text-xs tracking-wider uppercase transition-all shadow-xs"
                  >
                    View Purchased Sarees ({order.items.length}) ↓
                  </a>
                ) : null}
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xs border border-[#064238]/40 hover:bg-[#064238]/10 text-[#064238] font-sans font-semibold text-xs tracking-wider uppercase transition-all"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Payment Cancelled Banner */}
        {(order.paymentStatus === "Cancelled" || order.status === "Cancelled") && (
          <div className="bg-[#FAF6F0] border border-[#B58A45]/30 rounded-xs p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
            <div className="w-8 h-8 rounded-full bg-[#FAF3E7] text-[#786D5F] border border-[#D9CDBB] flex items-center justify-center shrink-0 mt-0.5 font-bold">
              ✕
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-base font-bold text-[#241A15]">
                Payment Cancelled
              </h3>
              <p className="text-xs text-[#3A2115]/80 font-sans mt-0.5 leading-relaxed">
                The checkout window was closed before completing payment. No sarees or inventory have been reserved.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2.5">
                <Link
                  href={`/payment-failed?orderId=${order.id}&status=cancelled`}
                  className="inline-flex items-center justify-center px-5 py-2 rounded-xs bg-[#02221D] hover:bg-[#075E5A] text-[#FAF5ED] font-sans font-semibold text-xs tracking-wider uppercase transition-all shadow-xs"
                >
                  Retry Payment
                </Link>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xs border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-800 font-sans font-semibold text-xs tracking-wider uppercase transition-all"
                >
                  Remove Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Failed Banner */}
        {(order.paymentStatus === "Failed" || order.status === "Failed") && (
          <div className="bg-[#FEE2E2]/60 border border-[#FECACA] rounded-xs p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
            <div className="w-8 h-8 rounded-full bg-[#DC2626] text-[#FAF5ED] flex items-center justify-center shrink-0 mt-0.5 font-bold">
              !
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-base font-bold text-[#991B1B]">
                Payment Unsuccessful
              </h3>
              <p className="text-xs text-[#3A2115]/80 font-sans mt-0.5 leading-relaxed">
                The payment attempt was declined or could not be completed. If money was debited from your account, it will be refunded according to your bank&apos;s standard reversal timeline (5–7 business days).
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2.5">
                <Link
                  href={`/payment-failed?orderId=${order.id}&status=failed`}
                  className="inline-flex items-center justify-center px-5 py-2 rounded-xs bg-[#02221D] hover:bg-[#075E5A] text-[#FAF5ED] font-sans font-semibold text-xs tracking-wider uppercase transition-all shadow-xs"
                >
                  Retry Payment
                </Link>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xs border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-800 font-sans font-semibold text-xs tracking-wider uppercase transition-all"
                >
                  Remove Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Genuine Payment Pending Banner */}
        {order.paymentStatus === "Pending" &&
          order.status !== "Cancelled" &&
          order.status !== "Failed" &&
          order.status !== "PAID" &&
          order.status !== "Confirmed" && (
            <div className="bg-[#FAF3E7] border border-[#B58A45]/30 rounded-xs p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
              <div className="w-8 h-8 rounded-full bg-[#B58A45] text-[#FAF5ED] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                ⏳
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-[#8C6B2D]">
                  Payment Status: Pending
                </h3>
                <p className="text-xs text-[#3A2115]/80 font-sans mt-0.5 leading-relaxed">
                  Your payment is currently being confirmed by the payment network. This order will automatically update upon payment confirmation.
                </p>
              </div>
            </div>
          )}

        {/* Order Header Summary Banner */}
        <div className="bg-[#FFFBF5] rounded-xs border border-[#B58A45]/30 p-6 sm:p-8 shadow-[0_4px_24px_rgba(58,33,21,0.04)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#B58A45]/20 gap-4">
            <div>
              <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-[#B58A45] block mb-1">
                {order.paymentStatus === "Refunded"
                  ? "ORDER REFUNDED"
                  : order.paymentStatus === "Paid" || order.status === "PAID" || order.status === "Confirmed"
                  ? "PURCHASE CONFIRMATION"
                  : order.paymentStatus === "Cancelled" || order.status === "Cancelled"
                  ? "CANCELLED CHECKOUT"
                  : order.paymentStatus === "Failed" || order.status === "Failed"
                  ? "FAILED PAYMENT"
                  : "PENDING PAYMENT"}
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl text-[#241A15] font-normal">
                Order #{displayId}
              </h1>
              <p className="text-xs text-[#3A2115]/70 font-sans mt-1">
                Placed on {formatDetailDate(order.createdAt || order.paidAt)}
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-2">
              {renderOrderBadges(order)}
              {order.paymentId && (
                <span className="text-[10px] font-mono text-[#3A2115]/60">
                  Ref: {order.paymentId}
                </span>
              )}
            </div>
          </div>

          {order.refund && (
            <div className="mt-6 p-4 rounded-xs bg-purple-50/90 border border-purple-200/80 text-purple-950 font-sans space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-900">
                  Refund Processed ({formatINR(order.refund.amount)})
                </span>
                <span className="text-[10px] font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded-sm">
                  {order.refund.refundId}
                </span>
              </div>
              <p className="text-xs text-purple-900/80 leading-relaxed">
                {order.refund.method === "razorpay"
                  ? "Your refund has been initiated back to your original source payment method and will reflect within 5 to 7 business days per bank processing timelines."
                  : `Your refund of ${formatINR(order.refund.amount)} has been recorded via manual banking settlement. Reference: ${order.refund.referenceId || "Direct Account Transfer"}.`}
              </p>
              {order.refund.reason && (
                <p className="text-[11px] text-purple-800/70 italic">
                  Reason: {order.refund.reason}
                </p>
              )}
            </div>
          )}

          {/* Purchased Items List */}
          <div id="order-items" className="py-6 border-b border-[#B58A45]/20 space-y-4 scroll-mt-24">
            <h3 className="font-serif text-base text-[#241A15] font-medium">
              Order Items ({order.items.length})
            </h3>

            <div className="divide-y divide-[#B58A45]/15">
              {order.items.map((item, idx) => (
                <div
                  key={`${item.productId}-${idx}`}
                  className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative w-16 h-20 sm:w-20 sm:h-24 bg-[#FAF3E7] rounded-xs overflow-hidden shrink-0 border border-[#B58A45]/20">
                      <Image
                        src={item.image || "/images/categories/silk-sarees.jpg"}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-serif text-base text-[#241A15] font-normal truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-[#3A2115]/60 font-sans mt-0.5">
                        Qty: {item.quantity} × {formatINR(item.price)}
                      </p>
                      {(item.slug || item.productId) && (
                        <Link
                          href={`/product/${item.slug || item.productId}`}
                          className="inline-flex items-center text-xs font-sans font-medium text-[#075E5A] hover:text-[#B58A45] hover:underline transition-colors mt-1"
                        >
                          View Product →
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-serif text-base font-semibold text-[#075E5A]">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial & Delivery Details Grid */}
          <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Delivery Information & Tracking */}
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#241A15]">
                  Delivery Information
                </h4>

                {order.shippingAddress ? (
                  <div className="p-4 bg-[#FAF6F0] rounded-xs border border-[#B58A45]/20 text-xs text-[#3A2115]/80 space-y-1 font-sans">
                    {order.shippingAddress.name && (
                      <p className="font-semibold text-[#241A15]">
                        {order.shippingAddress.name}
                      </p>
                    )}
                    {order.shippingAddress.phone && (
                      <p>Phone: {order.shippingAddress.phone}</p>
                    )}
                    {order.shippingAddress.street || order.shippingAddress.address ? (
                      <p>{order.shippingAddress.street || order.shippingAddress.address}</p>
                    ) : null}
                    {(order.shippingAddress.city || order.shippingAddress.state) && (
                      <p>
                        {[order.shippingAddress.city, order.shippingAddress.state]
                          .filter(Boolean)
                          .join(", ")}
                        {order.shippingAddress.postalCode || order.shippingAddress.pincode
                          ? ` - ${
                              order.shippingAddress.postalCode ||
                              order.shippingAddress.pincode
                            }`
                          : ""}
                      </p>
                    )}
                    {order.shippingAddress.country && (
                      <p>{order.shippingAddress.country}</p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-[#FAF6F0] rounded-xs border border-[#B58A45]/20 text-xs text-[#3A2115]/60 font-sans">
                    Standard Handloom Delivery
                  </div>
                )}
              </div>

              {/* Delivery Partner & Tracking Section (If Dispatched) */}
              {order.shipment?.trackingId && (
                <div className="p-4 bg-[#EBF5EE]/80 rounded-xs border border-[#C2E3CD] text-xs font-sans space-y-2 text-[#064238]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-[11px] text-[#064238]">
                      🚚 Live Parcel Tracking
                    </span>
                    <span className="font-semibold px-2 py-0.5 rounded-full bg-[#064238] text-white text-[10px]">
                      {order.shipment.carrier}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[#3A2115]/75">AWB / Tracking Number:</span>
                    <span className="font-mono font-bold text-[#02221D]">
                      {order.shipment.trackingId}
                    </span>
                  </div>

                  {order.shipment.dispatchedAt && (
                    <div className="flex items-center justify-between text-[11px] text-[#3A2115]/70">
                      <span>Dispatched On:</span>
                      <span>{formatDetailDate(order.shipment.dispatchedAt)}</span>
                    </div>
                  )}

                  {order.shipment.carrierPhone && (
                    <div className="flex items-center justify-between text-[11px] text-[#3A2115]/70">
                      <span>Delivery Support:</span>
                      <span>{order.shipment.carrierPhone}</span>
                    </div>
                  )}

                  {order.shipment.notes && (
                    <p className="text-[11px] text-[#064238]/80 italic pt-1 border-t border-[#C2E3CD]">
                      Note: {order.shipment.notes}
                    </p>
                  )}

                  {order.shipment.trackingUrl && (
                    <div className="pt-2">
                      <a
                        href={order.shipment.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-full py-2 px-3 rounded-xs bg-[#02221D] hover:bg-[#075E5A] text-[#FAF5ED] font-semibold text-xs tracking-wider uppercase transition-colors"
                      >
                        Track Shipment on {order.shipment.carrier} →
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Financial Summary */}
            <div className="space-y-3">
              <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#241A15]">
                Payment Summary
              </h4>

              <div className="p-4 bg-[#FAF6F0] rounded-xs border border-[#B58A45]/20 text-xs space-y-2 font-sans">
                <div className="flex justify-between text-[#3A2115]/70">
                  <span>Subtotal</span>
                  <span>{formatINR(order.subtotal || subtotal)}</span>
                </div>
                {typeof order.paymentProcessingFee === "number" && order.paymentProcessingFee > 0 && (
                  <div className="flex justify-between text-[#3A2115]/70">
                    <span>Payment processing fee</span>
                    <span>{formatINR(order.paymentProcessingFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#3A2115]/70">
                  <span>Insured Delivery</span>
                  {typeof order.shippingFee === "number" && order.shippingFee > 0 ? (
                    <span className="font-medium text-[#241A15]">{formatINR(order.shippingFee)}</span>
                  ) : (
                    <span className="text-[#075E5A] font-medium">Complimentary</span>
                  )}
                </div>
                <div className="pt-2 border-t border-[#B58A45]/20 flex justify-between font-serif text-base font-bold text-[#02221D]">
                  <span>
                    {order.paymentStatus === "Paid" || order.status === "PAID"
                      ? "Total Paid"
                      : "Total Amount"}
                  </span>
                  <span className="text-[#075E5A]">{formatINR(order.totalAmount)}</span>
                </div>
              </div>
            </div>
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
