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
 * 6. TRUSTED SERVER-SIDE OPERATIONS USE FIREBASE ADMIN SDK EXCLUSIVELY.
 *    Client security rules stay locked down.
 */

import { getAdminDb, FieldValue } from "@/lib/firebase-admin";
import { OrderItem, ShippingAddress } from "@/types/order";

/**
 * Recursively strips undefined fields so Firestore set / update never throws
 * "Function setDoc() called with invalid data. Unsupported field value: undefined"
 */
export function sanitizeFirestoreData<T>(data: T): T {
  if (data === undefined) {
    return null as any;
  }
  if (data === null || typeof data !== "object") {
    return data;
  }
  // Preserve FieldValues such as FieldValue.serverTimestamp()
  if (
    typeof (data as any).isEqual === "function" ||
    (data as any)._methodName ||
    ((data as any).constructor &&
      (data as any).constructor.name !== "Object" &&
      !Array.isArray(data))
  ) {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeFirestoreData(item)) as any;
  }
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      result[key] = sanitizeFirestoreData(value);
    }
  }
  return result as T;
}

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
 * Executes secure atomic stock decrement and order confirmation after verified payment.
 * Protected against duplicate payment callbacks (Idempotent).
 * Uses Firebase Admin SDK for trusted server-side execution.
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

  try {
    const adminDb = getAdminDb();
    if (!adminDb) {
      throw new Error("Firebase Admin Firestore database is unavailable.");
    }

    await adminDb.runTransaction(async (transaction) => {
      // 1. Idempotency Check: Verify if order has already been finalized
      const orderRef = adminDb.collection("orders").doc(orderId);
      const existingOrderSnap = await transaction.get(orderRef);

      const exists = typeof existingOrderSnap.exists === "function"
        ? (existingOrderSnap as any).exists()
        : Boolean(existingOrderSnap.exists);

      if (exists) {
        const existingData = existingOrderSnap.data();
        if (
          existingData?.status === "PAID" ||
          existingData?.status === "Confirmed" ||
          existingData?.paymentStatus === "Paid" ||
          existingData?.paymentId === (razorpayPaymentId || paymentId)
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
        const prodRef = adminDb.collection("products").doc(item.productId);
        const prodSnap = await transaction.get(prodRef);

        const prodExists = typeof prodSnap.exists === "function"
          ? (prodSnap as any).exists()
          : Boolean(prodSnap.exists);

        if (!prodExists) {
          throw new Error(`Product "${item.name}" (${item.productId}) was not found in catalog.`);
        }

        const currentStock = prodSnap.data()?.stock ?? 0;
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
          updatedAt: FieldValue.serverTimestamp(),
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

      const existingData = exists ? existingOrderSnap.data() : null;

      const orderPayload = {
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
              house: shippingAddress.house || "",
              area: shippingAddress.area || "",
              landmark: shippingAddress.landmark || "",
              city: shippingAddress.city || "",
              state: shippingAddress.state || "",
              pincode: shippingAddress.pincode || shippingAddress.postalCode || "",
              postalCode: shippingAddress.postalCode || shippingAddress.pincode || "",
            }
          : null,
        paidAt: FieldValue.serverTimestamp(),
        createdAt: existingData?.createdAt || FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      transaction.set(orderRef, sanitizeFirestoreData(orderPayload), { merge: true });
    });

    // 5. Clean up purchased items from customer's cart using Admin batch
    try {
      if (userId) {
        const cartItemsRef = adminDb.collection("carts").doc(userId).collection("items");
        const snap = await cartItemsRef.get();
        const itemProductIds = new Set(items.map((i) => i.productId));

        const batch = adminDb.batch();
        let deleteCount = 0;

        snap.docs.forEach((d) => {
          if (itemProductIds.has(d.id)) {
            batch.delete(d.ref);
            deleteCount++;
          }
        });

        if (deleteCount > 0) {
          await batch.commit();
          console.log(`[NEKARA ORDERS] Cleared ${deleteCount} purchased items from cart for user ${userId}.`);
        }
      }
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
