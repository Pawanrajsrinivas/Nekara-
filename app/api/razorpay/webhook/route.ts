import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { completePaidOrder } from "@/lib/orders-server";
import { getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Validate signature if webhook secret is configured
    if (webhookSecret) {
      if (!signature) {
        return NextResponse.json(
          { error: "Missing x-razorpay-signature header" },
          { status: 400 }
        );
      }

      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        console.error("[RAZORPAY WEBHOOK]: Signature mismatch");
        return NextResponse.json(
          { error: "Invalid webhook signature" },
          { status: 400 }
        );
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    console.log(`[RAZORPAY WEBHOOK RECEIVED]: Event: ${event}`);

    // Handle payment.captured or order.paid
    if (event === "payment.captured" || event === "order.paid") {
      const payment = payload.payload?.payment?.entity;
      const razorpayOrderId = payment?.order_id || payload.payload?.order?.entity?.id;
      const razorpayPaymentId = payment?.id;

      if (razorpayOrderId) {
        const adminDb = getAdminDb();
        if (adminDb) {
          let targetOrder: any = null;

          const snap = await adminDb
            .collection("orders")
            .where("razorpayOrderId", "==", razorpayOrderId)
            .get();

          if (!snap.empty) {
            targetOrder = { id: snap.docs[0].id, ...snap.docs[0].data() };
          }

          if (targetOrder) {
            // If order is not yet marked Paid/Confirmed, reconcile it
            if (
              targetOrder.status !== "Confirmed" &&
              targetOrder.status !== "PAID" &&
              targetOrder.paymentStatus !== "Paid"
            ) {
              console.log(
                `[RAZORPAY WEBHOOK]: Reconciling order ${targetOrder.id} for payment ${razorpayPaymentId}`
              );

              await completePaidOrder({
                orderId: targetOrder.id,
                userId: targetOrder.userId,
                paymentId: razorpayPaymentId || `pay_wh_${Date.now()}`,
                razorpayOrderId,
                razorpayPaymentId,
                items: targetOrder.items || [],
                totalAmount: targetOrder.totalAmount,
                subtotal: targetOrder.subtotal,
                shippingFee: targetOrder.shippingFee,
                shippingAddress: targetOrder.shippingAddress,
                customerName: targetOrder.customerName,
                customerEmail: targetOrder.customerEmail,
                customerPhone: targetOrder.customerPhone,
              });
            } else {
              console.log(`[RAZORPAY WEBHOOK]: Order ${targetOrder.id} is already fulfilled.`);
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[RAZORPAY WEBHOOK ERROR]:", err);
    return NextResponse.json(
      { error: err.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}
