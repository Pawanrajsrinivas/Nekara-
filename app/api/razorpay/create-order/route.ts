import { NextRequest, NextResponse } from "next/server";
import { getRazorpay } from "@/lib/razorpay";
import { getAdminDb, isFirebaseAdminConfigured, FieldValue } from "@/lib/firebase-admin";
import { OrderItem, ShippingAddress } from "@/types/order";
import { sanitizeFirestoreData } from "@/lib/orders-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface CreateOrderRequestBody {
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: ShippingAddress;
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

    const body: CreateOrderRequestBody = await req.json();
    const { userId, items, shippingAddress } = body;

    // Authenticate user via Bearer token if provided, falling back to body.userId
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
        console.warn("[AUTH WARNING] Bearer token payload parsing failed:", tokenErr);
      }
    }

    if (!authenticatedUserId || typeof authenticatedUserId !== "string") {
      return NextResponse.json(
        { error: "Authentication required. Missing user ID." },
        { status: 401 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty. Please add sarees before proceeding." },
        { status: 400 }
      );
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone) {
      return NextResponse.json(
        { error: "Shipping details are incomplete. Name and phone are required." },
        { status: 400 }
      );
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json(
        { error: "Database service unavailable." },
        { status: 503 }
      );
    }

    // 1. Fetch live product data from Firestore using Firebase Admin SDK (Pricing Authority)
    const enrichedItems: OrderItem[] = [];
    let serverTotalAmount = 0;

    for (const item of items) {
      if (!item.productId || typeof item.quantity !== "number" || item.quantity <= 0) {
        return NextResponse.json(
          { error: "Invalid item in cart." },
          { status: 400 }
        );
      }

      const snap = await adminDb.collection("products").doc(item.productId).get();
      const exists = typeof snap.exists === "function" ? (snap as any).exists() : Boolean(snap.exists);

      if (!exists) {
        return NextResponse.json(
          { error: `Product ID "${item.productId}" is not available in catalog.` },
          { status: 404 }
        );
      }

      const prodData = snap.data() || {};

      if (prodData.active === false) {
        return NextResponse.json(
          { error: `"${prodData.name}" is currently unavailable.` },
          { status: 400 }
        );
      }

      // Live inventory availability check
      const currentStock = typeof prodData.stock === "number" ? prodData.stock : 0;
      if (currentStock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for "${prodData.name}". Available: ${currentStock}, Requested: ${item.quantity}.`,
          },
          { status: 409 }
        );
      }

      // Server calculates price (NEVER trust client-provided price)
      const unitPrice =
        typeof prodData.salePrice === "number" && prodData.salePrice > 0
          ? prodData.salePrice
          : prodData.price || 0;

      serverTotalAmount += unitPrice * item.quantity;

      const itemEntry: OrderItem = {
        productId: item.productId,
        name: prodData.name || "Handloom Saree",
        price: unitPrice,
        quantity: item.quantity,
        subtotal: unitPrice * item.quantity,
        image: prodData.thumbnail || prodData.images?.[0] || "",
        slug: prodData.slug || item.productId,
      };

      if (prodData.fabric) itemEntry.fabric = prodData.fabric;
      if (prodData.color || prodData.colour) {
        itemEntry.color = prodData.color || prodData.colour;
        itemEntry.colour = prodData.colour || prodData.color;
      }
      if (prodData.design) itemEntry.design = prodData.design;
      if (prodData.sku || prodData.productId) {
        itemEntry.sku = prodData.sku || prodData.productId;
      }

      enrichedItems.push(itemEntry);
    }

    if (serverTotalAmount <= 0) {
      return NextResponse.json(
        { error: "Total payable amount must be greater than ₹0." },
        { status: 400 }
      );
    }

    // Razorpay amount in paise (1 INR = 100 paise). Minimum 100 paise (₹1).
    const amountInPaise = Math.round(serverTotalAmount * 100);
    if (amountInPaise < 100) {
      return NextResponse.json(
        { error: "Minimum order amount is ₹1.00." },
        { status: 400 }
      );
    }

    // 2. Safe Diagnostics Logging (NEVER logs secret)
    const rawKeyId = (
      process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ""
    ).trim();
    const rawKeySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
    if (!rawKeyId || !rawKeySecret) {
      return NextResponse.json(
        {
          error: "Razorpay payment gateway credentials are not configured on the server. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
          code: "RAZORPAY_NOT_CONFIGURED",
        },
        { status: 500 }
      );
    }
    console.log("[RAZORPAY] Credentials configured:", Boolean(rawKeyId && rawKeySecret));
    console.log("[RAZORPAY] Mode:", rawKeyId.startsWith("rzp_test_") ? "test" : rawKeyId.startsWith("rzp_live_") ? "live" : "unknown");
    console.log("[RAZORPAY] Key Prefix:", rawKeyId ? `${rawKeyId.substring(0, 9)}...` : "missing");

    // 3. Initialize Razorpay Order via SDK
    const rzp = getRazorpay();
    const receipt = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const customerFullName = shippingAddress.fullName || shippingAddress.name || "Valued Customer";
    const customerPhone = shippingAddress.phone || "";
    const customerEmail = shippingAddress.email || "";

    const rzpOrder = await rzp.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        userId: authenticatedUserId,
        customerName: customerFullName,
        customerPhone,
        itemCount: String(enrichedItems.length),
      },
    });

    // 4. Generate unique NEKARA Order ID and stage pending order
    // NOTE: INVENTORY IS NOT DECREMENTED HERE. Zero stock deduction until verified payment.
    const orderId = `NK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const orderData = {
      id: orderId,
      userId: authenticatedUserId,
      customerName: customerFullName,
      customerEmail,
      customerPhone,
      customer: {
        name: customerFullName,
        email: customerEmail,
        phone: customerPhone,
      },
      paymentId: null,
      razorpayOrderId: rzpOrder.id,
      razorpayPaymentId: null,
      razorpaySignature: null,
      status: "Pending",
      paymentStatus: "Pending",
      items: enrichedItems,
      totalAmount: serverTotalAmount,
      subtotal: serverTotalAmount,
      shippingFee: 0,
      shippingAddress: {
        ...shippingAddress,
        fullName: customerFullName,
        name: customerFullName,
        email: customerEmail,
        phone: customerPhone,
        house: shippingAddress.house || "",
        area: shippingAddress.area || "",
        landmark: shippingAddress.landmark || "",
        city: shippingAddress.city || "",
        state: shippingAddress.state || "",
        pincode: shippingAddress.pincode || shippingAddress.postalCode || "",
        postalCode: shippingAddress.postalCode || shippingAddress.pincode || "",
      },
      payment: {
        razorpayOrderId: rzpOrder.id,
        razorpayPaymentId: null,
        paymentStatus: "Pending",
        totalAmount: serverTotalAmount,
        currency: "INR",
      },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    try {
      await adminDb.collection("orders").doc(orderId).set(sanitizeFirestoreData(orderData));
      console.log(`[RAZORPAY STAGING] Successfully staged draft order ${orderId} in Firestore via Admin SDK.`);
    } catch (stageErr: any) {
      console.warn(
        `[RAZORPAY STAGING NOTICE] Could not stage draft order in Firestore (${stageErr?.message || stageErr}). Payment gateway will proceed, and order will be finalized upon payment verification.`
      );
    }

    return NextResponse.json({
      success: true,
      orderId,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() || rawKeyId,
    });
  } catch (err: any) {
    console.error("[RAZORPAY CREATE ORDER] VERCEL SERVER ERROR");
    console.error("[RAZORPAY CREATE ORDER] Error type:", err?.name || "Error");
    console.error("[RAZORPAY CREATE ORDER] Error message:", err?.message || String(err));

    // Provide specific diagnostic feedback when Razorpay returns 401 Authentication Failure
    const isAuthFailure =
      err?.statusCode === 401 ||
      (err?.error?.code === "BAD_REQUEST_ERROR" &&
        typeof err?.error?.description === "string" &&
        err.error.description.toLowerCase().includes("authentication failed"));

    if (isAuthFailure) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Razorpay authentication failed (401). Please verify that active RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET from Razorpay Dashboard (Test Mode) are saved in environment variables.",
          code: "RAZORPAY_AUTH_FAILED",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to initialize payment gateway.",
      },
      { status: 500 }
    );
  }
}
