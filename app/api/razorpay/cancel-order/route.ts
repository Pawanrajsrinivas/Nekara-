import { NextRequest, NextResponse } from "next/server";
import { cancelOrFailOrder } from "@/lib/orders-server";
import { isFirebaseAdminConfigured } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Handles customer checkout dismissal or payment failure.
 * Updates order to "Cancelled" or "Failed" without altering inventory.
 */
export async function POST(req: NextRequest) {
  try {
    if (!isFirebaseAdminConfigured()) {
      return NextResponse.json(
        { error: "Server database configuration is missing." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { orderId, reason, status: requestedStatus, userId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required." },
        { status: 400 }
      );
    }

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
        console.warn("[CANCEL ORDER] Token parsing warning:", tokenErr);
      }
    }

    const paymentStatus: "Cancelled" | "Failed" =
      requestedStatus === "Failed" || requestedStatus === "failed"
        ? "Failed"
        : "Cancelled";

    const result = await cancelOrFailOrder({
      orderId,
      userId: authenticatedUserId,
      paymentStatus,
      reason,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId,
      status: paymentStatus,
    });
  } catch (err: any) {
    console.error("[CANCEL ORDER API ERROR]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process cancellation." },
      { status: 500 }
    );
  }
}
