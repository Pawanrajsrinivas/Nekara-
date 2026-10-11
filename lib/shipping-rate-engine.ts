/**
 * NEKARA — Server-Side Shipping Rate Engine (Delhivery B2C / Kinko API)
 *
 * Responsibilities:
 * 1. Reads shipping configuration from Firestore `settings/shipping` (with safe defaults for origin PIN & weight).
 * 2. Validates 6-digit Indian PIN code and shipping mode ("S" = Surface / Normal, "E" = Express).
 * 3. Verifies PIN serviceability via Delhivery PIN Code Serviceability API.
 * 4. Queries live Delhivery Kinko Invoice Charges API for the exact origin, destination, weight, and mode.
 * 5. NEVER returns a hardcoded ₹150 or ₹0 fallback when Delhivery fails or is unserviceable.
 */

import { getAdminDb } from "./firebase-admin";

export interface ShippingSettingsConfig {
  enabled: boolean;
  provider: "delhivery";
  environment: "staging" | "production";
  originPincode: string;
  shippingMode: "S" | "E"; // Default mode: S = Surface (Normal), E = Express
  surfaceEnabled: boolean;
  expressEnabled: boolean;
  paymentType: "Pre-paid" | "COD";
  defaultSareeWeightGrams: number;
  packagingWeightGrams: number;
  lengthCm: number;
  breadthCm: number;
  heightCm: number;
  freeShippingThreshold: number; // 0 = disabled
  flatExtraHandlingFee: number;
}

export const DEFAULT_SHIPPING_SETTINGS: ShippingSettingsConfig = {
  enabled: true,
  provider: "delhivery",
  environment: "production",
  originPincode: "560064", // Default NEKARA Bengaluru dispatch PIN
  shippingMode: "S",
  surfaceEnabled: true,
  expressEnabled: true,
  paymentType: "Pre-paid",
  defaultSareeWeightGrams: 650,
  packagingWeightGrams: 150,
  lengthCm: 35,
  breadthCm: 28,
  heightCm: 6,
  freeShippingThreshold: 0,
  flatExtraHandlingFee: 0,
};

export interface ShippingRateCalculationInput {
  destinationPincode: string;
  shippingMode?: "S" | "E";
  totalQuantity: number;
  orderSubtotal: number;
}

export interface ShippingRateCalculationResult {
  serviceable: boolean;
  shippingFee: number;
  originPincode: string;
  destinationPincode: string;
  shippingMode: "S" | "E";
  shippingModeLabel: string;
  chargeableWeightGrams: number;
  dimensionsCm: {
    length: number;
    breadth: number;
    height: number;
  };
  quoteSource: "delhivery";
  providerReference?: string;
  message?: string;
  supportedModes?: {
    surface: boolean;
    express: boolean;
    defaultMode: "S" | "E";
  };
}

export class ShippingCalculationError extends Error {
  public code:
    | "INVALID_PINCODE"
    | "UNSERVICEABLE"
    | "MODE_DISABLED"
    | "DELHIVERY_UNAVAILABLE"
    | "INVALID_QUOTE";
  public statusCode: number;

