/**
 * NEKARA — Canonical Order & Payment Status Utilities
 * 
 * Provides unified, unambiguous resolution for:
 * - paymentStatus: 'Paid', 'Refunded', 'Refund Pending', 'Refund Failed', 'Failed', 'Cancelled', 'Pending'
 * - orderStatus: 'Delivered', 'Shipped', 'Processing', 'Confirmed', 'Cancelled', 'Pending'
 * - shipmentStatus: 'Delivered', 'Out for Delivery', 'In Transit', 'Manifested', 'RTO', 'Pending'
 * - refundStatus: 'processed', 'pending', 'processing', 'failed', 'none'
 */

export interface OrderStatusResolution {
  isRefunded: boolean;
  isRefundPending: boolean;
  isRefundFailed: boolean;
  isPaid: boolean;
  isCancelled: boolean;
  isFailed: boolean;
  isPendingPayment: boolean;
  primaryPaymentBadgeText: string;
  primaryPaymentBadgeVariant: "paid" | "refunded" | "refund_pending" | "refund_failed" | "failed" | "cancelled" | "pending";
  fulfillmentBadgeText: string;
  fulfillmentBadgeVariant: "delivered" | "shipped" | "confirmed" | "processing" | "cancelled" | "pending";
}

export function resolveOrderStatuses(order: {
  paymentStatus?: string | null;
  status?: string | null;
  orderStatus?: string | null;
  refund?: { status?: string | null; refundId?: string | null } | null;
  shipment?: { status?: string | null; trackingId?: string | null } | null;
}): OrderStatusResolution {
  const rawPaymentStatus = (order.paymentStatus || "").trim();
  const rawStatus = (order.status || "").trim();
  const rawOrderStatus = (order.orderStatus || "").trim();
  const refundStatus = order.refund?.status?.toLowerCase();

  // 1. Check Refund status first (highest precedence for payment outcome)
  const isRefunded =
    rawPaymentStatus.toUpperCase() === "REFUNDED" ||
    rawStatus.toUpperCase() === "REFUNDED" ||
    refundStatus === "processed";

  const isRefundPending =
    !isRefunded &&
    (rawPaymentStatus.toUpperCase().includes("REFUND PENDING") ||
      rawPaymentStatus.toUpperCase().includes("REFUND PROCESSING") ||
      refundStatus === "pending" ||
      refundStatus === "processing");

  const isRefundFailed =
    !isRefunded &&
    (rawPaymentStatus.toUpperCase().includes("REFUND FAILED") ||
      refundStatus === "failed");

  // 2. Check Paid status
  const isPaid =
    !isRefunded &&
    !isRefundPending &&
    !isRefundFailed &&
    (rawPaymentStatus.toUpperCase() === "PAID" ||
      rawStatus.toUpperCase() === "PAID" ||
      rawStatus.toUpperCase() === "CONFIRMED" ||
      rawStatus.toUpperCase() === "PROCESSING" ||
      rawStatus.toUpperCase() === "SHIPPED" ||
      rawStatus.toUpperCase() === "DELIVERED");

  // 3. Check Cancelled status
  const isCancelled =
    !isRefunded &&
    !isPaid &&
    (rawPaymentStatus.toUpperCase() === "CANCELLED" ||
      rawStatus.toUpperCase() === "CANCELLED" ||
      rawOrderStatus.toUpperCase() === "CANCELLED");

  // 4. Check Failed status (ONLY if not refunded, paid, or cancelled)
  const isFailed =
    !isRefunded &&
    !isRefundPending &&
    !isPaid &&
    !isCancelled &&
    (rawPaymentStatus.toUpperCase() === "FAILED" || rawStatus.toUpperCase() === "FAILED");

  const isPendingPayment = !isRefunded && !isRefundPending && !isRefundFailed && !isPaid && !isCancelled && !isFailed;

  // Primary Payment Badge
  let primaryPaymentBadgeText = "Payment Pending";
  let primaryPaymentBadgeVariant: OrderStatusResolution["primaryPaymentBadgeVariant"] = "pending";

  if (isRefunded) {
    primaryPaymentBadgeText = "Refunded";
    primaryPaymentBadgeVariant = "refunded";
  } else if (isRefundPending) {
    primaryPaymentBadgeText = "Refund Processing";
    primaryPaymentBadgeVariant = "refund_pending";
  } else if (isRefundFailed) {
    primaryPaymentBadgeText = "Refund Failed";
    primaryPaymentBadgeVariant = "refund_failed";
  } else if (isPaid) {
    primaryPaymentBadgeText = "Payment Completed";
    primaryPaymentBadgeVariant = "paid";
  } else if (isCancelled) {
    primaryPaymentBadgeText = "Payment Cancelled";
    primaryPaymentBadgeVariant = "cancelled";
  } else if (isFailed) {
    primaryPaymentBadgeText = "Payment Failed";
    primaryPaymentBadgeVariant = "failed";
  }

  // Fulfillment Badge
  const orderUpper = (rawOrderStatus || rawStatus || "Pending").toUpperCase();
  let fulfillmentBadgeText = "Order Received";
  let fulfillmentBadgeVariant: OrderStatusResolution["fulfillmentBadgeVariant"] = "pending";

  if (orderUpper === "DELIVERED") {
    fulfillmentBadgeText = "Delivered";
    fulfillmentBadgeVariant = "delivered";
  } else if (orderUpper === "SHIPPED" || order.shipment?.trackingId) {
    fulfillmentBadgeText = "Dispatched";
    fulfillmentBadgeVariant = "shipped";
  } else if (orderUpper === "PROCESSING") {
    fulfillmentBadgeText = "Processing";
    fulfillmentBadgeVariant = "processing";
  } else if (orderUpper === "CONFIRMED" || isPaid) {
    fulfillmentBadgeText = "Order Confirmed";
    fulfillmentBadgeVariant = "confirmed";
  } else if (isCancelled) {
    fulfillmentBadgeText = "Cancelled";
    fulfillmentBadgeVariant = "cancelled";
  }

  return {
    isRefunded,
    isRefundPending,
    isRefundFailed,
    isPaid,
    isCancelled,
    isFailed,
    isPendingPayment,
    primaryPaymentBadgeText,
    primaryPaymentBadgeVariant,
    fulfillmentBadgeText,
    fulfillmentBadgeVariant,
  };
}
