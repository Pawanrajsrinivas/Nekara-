/**
 * NEKARA Luxury Sarees — Server-Side Orders & Atomic Inventory Decrement Service
 *
 * ARCHITECTURAL RULES (CRITICAL):
 * 1. Adding to cart DOES NOT decrement product inventory.
 * 2. Removing from cart DOES NOT modify product inventory.
 * 3. Opening checkout DOES NOT decrement inventory.
 * 4. INVENTORY IS DECREMENTED ONLY AFTER SUCCESSFUL PAYMENT CONFIRMATION.
 * 5. Stock decrements MUST be atomic (Firestore runTransaction) and idempotent
 *    (protected by unique paymentId/orderId to prevent double-decrement).
 * 6. Normal customer clients do NOT have permission to directly write /products/{id}.stock.
 *    This service is executed strictly by server API routes or post-payment webhooks.
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
import { OrderItem, ShippingAddress } from "@/types/order";

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
 * Executes secure atomic stock decrement and order creation after payment confirmation.
 * Protected against duplicate payment callbacks (Idempotent).
 */
export async function completePaidOrder(
  params: CompletePaidOrderParams
): Promise<OrderCompletionResult> {
  const {
    orderId,
    userId,
    paymentId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    items,
    totalAmount,
    subtotal,
    shippingFee,
    shippingAddress,
    customerName,
    customerEmail,
    customerPhone,
  } = params;

  if (!db || typeof db.type !== "string") {
    throw new Error("Firestore database connection is unavailable.");
  }

  try {
    await runTransaction(db, async (transaction) => {
      // 1. Idempotency Check: Verify if order has already been processed
      const orderRef = doc(db, "orders", orderId);
      const existingOrderSnap = await transaction.get(orderRef);

      if (existingOrderSnap.exists()) {
        const existingData = existingOrderSnap.data();
        if (
          existingData.status === "PAID" ||
          existingData.status === "Confirmed" ||
          existingData.paymentStatus === "Paid" ||
          existingData.paymentId === (razorpayPaymentId || paymentId)
        ) {
          console.log(
            `[NEKARA ORDERS] Order ${orderId} already processed. Skipping duplicate decrement.`
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
          throw new Error(`Product "${item.name}" (${item.productId}) was not found in catalog.`);
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

      // 4. Create/Confirm the PAID order record with full customer, delivery, and payment snapshots
      const resolvedCustomerName =
        customerName ||
        shippingAddress?.fullName ||
        shippingAddress?.name ||
        "Valued Customer";
      const resolvedCustomerEmail = customerEmail || shippingAddress?.email || "";
      const resolvedCustomerPhone = customerPhone || shippingAddress?.phone || "";

      const formattedItems = items.map((i) => ({
        ...i,
        subtotal: i.subtotal || i.price * i.quantity,
        color: i.color || i.colour,
        colour: i.colour || i.color,
      }));

      transaction.set(
        orderRef,
        {
          id: orderId,
          userId,
          customerName: resolvedCustomerName,
          customerEmail: resolvedCustomerEmail,
          customerPhone: resolvedCustomerPhone,
          customer: {
            name: resolvedCustomerName,
            email: resolvedCustomerEmail,
            phone: resolvedCustomerPhone,
          },
          paymentId: razorpayPaymentId || paymentId,
          razorpayOrderId: razorpayOrderId || null,
          razorpayPaymentId: razorpayPaymentId || paymentId,
          razorpaySignature: razorpaySignature || null,
          payment: {
            razorpayOrderId: razorpayOrderId || null,
            razorpayPaymentId: razorpayPaymentId || paymentId,
            paymentStatus: "Paid",
            totalAmount,
            currency: "INR",
          },
          status: "Confirmed",
          paymentStatus: "Paid",
          items: formattedItems,
          totalAmount,
          subtotal: subtotal || totalAmount,
          shippingFee: shippingFee || 0,
          shippingAddress: shippingAddress
            ? {
                ...shippingAddress,
                fullName: resolvedCustomerName,
                name: resolvedCustomerName,
                email: resolvedCustomerEmail,
                phone: resolvedCustomerPhone,
              }
            : null,
          paidAt: serverTimestamp(),
          createdAt:
            existingOrderSnap.exists() && existingOrderSnap.data().createdAt
              ? existingOrderSnap.data().createdAt
              : serverTimestamp(),
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
