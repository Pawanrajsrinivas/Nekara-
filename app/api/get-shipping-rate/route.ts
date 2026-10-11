import { NextRequest, NextResponse } from "next/server";
import {
  calculateShippingRate,
  getShippingSettings,
  ShippingCalculationError,
} from "@/lib/shipping-rate-engine";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const settings = await getShippingSettings();
    return NextResponse.json({
      success: true,
      supportedModes: {
        surface: settings.surfaceEnabled,
        express: settings.expressEnabled,
        defaultMode: settings.shippingMode,
      },
      originPincode: settings.originPincode,
    });
  } catch {
    return NextResponse.json({
      success: true,
      supportedModes: {
        surface: true,
        express: true,
        defaultMode: "S",
      },
      originPincode: "560064",
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const postalCode = (body.postalCode || body.pincode || "")
      .toString()
      .replace(/\D/g, "");
    const rawMode = (body.shippingMode || body.mode || "S").toString().toUpperCase();
    const shippingMode: "S" | "E" = rawMode === "E" ? "E" : "S";
    const quantity = Number(body.quantity || body.totalQuantity || 1);
    const subtotal = Number(body.subtotal || body.orderSubtotal || 0);

    if (!postalCode || postalCode.length !== 6) {
      return NextResponse.json(
        {
          success: false,
          serviceable: false,
          code: "INVALID_PINCODE",
          error: "Please enter a valid six-digit delivery PIN code.",
          message: "Please enter a valid six-digit delivery PIN code.",
        },
        { status: 400 }
      );
    }

    const result = await calculateShippingRate({
      destinationPincode: postalCode,
      shippingMode,
      totalQuantity: quantity > 0 ? quantity : 1,
      orderSubtotal: subtotal >= 0 ? subtotal : 0,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    if (err instanceof ShippingCalculationError) {
      return NextResponse.json(
        {
          success: false,
          serviceable: false,
          code: err.code,
          error: err.message,
          message: err.message,
        },
        { status: err.statusCode || 400 }
      );
    }

    console.error("[GET SHIPPING RATE API ERROR]:", err);
    return NextResponse.json(
      {
        success: false,
        serviceable: false,
        code: "DELHIVERY_UNAVAILABLE",
        error: "We couldn't calculate the shipping charge right now. Please try again.",
        message: "We couldn't calculate the shipping charge right now. Please try again.",
      },
      { status: 502 }
    );
  }
}
