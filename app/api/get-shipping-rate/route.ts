import { NextRequest, NextResponse } from "next/server";
import { calculateShippingRate } from "@/lib/shipping-rate-engine";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pincode, postalCode, quantity = 1, subtotal = 0 } = body || {};

    const rawPin = pincode || postalCode;
    const cleanPin = String(rawPin || "").replace(/\D/g, "");

    if (!cleanPin || cleanPin.length !== 6) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid 6-digit postal PIN code is required to calculate shipping.",
        },
        { status: 400 }
      );
    }

    const totalQty = Math.max(1, Number(quantity) || 1);
    const rateResult = await calculateShippingRate({
      destinationPincode: cleanPin,
      totalQuantity: totalQty,
      orderSubtotal: Number(subtotal) || 0,
    });

    return NextResponse.json({
      success: true,
      serviceable: rateResult.serviceable,
      shippingFee: rateResult.shippingFee,
      originPincode: rateResult.originPincode,
      destinationPincode: rateResult.destinationPincode,
      shippingMode: rateResult.shippingMode,
      chargeableWeightGrams: rateResult.chargeableWeightGrams,
      dimensionsCm: rateResult.dimensionsCm,
      quoteSource: rateResult.quoteSource,
      message: rateResult.message,
    });
  } catch (err: any) {
    console.error("[SHIPPING RATE API ERROR]:", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Failed to calculate delivery rate.",
      },
      { status: 500 }
    );
  }
}
