/**
 * NEKARA — Server-Side Internal Shipping Estimation Engine
 *
 * Responsibilities:
 * 1. Reads configurable shipping rate-card settings from Firestore `settings/shipping`
 *    (with proposed initial rate-card defaults requiring owner approval).
 * 2. Validates 6-digit Indian PIN code and shipping mode ("S" = Normal Surface, "E" = Express Delivery).
 * 3. Resolves destination zone from configured PIN code prefix mappings (longest-prefix match).
 * 4. Computes actual weight, volumetric weight (from configurable divisor), chargeable weight,
 *    and weight slabs deterministically without calling external courier pricing APIs.
 * 5. Clearly labels all results as internal estimates (`quoteSource: "internal_rate_card"`)
 *    and indicates that courier serviceability is subject to confirmation.
 */

export interface ShippingModeRateRule {
  baseCharge: number; // Base charge for initial weight slab (INR)
  additionalSlabCharge: number; // Incremental charge per additional weight slab (INR)
  remoteAreaSurcharge?: number; // Optional remote/special zone surcharge (INR)
  estimatedDeliveryText: string; // e.g., "4–6 business days"
}

export interface ShippingZoneConfig {
  id: string;
  name: string;
  description: string;
  pinPrefixes: string[]; // 2-digit or 3-digit PIN prefixes (e.g. ["560"] or ["56", "57", "58", "59"])
  surface: ShippingModeRateRule;
  express: ShippingModeRateRule;
}

export interface ShippingSettingsConfig {
  enabled: boolean;
  rateCardVersion: string;
  rateCardStatus: "proposed_estimate_requires_owner_approval" | "owner_approved";
  originPincode: string;
  shippingMode: "S" | "E"; // Default mode: S = Normal Surface, E = Express Delivery
  surfaceEnabled: boolean;
  expressEnabled: boolean;
  defaultSareeWeightGrams: number;
  packagingWeightGrams: number;
  lengthCm: number;
  breadthCm: number;
  heightCm: number;
  volumetricDivisor: number; // Initial setting (5000); configurable per courier contract
  initialWeightSlabGrams: number; // Default 500g
  additionalWeightSlabGrams: number; // Default 500g
  freeShippingThreshold: number; // 0 = disabled
  flatExtraHandlingFee: number;
  insuranceEnabled: boolean;
  insurancePercentage: number; // Applied to orderSubtotal only when insuranceEnabled === true
  unmappedDestinationPolicy: "error" | "fallback_zone";
  fallbackZone?: {
    name: string;
    surface: ShippingModeRateRule;
    express: ShippingModeRateRule;
  } | null;
  zones: ShippingZoneConfig[];
}

/**
 * Proposed initial shipping rate-card settings.
 * IMPORTANT: These values are proposed internal estimates for NEKARA's Bengaluru (560064)
 * dispatch operations and require owner review/approval in Admin -> Settings -> Shipping.
 * They are NOT claimed to be Delhivery's exact contracted invoice rates.
 */