  constructor(
    message: string,
    code:
      | "INVALID_PINCODE"
      | "UNSERVICEABLE"
      | "MODE_DISABLED"
      | "DELHIVERY_UNAVAILABLE"
      | "INVALID_QUOTE",
    statusCode = 400
  ) {
    super(message);
    this.name = "ShippingCalculationError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Fetches shipping settings from Firestore `settings/shipping` or returns defaults.
 */
export async function getShippingSettings(): Promise<ShippingSettingsConfig> {
  try {
    const adminDb = getAdminDb();
    if (!adminDb) return DEFAULT_SHIPPING_SETTINGS;

    const snap = await adminDb.collection("settings").doc("shipping").get();
    if (!snap.exists) {
      return DEFAULT_SHIPPING_SETTINGS;
    }

    const data = snap.data() || {};
    return {
      enabled: data.enabled !== false,
      provider: "delhivery",
      environment: data.environment === "staging" ? "staging" : "production",
      originPincode:
        typeof data.originPincode === "string" && /^\d{6}$/.test(data.originPincode.trim())
          ? data.originPincode.trim()
          : DEFAULT_SHIPPING_SETTINGS.originPincode,
      shippingMode: data.shippingMode === "E" ? "E" : "S",
      surfaceEnabled: data.surfaceEnabled !== false,
      expressEnabled: data.expressEnabled !== false,
      paymentType: "Pre-paid",
      defaultSareeWeightGrams:
        typeof data.defaultSareeWeightGrams === "number" && data.defaultSareeWeightGrams > 0
          ? data.defaultSareeWeightGrams
          : DEFAULT_SHIPPING_SETTINGS.defaultSareeWeightGrams,
      packagingWeightGrams:
        typeof data.packagingWeightGrams === "number" && data.packagingWeightGrams >= 0
          ? data.packagingWeightGrams
          : DEFAULT_SHIPPING_SETTINGS.packagingWeightGrams,
      lengthCm:
        typeof data.lengthCm === "number" && data.lengthCm > 0
          ? data.lengthCm
          : DEFAULT_SHIPPING_SETTINGS.lengthCm,
      breadthCm:
        typeof data.breadthCm === "number" && data.breadthCm > 0
          ? data.breadthCm
          : DEFAULT_SHIPPING_SETTINGS.breadthCm,
      heightCm:
        typeof data.heightCm === "number" && data.heightCm > 0
          ? data.heightCm
          : DEFAULT_SHIPPING_SETTINGS.heightCm,
      freeShippingThreshold:
        typeof data.freeShippingThreshold === "number" && data.freeShippingThreshold >= 0
          ? data.freeShippingThreshold
          : DEFAULT_SHIPPING_SETTINGS.freeShippingThreshold,
      flatExtraHandlingFee:
        typeof data.flatExtraHandlingFee === "number" && data.flatExtraHandlingFee >= 0
          ? data.flatExtraHandlingFee
          : 0,
    };
  } catch (err) {
    console.warn("[SHIPPING ENGINE] Failed to read settings/shipping from Firestore, using defaults:", err);
    return DEFAULT_SHIPPING_SETTINGS;
  }
}

/**
 * Resolves the server-side Delhivery API Token from environment variables.
 * Never exposed to the browser.
 */
function getDelhiveryToken(): string {
  return (
    process.env.DELHIVERY_TOKEN ||
    process.env.DELHIVERY_API_TOKEN ||
    process.env.DELHIVERY_API_KEY ||
    ""
  ).trim();
}

/**
 * Calculates shipping rate for a given destination 6-digit PIN code, mode ("S" or "E"), and item count.
 * Strictly queries Delhivery API — NEVER invents a ₹150 or ₹0 fallback.
 */
export async function calculateShippingRate(
  input: ShippingRateCalculationInput
): Promise<ShippingRateCalculationResult> {
  const cleanDestPin = (input.destinationPincode || "").replace(/\D/g, "");
  if (!/^\d{6}$/.test(cleanDestPin)) {
    throw new ShippingCalculationError(
      "Please enter a valid six-digit delivery PIN code.",
      "INVALID_PINCODE",
      400
    );
  }

  const settings = await getShippingSettings();
  const requestedMode: "S" | "E" =
    input.shippingMode === "E" || input.shippingMode === "S"
      ? input.shippingMode
      : settings.shippingMode;

  if (requestedMode === "E" && !settings.expressEnabled) {
    throw new ShippingCalculationError(
      "Delhivery Express delivery is not currently enabled. Please select Normal (Surface) delivery.",
      "MODE_DISABLED",
      400
    );
  }
  if (requestedMode === "S" && !settings.surfaceEnabled) {
    throw new ShippingCalculationError(
      "Delhivery Surface delivery is not currently enabled. Please select Express delivery.",
      "MODE_DISABLED",
      400
    );
  }

  const modeLabel = requestedMode === "E" ? "Express Delivery" : "Normal Delivery (Surface)";

  const qty = Math.max(1, Math.round(input.totalQuantity || 1));
  const actualWeightGrams =
    qty * settings.defaultSareeWeightGrams + settings.packagingWeightGrams;

  // Volumetric weight in grams: (L * B * H) / 5000 * 1000 => (L * B * H) / 5
  const totalHeightCm = settings.heightCm * Math.min(qty, 5);
  const volumetricWeightGrams = Math.round(
    (settings.lengthCm * settings.breadthCm * totalHeightCm) / 5
  );

  const chargeableWeightGrams = Math.max(actualWeightGrams, volumetricWeightGrams, 500);

  const dimensionsCm = {
    length: settings.lengthCm,
    breadth: settings.breadthCm,
    height: totalHeightCm,
  };

  const delhiveryToken = getDelhiveryToken();
  const isStaging =
    process.env.DELHIVERY_ENV === "staging" || settings.environment === "staging";
  const baseUrl = isStaging
    ? "https://staging-express.delhivery.com"
    : "https://track.delhivery.com";

  if (!delhiveryToken) {
    console.error("[DELHIVERY SHIPPING] DELHIVERY_TOKEN environment variable is missing on the server.");
    throw new ShippingCalculationError(
      "We couldn't calculate the shipping charge right now. Please try again.",
      "DELHIVERY_UNAVAILABLE",
      503
    );
  }

  // 1. Check PIN Code Serviceability
  try {
    const pinUrl = `${baseUrl}/c/api/pin-codes/json/?filter_codes=${encodeURIComponent(cleanDestPin)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const pinRes = await fetch(pinUrl, {
      method: "GET",
      headers: {
        Authorization: `Token ${delhiveryToken}`,
        Accept: "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);

    if (!pinRes.ok) {
      console.error(`[DELHIVERY PIN CHECK] HTTP ${pinRes.status} for PIN ${cleanDestPin}`);
      throw new ShippingCalculationError(
        "We couldn't calculate the shipping charge right now. Please try again.",
        "DELHIVERY_UNAVAILABLE",
        502
      );
    }

    const pinData = await pinRes.json();
    const codes = Array.isArray(pinData?.delivery_codes) ? pinData.delivery_codes : [];

    if (codes.length === 0) {
      throw new ShippingCalculationError(
        "Delhivery does not currently service this destination for the selected delivery method.",
        "UNSERVICEABLE",
        400
      );
    }

    const postalInfo = codes[0]?.postal_code;
    if (postalInfo && postalInfo.pre_paid === "N") {
      throw new ShippingCalculationError(
        "Delhivery does not currently service this destination for the selected delivery method.",
        "UNSERVICEABLE",
        400
      );
    }
  } catch (err: any) {
    if (err instanceof ShippingCalculationError) {
      throw err;
    }
    console.error("[DELHIVERY PIN CHECK ERROR]:", err?.message || err);
    throw new ShippingCalculationError(
      "We couldn't calculate the shipping charge right now. Please try again.",
      "DELHIVERY_UNAVAILABLE",
      502
    );
  }

  // 2. Fetch Live Delhivery Kinko Invoice Charges for Selected Mode (E or S)
  try {
    const rateParams = new URLSearchParams({
      md: requestedMode,
      ss: "Delivered",
      d_pin: cleanDestPin,
      o_pin: settings.originPincode,
      cgm: String(chargeableWeightGrams),
      pt: settings.paymentType,
    });

    const rateUrl = `${baseUrl}/api/kinko/v1/invoice/charges/.json?${rateParams.toString()}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const rateRes = await fetch(rateUrl, {
      method: "GET",
      headers: {
        Authorization: `Token ${delhiveryToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);

    if (!rateRes.ok) {
      console.error(
        `[DELHIVERY RATE API] HTTP ${rateRes.status} for o_pin=${settings.originPincode}, d_pin=${cleanDestPin}, md=${requestedMode}, cgm=${chargeableWeightGrams}`
      );
      throw new ShippingCalculationError(
        "We couldn't calculate the shipping charge right now. Please try again.",
        "DELHIVERY_UNAVAILABLE",
        502
      );
    }

    const rateData = await rateRes.json();
    const quoteEntry = Array.isArray(rateData) ? rateData[0] : rateData;
    const rawTotal =
      quoteEntry?.total_amount ??
      quoteEntry?.totalAmount ??
      quoteEntry?.charge_total;

    const totalCharge = Number(rawTotal);

    if (!Number.isFinite(totalCharge) || totalCharge <= 0) {
      console.warn(
        `[DELHIVERY RATE API] Non-positive or missing total_amount for d_pin=${cleanDestPin}, md=${requestedMode}:`,
        quoteEntry
      );
      throw new ShippingCalculationError(
        "Delhivery does not currently service this destination for the selected delivery method.",
        "UNSERVICEABLE",
        400
      );
    }

    const finalFee = Math.round(totalCharge + (settings.flatExtraHandlingFee || 0));

    return {
      serviceable: true,
      shippingFee: finalFee,
      originPincode: settings.originPincode,
      destinationPincode: cleanDestPin,
      shippingMode: requestedMode,
      shippingModeLabel: modeLabel,
      chargeableWeightGrams,
      dimensionsCm,
      quoteSource: "delhivery",
      providerReference: `DLV-${requestedMode}-${cleanDestPin}-${chargeableWeightGrams}g`,
      message: `Delhivery ${requestedMode === "E" ? "Express" : "Surface"} Delivery to ${cleanDestPin}`,
      supportedModes: {
        surface: settings.surfaceEnabled,
        express: settings.expressEnabled,
        defaultMode: settings.shippingMode,
      },
    };
  } catch (err: any) {
    if (err instanceof ShippingCalculationError) {
      throw err;
    }
    console.error("[DELHIVERY RATE API ERROR]:", err?.message || err);
    throw new ShippingCalculationError(
      "We couldn't calculate the shipping charge right now. Please try again.",
      "DELHIVERY_UNAVAILABLE",
      502
    );
  }
}
