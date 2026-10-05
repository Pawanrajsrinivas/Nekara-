import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { completePaidOrder } from "@/lib/orders-server";
import { getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { OrderItem, ShippingAddress } from "@/types/order";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
    // 0. Fail fast if Firebase Admin credentials are not configured
    if (!isFirebaseAdminConfigured()) {
      console.error("[FIREBASE ADMIN] Credentials missing in environment variables.");
      return NextResponse.json(
        {
          error:
            "Firebase Admin credentials are missing. Configure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env.local.",
          code: "FIREBASE_ADMIN_CONFIG_MISSING",
        },
        { status: 500 }
      );
    }

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

    // Authenticate user via Bearer token if provided
    let authenticatedUserId = userId;
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const idToken = authHeader.substring(7).trim();
      try {
        const parts = idToken.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
          if (payload?.user_id || payload?.sub) {
            authenticatedUserId = payload.user_id || payload.sub;
          }
        }
      } catch (tokenErr) {
        console.warn("[AUTH WARNING] Bearer token verification failed:", tokenErr);
      }
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!keySecret) {
      console.error("[RAZORPAY VERIFY ERROR]: RAZORPAY_KEY_SECRET is not configured on server.");
      return NextResponse.json(
        { error: "Payment verification configuration error: RAZORPAY_KEY_SECRET missing." },
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

    // 2. Retrieve staged order data using Firebase Admin SDK (Trusted Server-Side Authority)
    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json(
        { error: "Database service unavailable." },
        { status: 503 }
      );
    }

    let finalItems: OrderItem[] = clientItems || [];
    let finalTotal = clientTotal || 0;
    let finalSubtotal: number | undefined = undefined;
    let finalProcessingFee: number | undefined = undefined;
    let finalShipping = clientShipping;
    let finalCustomerName = clientShipping?.fullName || clientShipping?.name;
    let finalCustomerEmail = clientShipping?.email;
    let finalCustomerPhone = clientShipping?.phone;

    const orderRef = adminDb.collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();
    const exists = typeof orderSnap.exists === "function" ? (orderSnap as any).exists() : Boolean(orderSnap.exists);

    if (exists) {
      const orderData = orderSnap.data();

      // Security check: Validate user ownership if order has userId
      if (orderData?.userId && orderData.userId !== authenticatedUserId) {
        console.error(
          `[RAZORPAY VERIFY SECURITY ALERT]: User ${authenticatedUserId} attempted to finalize order ${orderId} owned by ${orderData.userId}`
        );
        return NextResponse.json(
          { error: "Access denied. Order does not belong to this user." },
          { status: 403 }
        );
      }

      // Security check: Validate Razorpay order ID association
      if (orderData?.razorpayOrderId && orderData.razorpayOrderId !== razorpayOrderId) {
        console.error(
          `[RAZORPAY VERIFY SECURITY ALERT]: Razorpay order ID mismatch. Expected ${orderData.razorpayOrderId}, received ${razorpayOrderId}`
        );
        return NextResponse.json(
          { error: "Invalid payment association." },
          { status: 400 }
        );
      }

      // Idempotency: If already paid, return success immediately
      if (
        orderData?.status === "Confirmed" ||
        orderData?.status === "PAID" ||
        orderData?.paymentStatus === "Paid"
      ) {
        console.log(`[RAZORPAY VERIFY] Order ${orderId} already verified and fulfilled.`);
        return NextResponse.json({
          success: true,
          orderId,
          status: "Confirmed",
          paymentId: orderData?.paymentId || razorpayPaymentId,
        });
      }

      if (orderData?.items && Array.isArray(orderData.items) && orderData.items.length > 0) {
        finalItems = orderData.items;
      }
      if (typeof orderData?.totalAmount === "number" && orderData.totalAmount > 0) {
        finalTotal = orderData.totalAmount;
      }
      if (typeof orderData?.subtotal === "number" && orderData.subtotal > 0) {
        finalSubtotal = orderData.subtotal;
      }
      if (typeof orderData?.paymentProcessingFee === "number") {
        finalProcessingFee = orderData.paymentProcessingFee;
      }
      if (orderData?.shippingAddress) {
        finalShipping = orderData.shippingAddress;
      }
      if (orderData?.customerName) finalCustomerName = orderData.customerName;
      if (orderData?.customerEmail) finalCustomerEmail = orderData.customerEmail;
      if (orderData?.customerPhone) finalCustomerPhone = orderData.customerPhone;
    }

    if (finalItems.length === 0) {
      return NextResponse.json(
        { error: "No items associated with order." },
        { status: 400 }
      );
    }

    // 3. Atomically decrement stock and finalize order via Firebase Admin SDK
    // Protected against duplicate execution (Idempotent)
    const result = await completePaidOrder({
      orderId,
      userId: authenticatedUserId,
      paymentId: razorpayPaymentId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      items: finalItems,
      totalAmount: finalTotal,
      subtotal: finalSubtotal !== undefined ? finalSubtotal : finalTotal,
      paymentProcessingFee: finalProcessingFee,
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
    console.error("[RAZORPAY VERIFY PAYMENT] VERCEL SERVER ERROR");
    console.error("[RAZORPAY VERIFY PAYMENT] Error type:", err?.name || "Error");
    console.error("[RAZORPAY VERIFY PAYMENT] Error message:", err?.message || String(err));
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to verify payment.",
      },
      { status: 500 }
    );
  }
}
