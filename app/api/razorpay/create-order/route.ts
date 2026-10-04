import { NextRequest, NextResponse } from "next/server";
import { getRazorpay } from "@/lib/razorpay";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { OrderItem, ShippingAddress } from "@/types/order";

export const dynamic = "force-dynamic";

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
    const body: CreateOrderRequestBody = await req.json();
    const { userId, items, shippingAddress } = body;

    if (!userId || typeof userId !== "string") {
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

    if (!db || typeof db.type !== "string") {
      return NextResponse.json(
        { error: "Database service unavailable." },
        { status: 503 }
      );
    }

    // 1. Fetch live product data from Firestore on the server (Pricing Authority)
    const enrichedItems: OrderItem[] = [];
    let serverTotalAmount = 0;

    for (const item of items) {
      if (!item.productId || typeof item.quantity !== "number" || item.quantity <= 0) {
        return NextResponse.json(
          { error: "Invalid item in cart." },
          { status: 400 }
        );
      }

      const snap = await getDoc(doc(db, "products", item.productId));
      if (!snap.exists()) {
        return NextResponse.json(
          { error: `Product ID "${item.productId}" is not available in catalog.` },
          { status: 400 }
        );
      }

      const prodData = snap.data();

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
          { status: 400 }
        );
      }

      // Server calculates price (NEVER trust client-provided price)
      const unitPrice =
        typeof prodData.salePrice === "number" && prodData.salePrice > 0
          ? prodData.salePrice
          : prodData.price || 0;

      serverTotalAmount += unitPrice * item.quantity;

      enrichedItems.push({
        productId: item.productId,
        name: prodData.name || "Handloom Saree",
        price: unitPrice,
        quantity: item.quantity,
        subtotal: unitPrice * item.quantity,
        image: prodData.thumbnail || prodData.images?.[0] || "",
        slug: prodData.slug || item.productId,
        fabric: prodData.fabric || undefined,
        color: prodData.color || undefined,
        colour: prodData.color || prodData.colour || undefined,
        design: prodData.design || undefined,
        sku: prodData.sku || prodData.productId || undefined,
      });
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
    const rawKeyId = (process.env.RAZORPAY_KEY_ID || "").trim();
    const rawKeySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
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
        userId,
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
      userId,
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
      },
      payment: {
        razorpayOrderId: rzpOrder.id,
        razorpayPaymentId: null,
        paymentStatus: "Pending",
        totalAmount: serverTotalAmount,
        currency: "INR",
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, "orders", orderId), orderData);

    return NextResponse.json({
      success: true,
      orderId,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() || rawKeyId,
    });
  } catch (err: any) {
    console.error("[RAZORPAY CREATE ORDER ERROR]:", err);

    // Provide specific diagnostic feedback when Razorpay returns 401 Authentication Failure
    const isAuthFailure =
      err?.statusCode === 401 ||
      err?.error?.code === "BAD_REQUEST_ERROR" &&
        typeof err?.error?.description === "string" &&
        err.error.description.toLowerCase().includes("authentication failed");

    if (isAuthFailure) {
      return NextResponse.json(
        {
          error:
            "Razorpay authentication failed (401). Please verify that the active RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET from your Razorpay Dashboard (Test Mode) are saved in .env.local and that your Next.js server was restarted.",
          code: "RAZORPAY_AUTH_FAILED",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: err.message || "Failed to initialize payment gateway.",
      },
      { status: 500 }
    );
  }
}