export const DEFAULT_SHIPPING_ZONES: ShippingZoneConfig[] = [
  {
    id: "LOCAL_CITY",
    name: "Zone A — Local Origin City (Bengaluru)",
    description: "Bengaluru Urban & local surrounding PIN codes (560xxx)",
    pinPrefixes: ["560"],
    surface: {
      baseCharge: 65,
      additionalSlabCharge: 25,
      estimatedDeliveryText: "2–4 business days",
    },
    express: {
      baseCharge: 105,
      additionalSlabCharge: 40,
      estimatedDeliveryText: "1–2 business days",
    },
  },
  {
    id: "INTRA_STATE",
    name: "Zone B — Intra-State (Rest of Karnataka)",
    description: "Karnataka state PIN codes outside 560xxx (56xxxx–59xxxx)",
    pinPrefixes: ["56", "57", "58", "59"],
    surface: {
      baseCharge: 90,
      additionalSlabCharge: 35,
      estimatedDeliveryText: "3–5 business days",
    },
    express: {
      baseCharge: 145,
      additionalSlabCharge: 55,
      estimatedDeliveryText: "2–3 business days",
    },
  },
  {
    id: "SOUTH_NEIGHBORING",
    name: "Zone C — South & Neighboring States",
    description: "Tamil Nadu, Kerala, Telangana, Andhra Pradesh, Maharashtra, Goa",
    pinPrefixes: [
      "50",
      "51",
      "52",
      "53",
      "60",
      "61",
      "62",
      "63",
      "64",
      "67",
      "68",
      "69",
      "40",
      "41",
      "42",
      "43",
      "44",
    ],
    surface: {
      baseCharge: 115,
      additionalSlabCharge: 45,
      estimatedDeliveryText: "4–6 business days",
    },
    express: {
      baseCharge: 185,
      additionalSlabCharge: 65,
      estimatedDeliveryText: "2–4 business days",
    },
  },
  {
    id: "NATIONAL_MAINLAND",
    name: "Zone D — Rest of Mainland India",
    description: "North, West, Central & East India mainland postal circles",
    pinPrefixes: [
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "20",
      "21",
      "22",
      "23",
      "24",
      "25",
      "26",
      "27",
      "28",
      "30",
      "31",
      "32",
      "33",
      "34",
      "36",
      "37",
      "38",
      "39",
      "45",
      "46",
      "47",
      "48",
      "49",
      "70",
      "71",
      "72",
      "73",
      "74",
      "75",
      "76",
      "77",
      "80",
      "81",
      "82",
      "83",
      "84",
      "85",
    ],
    surface: {
      baseCharge: 140,
      additionalSlabCharge: 55,
      estimatedDeliveryText: "5–8 business days",
    },
    express: {
      baseCharge: 225,
      additionalSlabCharge: 85,
      estimatedDeliveryText: "3–5 business days",
    },
  },
  {
    id: "SPECIAL_REMOTE",
    name: "Zone E — North East, Hills & Island Territories",
    description: "Himachal Pradesh, J&K, Ladakh, North East states, Andaman & Lakshadweep",
    pinPrefixes: ["17", "18", "19", "78", "79", "744", "682"],
    surface: {
      baseCharge: 180,
      additionalSlabCharge: 75,
      estimatedDeliveryText: "7–10 business days",
    },
    express: {
      baseCharge: 290,
      additionalSlabCharge: 110,
      estimatedDeliveryText: "4–6 business days",
    },
  },
];

export const DEFAULT_SHIPPING_SETTINGS: ShippingSettingsConfig = {
  enabled: true,
  rateCardVersion: "v1-internal-estimate",
  rateCardStatus: "proposed_estimate_requires_owner_approval",
  originPincode: "560064", // Default NEKARA Bengaluru dispatch PIN
  shippingMode: "S",
  surfaceEnabled: true,
  expressEnabled: true,
  defaultSareeWeightGrams: 650,
  packagingWeightGrams: 150,
  lengthCm: 35,
  breadthCm: 28,
  heightCm: 6,
  volumetricDivisor: 5000, // Configurable divisor (cm^3 per kg); verify against courier contract
  initialWeightSlabGrams: 500,
  additionalWeightSlabGrams: 500,
  freeShippingThreshold: 0,
  flatExtraHandlingFee: 0,
  insuranceEnabled: false,
  insurancePercentage: 0,
  unmappedDestinationPolicy: "error",
  fallbackZone: null,
  zones: DEFAULT_SHIPPING_ZONES,
};

export interface ShippingRateCalculationInput {
  destinationPincode: string;
  shippingMode?: "S" | "E";
  totalQuantity: number;
  orderSubtotal: number;
  itemWeightsGrams?: number[]; // Optional per-item weights if products specify custom weights
  customDimensionsCm?: {
    length: number;
    breadth: number;
    height: number;
  };
}

export interface ShippingRateCalculationResult {
  serviceable: boolean;
  serviceabilityVerified: boolean;
  serviceabilityNote: string;
  shippingFee: number;
  originPincode: string;
  destinationPincode: string;
  zoneId: string;
  zoneName: string;
  shippingMode: "S" | "E";
  shippingModeLabel: string;
  estimatedDeliveryText: string;
  actualWeightGrams: number;
  volumetricWeightGrams: number;
  chargeableWeightGrams: number;
  initialWeightSlabGrams: number;
  additionalWeightSlabGrams: number;
  additionalSlabsCount: number;
  baseCharge: number;
  additionalWeightCharge: number;
  surchargeAmount: number;
  insuranceCharge: number;
  dimensionsCm: {
    length: number;
    breadth: number;
    height: number;
  };
  quoteSource: "internal_rate_card";
  rateCardVersion: string;
  rateCardStatus: "proposed_estimate_requires_owner_approval" | "owner_approved";
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
    | "UNMAPPED_DESTINATION"
    | "MODE_DISABLED"
    | "MISSING_RATE_CONFIG"
    | "INVALID_QUOTE";
  public statusCode: number;

