"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getUserOrders } from "@/lib/orders";
import { formatINR } from "@/lib/products";
import { NekaraOrder, OrderStatus } from "@/types/order";
import { IndianOrnament } from "@/components/ui/IndianOrnament";
import { OrdersIcon } from "@/components/ui/Icons";
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
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-semibold bg-[#EBF5EE] text-[#064238] border border-[#C2E3CD]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#064238]" />
        Payment Paid
      </span>
    );
  } else if (payUpper === "CANCELLED") {
    paymentBadge = (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-semibold bg-[#FAF6F0] text-[#786D5F] border border-[#D9CDBB]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#786D5F]" />
        Payment Cancelled
      </span>
    );
  } else if (payUpper === "FAILED") {
    paymentBadge = (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-semibold bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
        Payment Failed
      </span>
    );
  } else if (payUpper === "REFUNDED") {
    paymentBadge = (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-semibold bg-purple-50 text-purple-900 border border-purple-200">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-700" />
        Refunded
      </span>
    );
  } else if (payUpper.includes("REFUND PENDING") || payUpper.includes("REFUND PROCESSING")) {
    paymentBadge = (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-semibold bg-purple-50/70 text-purple-800 border border-purple-200">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
        Refund Processing
      </span>
    );
  } else if (payUpper.includes("REFUND FAILED")) {
    paymentBadge = (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-semibold bg-rose-100 text-rose-900 border border-rose-300">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-700" />
        Refund Failed
      </span>
    );
  } else {
    paymentBadge = (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-semibold bg-[#FAF3E7] text-[#B58A45] border border-[#B58A45]/30">
        <span className="w-1.5 h-1.5 rounded-full bg-[#B58A45]" />
        Payment Pending
      </span>
    );
  }

  let orderBadge = null;
  if (orderUpper === "DELIVERED") {
    orderBadge = (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-semibold bg-[#EBF5EE] text-[#064238] border border-[#C2E3CD]">
        Delivered
      </span>
    );
  } else if (orderUpper === "SHIPPED") {
    orderBadge = (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
        Shipped
      </span>
    );
  } else if (orderUpper === "CONFIRMED" || orderUpper === "PROCESSING") {
    orderBadge = (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-semibold bg-[#02221D]/10 text-[#02221D] border border-[#02221D]/20">
        Confirmed
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

function formatOrderDate(timestamp: any): string {
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
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return "Recent";
  }
}

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<NekaraOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Protect private orders page
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?redirect=/orders");
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchOrders = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const userOrders = await getUserOrders(user.uid);
      setOrders(userOrders);
    } catch (err: any) {
      console.error("[NEKARA ORDERS] Error loading orders:", err);
      setError("Unable to load your orders.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleRemoveOrder = async (targetOrderId: string) => {
    if (!user) return;

    try {
      setIsDeleting(true);
      const idToken = await user.getIdToken().catch(() => null);
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (idToken) headers["Authorization"] = `Bearer ${idToken}`;

      const res = await fetch("/api/orders/remove-order", {
        method: "POST",
        headers,
        body: JSON.stringify({ orderId: targetOrderId, userId: user.uid }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to remove order.");
      }

      setOrders((prev) => prev.filter((o) => o.id !== targetOrderId));
      setOrderToDelete(null);
    } catch (err: any) {
      alert(err.message || "Failed to remove order.");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, fetchOrders]);

  if (authLoading) {
    return (
      <div className="w-full min-h-screen pt-36 pb-20 flex items-center justify-center bg-[#FDFBF7]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#B58A45] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#3A2115]/60 font-sans tracking-widest uppercase">
            Loading your orders...
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            CLIENT PORTAL
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#241A15] font-normal tracking-wide">
            My Orders
          </h1>
          <p className="text-xs sm:text-sm text-[#3A2115]/70 max-w-md mx-auto mt-2">
            View your NEKARA purchases and order status.
          </p>
        </div>

        {/* =========================================================
            ERROR STATE
           ========================================================= */}
        {error && (
          <div className="mb-6 p-4 rounded-xs bg-[#FFFBF5] border border-[#8B2626]/30 text-center">
            <p className="text-xs text-[#8B2626] font-medium mb-3">{error}</p>
            <button
              type="button"
              onClick={fetchOrders}
              className="px-4 py-1.5 rounded-xs bg-[#02221D] text-[#FAF5ED] text-xs font-semibold uppercase tracking-wider hover:bg-[#075E5A] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* =========================================================
            LOADING SKELETONS
           ========================================================= */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-[#FFFBF5] rounded-xs border border-[#B58A45]/20 p-6 space-y-4"
              >
                <div className="flex justify-between items-center pb-4 border-b border-[#B58A45]/15">
                  <div className="h-4 bg-[#FAF3E7] rounded w-36" />
                  <div className="h-6 bg-[#FAF3E7] rounded w-20" />
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-20 bg-[#FAF3E7] rounded-xs shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-[#FAF3E7] rounded w-48" />
                    <div className="h-3 bg-[#FAF3E7] rounded w-24" />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-[#B58A45]/15">
                  <div className="h-4 bg-[#FAF3E7] rounded w-28" />
                  <div className="h-8 bg-[#FAF3E7] rounded w-28" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            EMPTY ORDERS STATE
           ========================================================= */}
        {!loading && !error && orders.length === 0 && (
          <div className="max-w-md mx-auto py-16 px-6 text-center bg-[#FFFBF5] rounded-xs border border-[#B58A45]/30 shadow-[0_4px_24px_rgba(58,33,21,0.04)]">
            <div className="w-16 h-16 rounded-full bg-[#FAF3E7] border border-[#B58A45]/30 flex items-center justify-center mx-auto mb-4 text-[#B58A45]">
              <OrdersIcon size={26} strokeWidth={1.2} />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl text-[#241A15] font-normal mb-2">
              No orders yet
            </h2>
            <p className="text-xs sm:text-sm text-[#3A2115]/70 mb-6 leading-relaxed">
              You haven&apos;t purchased anything from NEKARA yet. Discover our master weavers&apos; pure silk creations in the shop.
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
            ORDER LIST
           ========================================================= */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => {
              const displayId =
                order.id.startsWith("NK-")
                  ? order.id
                  : `NK-${order.id.slice(-6).toUpperCase()}`;

              return (
                <div
                  key={order.id}
                  className="bg-[#FFFBF5] rounded-xs border border-[#B58A45]/25 hover:border-[#B58A45]/60 transition-all duration-300 shadow-[0_4px_16px_rgba(58,33,21,0.04)] overflow-hidden"
                >
                  {/* Order Card Header */}
                  <div className="p-4 sm:p-5 bg-[#FAF6F0] border-b border-[#B58A45]/20 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="font-serif text-base sm:text-lg font-bold text-[#02221D] block">
                        Order #{displayId}
                      </span>
                      <span className="text-[11px] text-[#3A2115]/65 font-sans">
                        Placed on {formatOrderDate(order.createdAt || order.paidAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {renderOrderBadges(order)}
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-4 sm:p-6 divide-y divide-[#B58A45]/15">
                    {order.items.map((item, idx) => {
                      const displayImg =
                        item.image || "/images/categories/silk-sarees.jpg";

                      return (
                        <div
                          key={`${item.productId}-${idx}`}
                          className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="relative w-14 h-18 sm:w-16 sm:h-20 bg-[#FAF3E7] rounded-xs overflow-hidden shrink-0 border border-[#B58A45]/20">
                              <Image
                                src={displayImg}
                                alt={item.name}
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-serif text-sm sm:text-base text-[#241A15] font-normal truncate">
                                {item.name}
                              </h4>
                              <p className="text-[11px] text-[#3A2115]/60 font-sans mt-0.5">
                                Qty: {item.quantity} × {formatINR(item.price)}
                              </p>
                              {(item.slug || item.productId) && (
                                <Link
                                  href={`/product/${item.slug || item.productId}`}
                                  className="inline-flex items-center text-[11px] font-sans font-medium text-[#075E5A] hover:text-[#B58A45] hover:underline transition-colors mt-1"
                                >
                                  View Product →
                                </Link>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-serif text-sm font-semibold text-[#075E5A]">
                              {formatINR(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Card Footer */}
                  <div className="p-4 sm:p-5 bg-[#FAF6F0]/60 border-t border-[#B58A45]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-[#3A2115]/60 tracking-wider block">
                        Order Total
                      </span>
                      <span className="font-serif text-lg font-bold text-[#075E5A]">
                        {formatINR(order.totalAmount)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {(order.paymentStatus === "Cancelled" ||
                        order.paymentStatus === "Failed" ||
                        order.status === "Cancelled" ||
                        order.status === "Failed") && (
                        <>
                          <Link
                            href={`/payment-failed?orderId=${order.id}&status=${(order.paymentStatus || order.status).toLowerCase()}`}
                            className="inline-flex items-center justify-center px-4 py-2 rounded-xs bg-[#02221D] hover:bg-[#075E5A] text-[#FAF5ED] font-sans font-semibold text-xs tracking-wider uppercase transition-all shadow-xs min-h-[40px]"
                          >
                            Retry Payment
                          </Link>
                          <button
                            type="button"
                            onClick={() => setOrderToDelete(order.id)}
                            className="inline-flex items-center justify-center px-4 py-2 rounded-xs border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-800 font-sans font-semibold text-xs tracking-wider uppercase transition-all min-h-[40px]"
                          >
                            Remove Order
                          </button>
                        </>
                      )}
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center justify-center px-5 py-2 rounded-xs border border-[#B58A45]/40 hover:border-[#075E5A] hover:bg-[#075E5A] text-[#02221D] hover:text-[#FAF5ED] font-sans font-semibold text-xs tracking-wider uppercase transition-all shadow-xs min-h-[40px]"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Soft-Delete Confirmation Dialog Modal */}
      {orderToDelete && (
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
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 rounded-xs border border-[#B58A45]/40 text-[#3A2115] hover:bg-[#FAF6F0] font-sans font-semibold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleRemoveOrder(orderToDelete)}
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
