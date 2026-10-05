/**
 * NEKARA Luxury Sarees — Client-Safe Orders Service
 *
 * Provides query utilities for client order history and single order detail lookups.
 * Note: Inventory decrements are executed strictly on the server (see lib/orders-server.ts).
 */

import {
  doc,
  collection,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import { NekaraOrder, OrderItem, ShippingAddress } from "@/types/order";

export interface CompletePaidOrderParams {
  orderId: string;
  userId: string;
  paymentId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  items: OrderItem[];
  totalAmount: number;
  subtotal?: number;
  shippingFee?: number;
  shippingAddress?: ShippingAddress;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface OrderCompletionResult {
  success: boolean;
  orderId: string;
  error?: string;
}

/**
 * Retrieve all orders belonging to the specified user.
 * Sorted newest first. Resilient to missing composite indexes.
 */
export async function getUserOrders(userId: string): Promise<NekaraOrder[]> {
  if (!db || !userId || typeof db.type !== "string") return [];

  try {
    const ordersRef = collection(db, "orders");
    let snapshot;

    try {
      const q = query(
        ordersRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      snapshot = await getDocs(q);
    } catch (indexError) {
      console.warn("[NEKARA ORDERS] Using fallback query for user orders:", indexError);
      const fallbackQuery = query(ordersRef, where("userId", "==", userId));
      snapshot = await getDocs(fallbackQuery);
    }

    const orders: NekaraOrder[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      // Skip orders that the customer opted to remove
      if (data.hiddenFromCustomer) {
        return;
      }

      orders.push({
        id: docSnap.id,
        userId: data.userId || userId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        paymentId: data.paymentId,
        razorpayOrderId: data.razorpayOrderId,
        razorpayPaymentId: data.razorpayPaymentId,
        razorpaySignature: data.razorpaySignature,
        status: data.status || "Confirmed",
        orderStatus: data.orderStatus,
        paymentStatus: data.paymentStatus || (data.status === "PAID" ? "Paid" : "Pending"),
        items: Array.isArray(data.items) ? data.items : [],
        totalAmount:
          typeof data.totalAmount === "number"
            ? data.totalAmount
            : parseFloat(data.totalAmount) || 0,
        subtotal: data.subtotal,
        shippingFee: data.shippingFee,
        shippingAddress: data.shippingAddress || undefined,
        hiddenFromCustomer: data.hiddenFromCustomer,
        deletedAt: data.deletedAt,
        deletedBy: data.deletedBy,
        paidAt: data.paidAt,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    // Sort newest first
    orders.sort((a, b) => {
      const timeA = a.createdAt?.toMillis
        ? a.createdAt.toMillis()
        : a.createdAt?.seconds
        ? a.createdAt.seconds * 1000
        : new Date(a.createdAt || 0).getTime();
      const timeB = b.createdAt?.toMillis
        ? b.createdAt.toMillis()
        : b.createdAt?.seconds
        ? b.createdAt.seconds * 1000
        : new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    return orders;
  } catch (err: any) {
    console.error("[NEKARA ORDERS] Error fetching user orders:", err);
    throw err;
  }
}

/**
 * Retrieve a single order by ID, enforcing strict ownership verification.
 */
export async function getOrderById(
  orderId: string,
  userId: string
): Promise<NekaraOrder | null> {
  if (!db || !orderId || !userId || typeof db.type !== "string") return null;

  try {
    const orderRef = doc(db, "orders", orderId);
    const snap = await getDoc(orderRef);

    if (!snap.exists()) {
      return null;
    }

    const data = snap.data();

    // STRICT PRIVACY CHECK: Verify authenticated client matches order owner
    if (data.userId !== userId) {
      console.warn(
        `[NEKARA ORDERS] Security violation: User ${userId} attempted to access order ${orderId} owned by ${data.userId}`
      );
      return null;
    }

    // If soft-deleted by customer, treat as non-existent for client
    if (data.hiddenFromCustomer) {
      return null;
    }

    return {
      id: snap.id,
      userId: data.userId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      paymentId: data.paymentId,
      razorpayOrderId: data.razorpayOrderId,
      razorpayPaymentId: data.razorpayPaymentId,
      razorpaySignature: data.razorpaySignature,
      status: data.status || "Confirmed",
      paymentStatus: data.paymentStatus || (data.status === "PAID" ? "Paid" : "Pending"),
      items: Array.isArray(data.items) ? data.items : [],
      totalAmount:
        typeof data.totalAmount === "number"
          ? data.totalAmount
          : parseFloat(data.totalAmount) || 0,
      subtotal: data.subtotal,
      shippingFee: data.shippingFee,
      shippingAddress: data.shippingAddress || undefined,
      paidAt: data.paidAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  } catch (err: any) {
    console.error(`[NEKARA ORDERS] Error fetching order ${orderId}:`, err);
    return null;
  }
}