  constructor(
    message: string,
    code:
      | "INVALID_PINCODE"
      | "UNMAPPED_DESTINATION"
      | "MODE_DISABLED"
      | "MISSING_RATE_CONFIG"
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
 * Normalizes and validates raw Firestore settings into a complete ShippingSettingsConfig.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeShippingSettings(rawData: Record<string, any> = {}): ShippingSettingsConfig {
  let zones: ShippingZoneConfig[] = DEFAULT_SHIPPING_ZONES;

  if (Array.isArray(rawData.zones) && rawData.zones.length > 0) {
    zones = rawData.zones
      .filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (z: any) =>
          z &&
          typeof z.id === "string" &&
          typeof z.name === "string" &&
          Array.isArray(z.pinPrefixes) &&
          z.surface &&
          z.express
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((z: any) => ({
        id: String(z.id).trim(),
        name: String(z.name).trim(),
        description: String(z.description || "").trim(),
        pinPrefixes: z.pinPrefixes
          .map((p: unknown) => String(p).replace(/\D/g, ""))
          .filter((p: string) => p.length > 0),
        surface: {
          baseCharge: Math.max(0, Number(z.surface?.baseCharge) || 0),
          additionalSlabCharge: Math.max(0, Number(z.surface?.additionalSlabCharge) || 0),
          remoteAreaSurcharge: Math.max(0, Number(z.surface?.remoteAreaSurcharge) || 0),
          estimatedDeliveryText:
            z.surface?.estimatedDeliveryText
              ? String(z.surface.estimatedDeliveryText).trim()
              : z.surface?.estimatedDaysMin && z.surface?.estimatedDaysMax
              ? `${z.surface.estimatedDaysMin}–${z.surface.estimatedDaysMax} business days`
              : "4–7 business days",
        },
        express: {
          baseCharge: Math.max(0, Number(z.express?.baseCharge) || 0),
          additionalSlabCharge: Math.max(0, Number(z.express?.additionalSlabCharge) || 0),
          remoteAreaSurcharge: Math.max(0, Number(z.express?.remoteAreaSurcharge) || 0),
          estimatedDeliveryText:
            z.express?.estimatedDeliveryText
              ? String(z.express.estimatedDeliveryText).trim()
              : z.express?.estimatedDaysMin && z.express?.estimatedDaysMax
              ? `${z.express.estimatedDaysMin}–${z.express.estimatedDaysMax} business days`
              : "2–4 business days",
        },
      }));
  } else if (rawData.zones && typeof rawData.zones === "object" && !Array.isArray(rawData.zones)) {
    zones = DEFAULT_SHIPPING_ZONES.map((defZone) => {
      const custom = rawData.zones[defZone.id];
      if (!custom) return defZone;
      const customSurface = custom.surface || {};
      const customExpress = custom.express || {};
      return {
        id: defZone.id,
        name: typeof custom.name === "string" && custom.name.trim() ? custom.name.trim() : defZone.name,
        description:
          typeof custom.description === "string" && custom.description.trim()
            ? custom.description.trim()
            : defZone.description,
        pinPrefixes: Array.isArray(custom.pinPrefixes) && custom.pinPrefixes.length > 0
          ? custom.pinPrefixes.map((p: unknown) => String(p).replace(/\D/g, "")).filter(Boolean)
          : defZone.pinPrefixes,
        surface: {
          baseCharge: Math.max(0, Number(customSurface.baseCharge ?? defZone.surface.baseCharge) || 0),
          additionalSlabCharge: Math.max(
            0,
            Number(customSurface.additionalSlabCharge ?? defZone.surface.additionalSlabCharge) || 0
          ),
          remoteAreaSurcharge: Math.max(0, Number(customSurface.remoteAreaSurcharge || 0)),
          estimatedDeliveryText: customSurface.estimatedDeliveryText
            ? String(customSurface.estimatedDeliveryText).trim()
            : customSurface.estimatedDaysMin && customSurface.estimatedDaysMax
            ? `${customSurface.estimatedDaysMin}–${customSurface.estimatedDaysMax} business days`
            : defZone.surface.estimatedDeliveryText,
        },
        express: {
          baseCharge: Math.max(0, Number(customExpress.baseCharge ?? defZone.express.baseCharge) || 0),
          additionalSlabCharge: Math.max(
            0,
            Number(customExpress.additionalSlabCharge ?? defZone.express.additionalSlabCharge) || 0
          ),
          remoteAreaSurcharge: Math.max(0, Number(customExpress.remoteAreaSurcharge || 0)),
          estimatedDeliveryText: customExpress.estimatedDeliveryText
            ? String(customExpress.estimatedDeliveryText).trim()
            : customExpress.estimatedDaysMin && customExpress.estimatedDaysMax
            ? `${customExpress.estimatedDaysMin}–${customExpress.estimatedDaysMax} business days`
            : defZone.express.estimatedDeliveryText,
        },
      };
    });
  }

  const useFallbackZone =
    rawData.unmappedDestinationPolicy === "fallback_zone" ||
    rawData.unmappedDestinationPolicy === "use_fallback_zone";

  let fallbackZoneObj: ShippingSettingsConfig["fallbackZone"] = null;
  if (
    rawData.fallbackZone &&
    typeof rawData.fallbackZone === "object" &&
    rawData.fallbackZone.surface &&
    rawData.fallbackZone.express
  ) {
    fallbackZoneObj = {
      name: String(rawData.fallbackZone.name || "Standard Fallback Zone"),
      surface: {
        baseCharge: Math.max(0, Number(rawData.fallbackZone.surface.baseCharge) || 0),
        additionalSlabCharge: Math.max(
          0,
          Number(rawData.fallbackZone.surface.additionalSlabCharge) || 0
        ),
        remoteAreaSurcharge: Math.max(
          0,
          Number(rawData.fallbackZone.surface.remoteAreaSurcharge) || 0
        ),
        estimatedDeliveryText: String(
          rawData.fallbackZone.surface.estimatedDeliveryText || "6–9 business days"
        ),
      },
      express: {
        baseCharge: Math.max(0, Number(rawData.fallbackZone.express.baseCharge) || 0),
        additionalSlabCharge: Math.max(
          0,
          Number(rawData.fallbackZone.express.additionalSlabCharge) || 0
        ),
        remoteAreaSurcharge: Math.max(
          0,
          Number(rawData.fallbackZone.express.remoteAreaSurcharge) || 0
        ),
        estimatedDeliveryText: String(
          rawData.fallbackZone.express.estimatedDeliveryText || "4–6 business days"
        ),
      },
    };
  } else if (useFallbackZone) {
    const targetZoneId =
      typeof rawData.fallbackZone === "string" && rawData.fallbackZone
        ? rawData.fallbackZone
        : "NATIONAL_MAINLAND";
    const found =
      zones.find((z) => z.id === targetZoneId) ||
      DEFAULT_SHIPPING_ZONES.find((z) => z.id === "NATIONAL_MAINLAND")!;
    fallbackZoneObj = {
      name: found.name,
      surface: found.surface,
      express: found.express,
    };
  }

  return {
    enabled: rawData.enabled !== false,
    rateCardVersion:
      typeof rawData.rateCardVersion === "string" && rawData.rateCardVersion.trim()
        ? rawData.rateCardVersion.trim()
        : DEFAULT_SHIPPING_SETTINGS.rateCardVersion,
    rateCardStatus:
      rawData.rateCardStatus === "owner_approved"
        ? "owner_approved"
        : "proposed_estimate_requires_owner_approval",
    originPincode:
      typeof rawData.originPincode === "string" && /^\d{6}$/.test(rawData.originPincode.trim())
        ? rawData.originPincode.trim()
        : DEFAULT_SHIPPING_SETTINGS.originPincode,
    shippingMode: rawData.shippingMode === "E" ? "E" : "S",
    surfaceEnabled: rawData.surfaceEnabled !== false,
    expressEnabled: rawData.expressEnabled !== false,
    defaultSareeWeightGrams:
      typeof rawData.defaultSareeWeightGrams === "number" && rawData.defaultSareeWeightGrams > 0
        ? rawData.defaultSareeWeightGrams
        : DEFAULT_SHIPPING_SETTINGS.defaultSareeWeightGrams,
    packagingWeightGrams:
      typeof rawData.packagingWeightGrams === "number" && rawData.packagingWeightGrams >= 0
        ? rawData.packagingWeightGrams
        : DEFAULT_SHIPPING_SETTINGS.packagingWeightGrams,
    lengthCm:
      typeof rawData.lengthCm === "number" && rawData.lengthCm > 0
        ? rawData.lengthCm
        : DEFAULT_SHIPPING_SETTINGS.lengthCm,
    breadthCm:
      typeof rawData.breadthCm === "number" && rawData.breadthCm > 0
        ? rawData.breadthCm
        : DEFAULT_SHIPPING_SETTINGS.breadthCm,
    heightCm:
      typeof rawData.heightCm === "number" && rawData.heightCm > 0
        ? rawData.heightCm
        : DEFAULT_SHIPPING_SETTINGS.heightCm,
    volumetricDivisor:
      typeof rawData.volumetricDivisor === "number" && rawData.volumetricDivisor > 0
        ? rawData.volumetricDivisor
        : DEFAULT_SHIPPING_SETTINGS.volumetricDivisor,
    initialWeightSlabGrams:
      typeof rawData.initialWeightSlabGrams === "number" && rawData.initialWeightSlabGrams > 0
        ? rawData.initialWeightSlabGrams
        : DEFAULT_SHIPPING_SETTINGS.initialWeightSlabGrams,
    additionalWeightSlabGrams:
      typeof rawData.additionalWeightSlabGrams === "number" && rawData.additionalWeightSlabGrams > 0
        ? rawData.additionalWeightSlabGrams
        : DEFAULT_SHIPPING_SETTINGS.additionalWeightSlabGrams,
    freeShippingThreshold:
      typeof rawData.freeShippingThreshold === "number" && rawData.freeShippingThreshold >= 0
        ? rawData.freeShippingThreshold
        : DEFAULT_SHIPPING_SETTINGS.freeShippingThreshold,
    flatExtraHandlingFee:
      typeof rawData.flatExtraHandlingFee === "number" && rawData.flatExtraHandlingFee >= 0
        ? rawData.flatExtraHandlingFee
        : 0,
    insuranceEnabled: Boolean(rawData.insuranceEnabled),
    insurancePercentage:
      typeof rawData.insurancePercentage === "number" && rawData.insurancePercentage >= 0
        ? rawData.insurancePercentage
        : 0,
    unmappedDestinationPolicy: useFallbackZone ? "fallback_zone" : "error",
    fallbackZone: fallbackZoneObj,
    zones,
  };
}

/**
 * Fetches shipping settings from Firestore `settings/shipping` or returns defaults.
 */
export async function getShippingSettings(): Promise<ShippingSettingsConfig> {
  try {
    const { getAdminDb } = await import("./firebase-admin");
    const adminDb = getAdminDb();
    if (!adminDb) return DEFAULT_SHIPPING_SETTINGS;

    const snap = await adminDb.collection("settings").doc("shipping").get();
    if (!snap.exists) {
      return DEFAULT_SHIPPING_SETTINGS;
    }

    return normalizeShippingSettings(snap.data() || {});
  } catch (err) {
    console.warn(
      "[SHIPPING ENGINE] Failed to read settings/shipping from Firestore, using default rate card:",
      err
    );
    return DEFAULT_SHIPPING_SETTINGS;
  }
}

/**
 * Resolves the destination zone from configured PIN prefixes using longest-prefix matching.
 * Never uses numeric subtraction between PIN codes as physical distance.
 */
export function resolveDestinationZone(
  destinationPincode: string,
  settings: ShippingSettingsConfig
): { zoneId: string; zoneName: string; surface: ShippingModeRateRule; express: ShippingModeRateRule } | null {
  if (!Array.isArray(settings.zones) || settings.zones.length === 0) {
    return null;
  }

  let bestMatch: {
    prefixLen: number;
    zone: ShippingZoneConfig;
  } | null = null;

  for (const zone of settings.zones) {
    if (!Array.isArray(zone.pinPrefixes)) continue;
    for (const rawPrefix of zone.pinPrefixes) {
      const prefix = String(rawPrefix).trim();
      if (!prefix) continue;
      if (destinationPincode.startsWith(prefix)) {
        if (!bestMatch || prefix.length > bestMatch.prefixLen) {
          bestMatch = { prefixLen: prefix.length, zone };
        }
      }
    }
  }

  if (bestMatch) {
    return {
      zoneId: bestMatch.zone.id,
      zoneName: bestMatch.zone.name,
      surface: bestMatch.zone.surface,
      express: bestMatch.zone.express,
    };
  }

  if (settings.unmappedDestinationPolicy === "fallback_zone" && settings.fallbackZone) {
    return {
      zoneId: "FALLBACK_DEFAULT",
      zoneName: settings.fallbackZone.name,
      surface: settings.fallbackZone.surface,
      express: settings.fallbackZone.express,
    };
  }

  return null;
}

/**
 * Pure, deterministic shipping rate calculation function.
 * Can be called directly with a configuration object for unit testing or server calculation.
 */
export function computeShippingRateFromConfig(
  input: ShippingRateCalculationInput,
  settings: ShippingSettingsConfig
): ShippingRateCalculationResult {
  if (!settings || settings.enabled === false) {
    throw new ShippingCalculationError(
      "Shipping rate configuration is currently disabled or unavailable.",
      "MISSING_RATE_CONFIG",
      400
    );
  }

  const rawPin = (input.destinationPincode || "").trim();
  // Must be exactly 6 numeric digits (no letters or punctuation)
  if (!/^\d{6}$/.test(rawPin)) {
    throw new ShippingCalculationError(
      "Please enter a valid six-digit delivery PIN code.",
      "INVALID_PINCODE",
      400
    );
  }

  const cleanDestPin = rawPin;

  const requestedMode: "S" | "E" =
    input.shippingMode === "E" || input.shippingMode === "S"
      ? input.shippingMode
      : settings.shippingMode;

  if (requestedMode === "E" && !settings.expressEnabled) {
    throw new ShippingCalculationError(
      "Express Delivery is not currently enabled. Please select Normal Surface delivery.",
      "MODE_DISABLED",
      400
    );
  }
  if (requestedMode === "S" && !settings.surfaceEnabled) {
    throw new ShippingCalculationError(
      "Normal Surface delivery is not currently enabled. Please select Express Delivery.",
      "MODE_DISABLED",
      400
    );
  }

  if (!Array.isArray(settings.zones) || settings.zones.length === 0) {
    throw new ShippingCalculationError(
      "Shipping rate not configured for this destination",
      "MISSING_RATE_CONFIG",
      400
    );
  }

  const resolvedZone = resolveDestinationZone(cleanDestPin, settings);
  if (!resolvedZone) {
    throw new ShippingCalculationError(
      "Shipping rate not configured for this destination",
      "UNMAPPED_DESTINATION",
      400
    );
  }

  const modeRule = requestedMode === "E" ? resolvedZone.express : resolvedZone.surface;
  if (
    !modeRule ||
    typeof modeRule.baseCharge !== "number" ||
    !Number.isFinite(modeRule.baseCharge) ||
    modeRule.baseCharge <= 0
  ) {
    throw new ShippingCalculationError(
      "Shipping rate not configured for this destination",
      "MISSING_RATE_CONFIG",
      400
    );
  }

  const qty = Math.max(1, Math.round(input.totalQuantity || 1));

  // Calculate actual parcel weight from item weights if provided, otherwise default saree weight * qty + packaging
  const defaultSareeWeight =
    settings.defaultSareeWeightGrams > 0 ? settings.defaultSareeWeightGrams : 650;
  const packagingWeight =
    settings.packagingWeightGrams >= 0 ? settings.packagingWeightGrams : 150;

  let itemsWeightGrams = 0;
  if (Array.isArray(input.itemWeightsGrams) && input.itemWeightsGrams.length > 0) {
    itemsWeightGrams = input.itemWeightsGrams.reduce(
      (sum, w) => sum + (typeof w === "number" && w > 0 ? w : defaultSareeWeight),
      0
    );
  } else {
    itemsWeightGrams = qty * defaultSareeWeight;
  }

  const actualWeightGrams = Math.round(itemsWeightGrams + packagingWeight);

  // Dimensions & Volumetric Weight calculation
  const lengthCm =
    input.customDimensionsCm?.length && input.customDimensionsCm.length > 0
      ? input.customDimensionsCm.length
      : settings.lengthCm > 0
      ? settings.lengthCm
      : 35;
  const breadthCm =
    input.customDimensionsCm?.breadth && input.customDimensionsCm.breadth > 0
      ? input.customDimensionsCm.breadth
      : settings.breadthCm > 0
      ? settings.breadthCm
      : 28;
  const unitHeightCm = settings.heightCm > 0 ? settings.heightCm : 6;
  const totalHeightCm =
    input.customDimensionsCm?.height && input.customDimensionsCm.height > 0
      ? input.customDimensionsCm.height
      : unitHeightCm * Math.min(qty, 6);

  const divisor = settings.volumetricDivisor > 0 ? settings.volumetricDivisor : 5000;
  // Volumetric weight in kg = (L * B * H) / divisor -> in grams = * 1000
  const volumetricWeightGrams = Math.round(
    ((lengthCm * breadthCm * totalHeightCm) / divisor) * 1000
  );

  const initialSlabGrams =
    settings.initialWeightSlabGrams > 0 ? settings.initialWeightSlabGrams : 500;
  const additionalSlabGrams =
    settings.additionalWeightSlabGrams > 0 ? settings.additionalWeightSlabGrams : 500;

  const rawChargeableGrams = Math.max(actualWeightGrams, volumetricWeightGrams, initialSlabGrams);
  const additionalSlabsCount =
    rawChargeableGrams > initialSlabGrams
      ? Math.ceil((rawChargeableGrams - initialSlabGrams) / additionalSlabGrams)
      : 0;
  const chargeableWeightGrams =
    initialSlabGrams + additionalSlabsCount * additionalSlabGrams;

  const baseCharge = Math.round(modeRule.baseCharge);
  const additionalSlabCharge = Math.max(0, Math.round(modeRule.additionalSlabCharge || 0));
  const additionalWeightCharge = additionalSlabsCount * additionalSlabCharge;
  const surchargeAmount = Math.max(
    0,
    Math.round((settings.flatExtraHandlingFee || 0) + (modeRule.remoteAreaSurcharge || 0))
  );

  const subtotal = Math.max(0, Number(input.orderSubtotal) || 0);
  const insuranceCharge =
    settings.insuranceEnabled && settings.insurancePercentage > 0 && subtotal > 0
      ? Math.round(subtotal * (settings.insurancePercentage / 100))
      : 0;

  const totalShippingFee =
    baseCharge + additionalWeightCharge + surchargeAmount + insuranceCharge;

  if (!Number.isFinite(totalShippingFee) || totalShippingFee <= 0) {
    throw new ShippingCalculationError(
      "Shipping rate not configured for this destination",
      "INVALID_QUOTE",
      400
    );
  }

  const modeLabel = requestedMode === "E" ? "Express Delivery" : "Normal Surface";

  return {
    serviceable: true,
    serviceabilityVerified: false,
    serviceabilityNote:
      "Estimated shipping charge based on NEKARA's internal rate card. Final courier serviceability is subject to confirmation.",
    shippingFee: totalShippingFee,
    originPincode: settings.originPincode,
    destinationPincode: cleanDestPin,
    zoneId: resolvedZone.zoneId,
    zoneName: resolvedZone.zoneName,
    shippingMode: requestedMode,
    shippingModeLabel: modeLabel,
    estimatedDeliveryText: modeRule.estimatedDeliveryText,
    actualWeightGrams,
    volumetricWeightGrams,
    chargeableWeightGrams,
    initialWeightSlabGrams: initialSlabGrams,
    additionalWeightSlabGrams: additionalSlabGrams,
    additionalSlabsCount,
    baseCharge,
    additionalWeightCharge,
    surchargeAmount,
    insuranceCharge,
    dimensionsCm: {
      length: lengthCm,
      breadth: breadthCm,
      height: totalHeightCm,
    },
    quoteSource: "internal_rate_card",
    rateCardVersion: settings.rateCardVersion,
    rateCardStatus: settings.rateCardStatus,
    providerReference: `EST-${requestedMode}-${resolvedZone.zoneId}-${cleanDestPin}-${chargeableWeightGrams}g`,
    message: `Estimated ${modeLabel} (${modeRule.estimatedDeliveryText})`,
    supportedModes: {
      surface: settings.surfaceEnabled,
      express: settings.expressEnabled,
      defaultMode: settings.shippingMode,
    },
  };
}

/**
 * Server-side async entry point that loads the current shipping configuration from Firestore
 * and computes the deterministic shipping estimate.
 */
export async function calculateShippingRate(
  input: ShippingRateCalculationInput,
  overrideSettings?: ShippingSettingsConfig
): Promise<ShippingRateCalculationResult> {
  const settings = overrideSettings || (await getShippingSettings());
  return computeShippingRateFromConfig(input, settings);
}
