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
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

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
