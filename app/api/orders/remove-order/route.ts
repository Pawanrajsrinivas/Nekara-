import { NextRequest, NextResponse } from "next/server";
import { softDeleteCustomerOrder } from "@/lib/orders-server";
import { isFirebaseAdminConfigured } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Handles customer request to remove an eligible cancelled or failed order.
 * Strictly prevents removing successfully paid, confirmed, or active orders.
 * Performs an audit-safe soft-delete (hiddenFromCustomer: true).
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
    const { orderId, userId } = body;

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
        console.warn("[REMOVE ORDER] Token parsing warning:", tokenErr);
      }
    }

    if (!authenticatedUserId) {
      return NextResponse.json(
        { error: "Authentication required to remove order." },
        { status: 401 }
      );
    }

    const result = await softDeleteCustomerOrder({
      orderId,
      userId: authenticatedUserId,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Unable to remove order." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order successfully removed from your purchase history.",
      orderId,
    });
  } catch (err: any) {
    console.error("[REMOVE ORDER ERROR]:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
