/**
 * NEKARA — Server-side Logistics & Shipping Rate Engine
 *
 * Integrates with Delhivery One & legacy Kinko APIs for real-time domestic courier rate estimates:
 * - Origin warehouse PIN code (from admin settings, default: 560064)
 * - Destination 6-digit PIN code
 * - Chargeable weight in grams: Max(Dead Weight, Volumetric Weight via L*B*H/5000 in kg => g)
 * - Surface ('S') vs Express ('E') transport modes
 * - Fallback protection with disclosed origin/quote audit snapshots
 */

import { getAdminDb } from "@/lib/firebase-admin";

export interface ShippingRateCalculationResult {
  serviceable: boolean;
  shippingFee: number;
  originPincode: string;
  destinationPincode: string;
  shippingMode: "S" | "E";
  chargeableWeightGrams: number;
  dimensionsCm: {
    length: number;
    breadth: number;
    height: number;
  };
  quoteSource: "delhivery" | "configured_fallback";
  providerReference?: string;
  message?: string;
  estimatedDays?: string;
}

export interface ShippingSettingsSnapshot {
  originPincode: string;
  originWarehouseName?: string;
  defaultPackageWeightGrams: number;
  additionalPackagingWeightGrams: number;
  parcelLengthCm: number;
  parcelBreadthCm: number;
  parcelHeightCm: number;
  shippingMode: "S" | "E";
  liveCalculatorEnabled: boolean;
  allowFallbackOnFailure: boolean;
  fallbackShippingFee: number;
}

export const DEFAULT_SHIPPING_SETTINGS: ShippingSettingsSnapshot = {
  originPincode: "560064",
  originWarehouseName: "NEKARA Bangalore Central Fulfillment",
  defaultPackageWeightGrams: 800,
  additionalPackagingWeightGrams: 200,
  parcelLengthCm: 38,
  parcelBreadthCm: 28,
  parcelHeightCm: 6,
  shippingMode: "S",
  liveCalculatorEnabled: true,
  allowFallbackOnFailure: true,
  fallbackShippingFee: 150,
};

/**
 * Loads trusted shipping settings from Firestore admin configuration or defaults.
 */
export async function getAuthoritativeShippingSettings(): Promise<ShippingSettingsSnapshot> {
  try {
    const adminDb = getAdminDb();
    if (!adminDb) return DEFAULT_SHIPPING_SETTINGS;

    const snap = await adminDb.collection("settings").doc("shipping").get();
    if (!snap.exists) return DEFAULT_SHIPPING_SETTINGS;

    const data = snap.data() || {};
    return {
      originPincode: data.originPincode || DEFAULT_SHIPPING_SETTINGS.originPincode,
      originWarehouseName: data.originWarehouseName || DEFAULT_SHIPPING_SETTINGS.originWarehouseName,
      defaultPackageWeightGrams: Number(data.defaultPackageWeightGrams) || DEFAULT_SHIPPING_SETTINGS.defaultPackageWeightGrams,
      additionalPackagingWeightGrams: Number(data.additionalPackagingWeightGrams) || DEFAULT_SHIPPING_SETTINGS.additionalPackagingWeightGrams,
      parcelLengthCm: Number(data.parcelLengthCm) || DEFAULT_SHIPPING_SETTINGS.parcelLengthCm,
      parcelBreadthCm: Number(data.parcelBreadthCm) || DEFAULT_SHIPPING_SETTINGS.parcelBreadthCm,
      parcelHeightCm: Number(data.parcelHeightCm) || DEFAULT_SHIPPING_SETTINGS.parcelHeightCm,
      shippingMode: data.shippingMode === "E" ? "E" : "S",
      liveCalculatorEnabled: data.liveCalculatorEnabled !== false,
      allowFallbackOnFailure: data.allowFallbackOnFailure !== false,
      fallbackShippingFee: typeof data.fallbackShippingFee === "number" ? data.fallbackShippingFee : DEFAULT_SHIPPING_SETTINGS.fallbackShippingFee,
    };
  } catch (err) {
    console.warn("[SHIPPING ENGINE] Falling back to default settings:", err);
    return DEFAULT_SHIPPING_SETTINGS;
  }
}

/**
 * Calculates authoritative chargeable package weight in grams.
 * Rule: Max(Dead Weight, Volumetric Weight)
 * Volumetric Weight (kg) = (Length × Breadth × Height) / 5000
 */
export function calculateChargeableWeightGrams(
  totalItemQuantity: number,
  settings: ShippingSettingsSnapshot
): {
  deadWeightGrams: number;
  volumetricWeightGrams: number;
  chargeableWeightGrams: number;
  dimensionsCm: { length: number; breadth: number; height: number };
} {
  const quantity = Math.max(1, totalItemQuantity);

  // Scaled dead weight
  const deadWeightGrams =
    quantity * settings.defaultPackageWeightGrams + settings.additionalPackagingWeightGrams;

  // Scaled package height based on quantity of folded sarees
  const effectiveHeight = Math.min(60, settings.parcelHeightCm + (quantity - 1) * 3);

  const volKg = (settings.parcelLengthCm * settings.parcelBreadthCm * effectiveHeight) / 5000;
  const volumetricWeightGrams = Math.round(volKg * 1000);

  const chargeableWeightGrams = Math.max(deadWeightGrams, volumetricWeightGrams);

  return {
    deadWeightGrams,
    volumetricWeightGrams,
    chargeableWeightGrams,
    dimensionsCm: {
      length: settings.parcelLengthCm,
      breadth: settings.parcelBreadthCm,
      height: effectiveHeight,
    },
  };
}

