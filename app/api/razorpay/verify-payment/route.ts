import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { completePaidOrder } from "@/lib/orders-server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { OrderItem, ShippingAddress } from "@/types/order";

export const dynamic = "force-dynamic";

interface VerifyPaymentBody {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  userId: string;
  items?: OrderItem[];
  shippingAddress?: ShippingAddress;
  totalAmount?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: VerifyPaymentBody = await req.json();
    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      userId,
      items: clientItems,
      shippingAddress: clientShipping,
      totalAmount: clientTotal,
    } = body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: "Missing required payment verification parameters." },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!keySecret) {
      console.error("[RAZORPAY VERIFY ERROR]: RAZORPAY_KEY_SECRET is not configured on server.");
      return NextResponse.json(
        { error: "Payment verification configuration error." },
        { status: 500 }
      );
    }

    // 1. Cryptographic HMAC-SHA256 Signature Verification
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      console.error(
        `[RAZORPAY VERIFY SECURITY ALERT]: Invalid signature for order ${orderId}. Expected ${expectedSignature}, received ${razorpaySignature}`
      );
      return NextResponse.json(
        { error: "Payment verification failed: Invalid authenticity signature." },
        { status: 400 }
      );
    }

    // 2. Retrieve staged order data from Firestore
    let finalItems: OrderItem[] = clientItems || [];
    let finalTotal = clientTotal || 0;
    let finalShipping = clientShipping;
    let finalCustomerName = clientShipping?.fullName || clientShipping?.name;
    let finalCustomerEmail = clientShipping?.email;
    let finalCustomerPhone = clientShipping?.phone;

    if (db && typeof db.type === "string") {
      const orderSnap = await getDoc(doc(db, "orders", orderId));
      if (orderSnap.exists()) {
        const orderData = orderSnap.data();
        if (orderData.items && Array.isArray(orderData.items)) {
          finalItems = orderData.items;
        }
        if (typeof orderData.totalAmount === "number") {
          finalTotal = orderData.totalAmount;
        }
        if (orderData.shippingAddress) {
          finalShipping = orderData.shippingAddress;
        }
        if (orderData.customerName) finalCustomerName = orderData.customerName;
        if (orderData.customerEmail) finalCustomerEmail = orderData.customerEmail;
        if (orderData.customerPhone) finalCustomerPhone = orderData.customerPhone;
      }
    }

    if (finalItems.length === 0) {
      return NextResponse.json(
        { error: "No items associated with order." },
        { status: 400 }
      );
    }

    // 3. Atomically decrement stock and finalize order
    // Protected against duplicate execution (Idempotent)
    const result = await completePaidOrder({
      orderId,
      userId,
      paymentId: razorpayPaymentId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      items: finalItems,
      totalAmount: finalTotal,
      subtotal: finalTotal,
      shippingFee: 0,
      shippingAddress: finalShipping,
      customerName: finalCustomerName,
      customerEmail: finalCustomerEmail,
      customerPhone: finalCustomerPhone,
    });

    if (!result.success) {
      console.error(
        `[RAZORPAY VERIFY ERROR]: Failed to finalize order inventory for ${orderId}:`,
        result.error
      );
      return NextResponse.json(
        {
          error:
            result.error ||
            "Payment verified, but stock allocation failed. Our team will contact you shortly.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId,
      status: "Confirmed",
      paymentId: razorpayPaymentId,
    });
  } catch (err: any) {
    console.error("[RAZORPAY VERIFY PAYMENT EXCEPTION]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to verify payment." },
      { status: 500 }
    );
  }
}
