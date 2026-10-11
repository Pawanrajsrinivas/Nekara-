import { NextRequest, NextResponse } from "next/server";
import {
  calculateShippingRate,
  computeShippingRateFromConfig,
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
      rateCardVersion: settings.rateCardVersion,
      rateCardStatus: settings.rateCardStatus,
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
    const rawPostalCode = (body.postalCode ?? body.pincode ?? "").toString().trim();
    const rawMode = (body.shippingMode || body.mode || "S").toString().toUpperCase();
    const shippingMode: "S" | "E" = rawMode === "E" ? "E" : "S";
    const quantity = Number(body.quantity || body.totalQuantity || 1);
    const subtotal = Number(body.subtotal || body.orderSubtotal || 0);
    const itemWeightsGrams = Array.isArray(body.itemWeightsGrams)
      ? body.itemWeightsGrams
      : undefined;

    if (!/^\d{6}$/.test(rawPostalCode)) {
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

    const settings = await getShippingSettings();
    const calcInput = {
      destinationPincode: rawPostalCode,
      shippingMode,
      totalQuantity: quantity > 0 ? quantity : 1,
      orderSubtotal: subtotal >= 0 ? subtotal : 0,
      itemWeightsGrams,
    };

    const result = await calculateShippingRate(calcInput, settings);

    // Also compute estimates for both modes so checkout option cards can display both estimated rates
    let surfaceEstimate: { shippingFee: number; estimatedDeliveryText: string } | null = null;
    let expressEstimate: { shippingFee: number; estimatedDeliveryText: string } | null = null;

    if (settings.surfaceEnabled) {
      try {
        const sRes = computeShippingRateFromConfig(
          { ...calcInput, shippingMode: "S" },
          settings
        );
        surfaceEstimate = {
          shippingFee: sRes.shippingFee,
          estimatedDeliveryText: sRes.estimatedDeliveryText,
        };
      } catch {
        surfaceEstimate = null;
      }
    }

    if (settings.expressEnabled) {
      try {
        const eRes = computeShippingRateFromConfig(
          { ...calcInput, shippingMode: "E" },
          settings
        );
        expressEstimate = {
          shippingFee: eRes.shippingFee,
          estimatedDeliveryText: eRes.estimatedDeliveryText,
        };
      } catch {
        expressEstimate = null;
      }
    }

    return NextResponse.json({
      success: true,
      ...result,
      modeEstimates: {
        S: surfaceEstimate,
        E: expressEstimate,
      },
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
        code: "INVALID_QUOTE",
        error: "Unable to calculate estimated shipping charge for this destination.",
        message: "Unable to calculate estimated shipping charge for this destination.",
      },
      { status: 400 }
    );
  }
}
