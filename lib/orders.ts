/**
 * NEKARA Luxury Sarees — Orders & Secure Inventory Decrement Service
 *
 * ARCHITECTURAL RULES (CRITICAL):
 * 1. Adding to cart DOES NOT decrement product inventory.
 * 2. Removing from cart DOES NOT modify product inventory.
 * 3. Opening checkout DOES NOT decrement inventory.
 * 4. INVENTORY IS DECREMENTED ONLY AFTER SUCCESSFUL PAYMENT CONFIRMATION.
 * 5. Stock decrements MUST be atomic (Firestore runTransaction) and idempotent
 *    (protected by unique paymentId/orderId to prevent double-decrement).
 * 6. Normal customer clients do NOT have permission to directly write /products/{id}.stock.
 *    This service is executed by authorized server actions, Cloud Functions, or post-payment webhooks.
 */

import {
  doc,
  runTransaction,
  serverTimestamp,
  collection,
  getDocs,
  getDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import { NekaraOrder, OrderItem } from "@/types/order";

export interface CompletePaidOrderParams {
  orderId: string;
  userId: string;
  paymentId: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress?: any;
}

export interface OrderCompletionResult {
  success: boolean;
  orderId: string;
  error?: string;
}

/**
 * Executes secure atomic stock decrement and order creation after payment confirmation.
 * Protected against duplicate payment callbacks (Idempotent).
 */
export async function completePaidOrder(
  params: CompletePaidOrderParams
): Promise<OrderCompletionResult> {
  const { orderId, userId, paymentId, items, totalAmount, shippingAddress } = params;

  if (!db || typeof db.type !== "string") {
    throw new Error("Firestore database connection is unavailable.");
  }

  try {
    await runTransaction(db, async (transaction) => {
      // 1. Idempotency Check: Verify if order or payment has already been processed
      const orderRef = doc(db, "orders", orderId);
      const existingOrderSnap = await transaction.get(orderRef);

      if (existingOrderSnap.exists()) {
        const existingData = existingOrderSnap.data();
        if (existingData.status === "PAID" || existingData.paymentId === paymentId) {
          console.log(
            `[NEKARA ORDERS] Order ${orderId} already processed with payment ${paymentId}. Skipping duplicate decrement.`
          );
          return;
        }
      }

      // 2. Read all product documents and verify inventory availability
      const productSnaps = [];
      for (const item of items) {
        const prodRef = doc(db, "products", item.productId);
        const prodSnap = await transaction.get(prodRef);

        if (!prodSnap.exists()) {
          throw new Error(`Product ${item.productId} was not found in catalog.`);
        }

        const currentStock = prodSnap.data().stock ?? 0;
        if (currentStock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${item.name}". Required: ${item.quantity}, Available: ${currentStock}.`
          );
        }

        productSnaps.push({ ref: prodRef, currentStock, quantity: item.quantity });
      }

      // 3. Atomically decrement stock for each purchased product
      for (const prod of productSnaps) {
        const newStock = prod.currentStock - prod.quantity;
        transaction.update(prod.ref, {
          stock: newStock,
          updatedAt: serverTimestamp(),
        });
      }

      // 4. Create/Confirm the PAID order record
      transaction.set(
        orderRef,
        {
          id: orderId,
          userId,
          paymentId,
          status: "PAID",
          items,
          totalAmount,
          shippingAddress: shippingAddress || null,
          paidAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    });

    // 5. Clean up purchased items from customer's cart
    try {
      const cartItemsRef = collection(db, "carts", userId, "items");
      const snap = await getDocs(cartItemsRef);
      const itemProductIds = new Set(items.map((i) => i.productId));

      const deletePromises = snap.docs
        .filter((d) => itemProductIds.has(d.id))
        .map((d) => deleteDoc(d.ref));

      await Promise.all(deletePromises);
    } catch (cartCleanupErr) {
      console.warn("[NEKARA ORDERS] Non-critical: Could not clear purchased cart items:", cartCleanupErr);
    }

    return { success: true, orderId };
  } catch (err: any) {
    console.error(`[NEKARA ORDERS] Failed to complete paid order ${orderId}:`, err);
    return {
      success: false,
      orderId,
      error: err.message || "Failed to finalize order inventory.",
    };
  }
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
      orders.push({
        id: docSnap.id,
        userId: data.userId || userId,
        paymentId: data.paymentId,
        status: data.status || "Confirmed",
        items: Array.isArray(data.items) ? data.items : [],
        totalAmount:
          typeof data.totalAmount === "number"
            ? data.totalAmount
            : parseFloat(data.totalAmount) || 0,
        shippingAddress: data.shippingAddress || undefined,
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

    return {
      id: snap.id,
      userId: data.userId,
      paymentId: data.paymentId,
      status: data.status || "Confirmed",
      items: Array.isArray(data.items) ? data.items : [],
      totalAmount:
        typeof data.totalAmount === "number"
          ? data.totalAmount
          : parseFloat(data.totalAmount) || 0,
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