/**
 * Calculates delivery rate for a destination PIN code.
 */
export async function calculateShippingRate(params: {
  destinationPincode: string;
  totalQuantity?: number;
  orderSubtotal?: number;
}): Promise<ShippingRateCalculationResult> {
  const { destinationPincode, totalQuantity = 1 } = params;

  // 1. Validate PIN
  const cleanDestPin = String(destinationPincode || "").replace(/\D/g, "");
  if (cleanDestPin.length !== 6) {
    throw new Error("Invalid destination PIN code. Must be exactly 6 digits.");
  }

  // 2. Load authoritative settings
  const settings = await getAuthoritativeShippingSettings();
  const originPin = (process.env.ORIGIN_PINCODE || settings.originPincode || "560064").trim();

  // 3. Weight calculation
  const weightCalc = calculateChargeableWeightGrams(totalQuantity, settings);

  // 4. If live calculator is disabled, use configured fallback
  if (!settings.liveCalculatorEnabled) {
    return {
      serviceable: true,
      shippingFee: settings.fallbackShippingFee,
      originPincode: originPin,
      destinationPincode: cleanDestPin,
      shippingMode: settings.shippingMode,
      chargeableWeightGrams: weightCalc.chargeableWeightGrams,
      dimensionsCm: weightCalc.dimensionsCm,
      quoteSource: "configured_fallback",
      message: "Standard flat delivery fee applied.",
    };
  }

  // 5. Query Delhivery API if DELHIVERY_TOKEN is configured
  const delhiveryToken = process.env.DELHIVERY_TOKEN?.trim();
  const apiBaseUrl = (
    process.env.DELHIVERY_API_BASE_URL?.trim() ||
    "https://track.delhivery.com"
  ).replace(/\/$/, "");

  if (delhiveryToken) {
    try {
      // Official Delhivery Kinko invoice charges endpoint:
      // GET https://track.delhivery.com/api/kinko/v1/invoice/charges/.json?md=S&ss=Delivered&d_pin=...&o_pin=...&cgm=...&pt=Pre-paid
      const url = new URL(`${apiBaseUrl}/api/kinko/v1/invoice/charges/.json`);
      url.searchParams.set("md", settings.shippingMode); // S or E
      url.searchParams.set("ss", "Delivered");
      url.searchParams.set("d_pin", cleanDestPin);
      url.searchParams.set("o_pin", originPin);
      url.searchParams.set("cgm", String(weightCalc.chargeableWeightGrams));
      url.searchParams.set("pt", "Pre-paid");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Token ${delhiveryToken}`,
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        // Delhivery response format is an array of rate charge objects
        // e.g. [{ total_amount: 142.0, status: "SUCCESS", ... }]
        const chargeObj = Array.isArray(data) ? data[0] : data;
        const totalAmount = chargeObj?.total_amount || chargeObj?.total_charge;

        if (typeof totalAmount === "number" && totalAmount > 0) {
          return {
            serviceable: true,
            shippingFee: Math.ceil(totalAmount),
            originPincode: originPin,
            destinationPincode: cleanDestPin,
            shippingMode: settings.shippingMode,
            chargeableWeightGrams: weightCalc.chargeableWeightGrams,
            dimensionsCm: weightCalc.dimensionsCm,
            quoteSource: "delhivery",
            providerReference: chargeObj?.charge_id || undefined,
            message: "Live courier rate calculated via Delhivery logistics network.",
          };
        }
      } else {
        console.warn(`[DELHIVERY API NON-OK]: Status ${res.status}`);
      }
    } catch (apiErr: any) {
      console.warn("[DELHIVERY API ESTIMATE ERROR]:", apiErr.message);
    }
  }

  // 6. Safe Fallback handling
  if (settings.allowFallbackOnFailure) {
    return {
      serviceable: true,
      shippingFee: settings.fallbackShippingFee,
      originPincode: originPin,
      destinationPincode: cleanDestPin,
      shippingMode: settings.shippingMode,
      chargeableWeightGrams: weightCalc.chargeableWeightGrams,
      dimensionsCm: weightCalc.dimensionsCm,
      quoteSource: "configured_fallback",
      message: delhiveryToken
        ? "Standard express shipping rate applied (live gateway quote pending)."
        : "Standard express delivery rate applied.",
    };
  }

  throw new Error(
    "Destination PIN code could not be verified with live courier logistics and fallback is disabled."
  );
}
