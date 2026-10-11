/**
 * Automated Unit Tests for NEKARA Internal Shipping Estimation Engine
 * Run via: node --experimental-strip-types --test lib/__tests__/shipping-rate-engine.test.ts
 * or via the test runner script.
 */
import assert from "node:assert/strict";
import {
  DEFAULT_SHIPPING_SETTINGS,
  computeShippingRateFromConfig,
  normalizeShippingSettings,
  ShippingCalculationError,
} from "../shipping-rate-engine.ts";
import { calculatePaymentBreakdown } from "../pricing-config.ts";

let passed = 0;
let failed = 0;

function runTest(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  PASS: ${name}`);
  } catch (err: unknown) {
    failed++;
    console.error(`  FAIL: ${name}`);
    console.error(`    ${err instanceof Error ? err.message : String(err)}`);
  }
}

console.log("=== NEKARA Internal Shipping Calculator Test Suite ===");

// 1. Valid PIN codes across all 5 zones
runTest("1. Resolves valid PIN codes across all 5 zones accurately (longest-prefix match)", () => {
  const settings = DEFAULT_SHIPPING_SETTINGS;

  const local = computeShippingRateFromConfig(
    { destinationPincode: "560064", shippingMode: "S", totalQuantity: 1, orderSubtotal: 2500 },
    settings
  );
  assert.equal(local.zoneId, "LOCAL_CITY");
  assert.equal(local.serviceable, true);
  assert.equal(local.serviceabilityVerified, false);
  assert.equal(local.quoteSource, "internal_rate_card");

  const intraState = computeShippingRateFromConfig(
    { destinationPincode: "570001", shippingMode: "S", totalQuantity: 1, orderSubtotal: 2500 },
    settings
  );
  assert.equal(intraState.zoneId, "INTRA_STATE");

  const south = computeShippingRateFromConfig(
    { destinationPincode: "600001", shippingMode: "S", totalQuantity: 1, orderSubtotal: 2500 },
    settings
  );
  assert.equal(south.zoneId, "SOUTH_NEIGHBORING");

  const national = computeShippingRateFromConfig(
    { destinationPincode: "110001", shippingMode: "S", totalQuantity: 1, orderSubtotal: 2500 },
    settings
  );
  assert.equal(national.zoneId, "NATIONAL_MAINLAND");

  const remote = computeShippingRateFromConfig(
    { destinationPincode: "781001", shippingMode: "S", totalQuantity: 1, orderSubtotal: 2500 },
    settings
  );
  assert.equal(remote.zoneId, "SPECIAL_REMOTE");

  // Monotonicity across zones for same parcel & mode
  assert.ok(local.shippingFee < intraState.shippingFee);
  assert.ok(intraState.shippingFee < south.shippingFee);
  assert.ok(south.shippingFee < national.shippingFee);
  assert.ok(national.shippingFee < remote.shippingFee);
});

// 2. Normal Surface (S) vs Express (E) for the same PIN code
runTest("2. Computes both Normal Surface (S) and Express Delivery (E) for the same PIN code", () => {
  const settings = DEFAULT_SHIPPING_SETTINGS;
  const surfaceQuote = computeShippingRateFromConfig(
    { destinationPincode: "600001", shippingMode: "S", totalQuantity: 1, orderSubtotal: 3000 },
    settings
  );
  const expressQuote = computeShippingRateFromConfig(
    { destinationPincode: "600001", shippingMode: "E", totalQuantity: 1, orderSubtotal: 3000 },
    settings
  );

  assert.equal(surfaceQuote.shippingMode, "S");
  assert.equal(surfaceQuote.shippingModeLabel, "Normal Surface");
  assert.equal(expressQuote.shippingMode, "E");
  assert.equal(expressQuote.shippingModeLabel, "Express Delivery");
  assert.ok(
    expressQuote.shippingFee > surfaceQuote.shippingFee,
    `Express (${expressQuote.shippingFee}) should be higher than Surface (${surfaceQuote.shippingFee})`
  );
  assert.notEqual(surfaceQuote.estimatedDeliveryText, expressQuote.estimatedDeliveryText);
});

// 3. Multiple items / multiple weight slabs
runTest("3. Calculates multiple items and additional weight slabs deterministically", () => {
  const settings = DEFAULT_SHIPPING_SETTINGS;
  // 1 saree: 650g + 150g box = 800g actual. Volumetric: (35*28*6)/5000*1000 = 1176g -> 3 slabs (500 + 2*500 = 1500g)
  const oneSaree = computeShippingRateFromConfig(
    { destinationPincode: "560064", shippingMode: "S", totalQuantity: 1, orderSubtotal: 2500 },
    settings
  );
  assert.equal(oneSaree.actualWeightGrams, 800);
  assert.equal(oneSaree.volumetricWeightGrams, 1176);
  assert.equal(oneSaree.chargeableWeightGrams, 1500);
  assert.equal(oneSaree.additionalSlabsCount, 2);
  // Base 65 + 2 * 25 = 115
  assert.equal(oneSaree.shippingFee, 115);

  // 3 sarees: 3*650 + 150 = 2100g actual. Volumetric: (35*28*18)/5000*1000 = 3528g -> chargeable 4000g (1 initial + 7 additional slabs)
  const threeSarees = computeShippingRateFromConfig(
    { destinationPincode: "560064", shippingMode: "S", totalQuantity: 3, orderSubtotal: 7500 },
    settings
  );
  assert.equal(threeSarees.actualWeightGrams, 2100);
  assert.equal(threeSarees.volumetricWeightGrams, 3528);
  assert.equal(threeSarees.chargeableWeightGrams, 4000);
  assert.equal(threeSarees.additionalSlabsCount, 7);
  // Base 65 + 7 * 25 = 240
  assert.equal(threeSarees.shippingFee, 240);
});

// 4. Volumetric weight higher than actual weight vs Actual weight higher than volumetric weight
runTest("4. Uses max(actualWeight, volumetricWeight) for chargeable weight slabs", () => {
  const settings = DEFAULT_SHIPPING_SETTINGS;

  // Heavy Kanchipuram saree: 1800g item + 150g box = 1950g actual > 1176g volumetric -> 2000g chargeable (3 additional slabs)
  const heavyActual = computeShippingRateFromConfig(
    {
      destinationPincode: "560064",
      shippingMode: "S",
      totalQuantity: 1,
      orderSubtotal: 12000,
      itemWeightsGrams: [1800],
    },
    settings
  );
  assert.equal(heavyActual.actualWeightGrams, 1950);
  assert.equal(heavyActual.volumetricWeightGrams, 1176);
  assert.equal(heavyActual.chargeableWeightGrams, 2000);
  assert.equal(heavyActual.additionalSlabsCount, 3);

  // Bulky gift box: 40x30x20 cm = 24000 / 5000 * 1000 = 4800g volumetric > 800g actual -> 5000g chargeable (9 additional slabs)
  const bulkyBox = computeShippingRateFromConfig(
    {
      destinationPincode: "560064",
      shippingMode: "S",
      totalQuantity: 1,
      orderSubtotal: 5000,
      customDimensionsCm: { length: 40, breadth: 30, height: 20 },
    },
    settings
  );
  assert.equal(bulkyBox.actualWeightGrams, 800);
  assert.equal(bulkyBox.volumetricWeightGrams, 4800);
  assert.equal(bulkyBox.chargeableWeightGrams, 5000);
  assert.equal(bulkyBox.additionalSlabsCount, 9);
});

// 5. Invalid PIN code format
runTest("5. Rejects invalid PIN code formats with INVALID_PINCODE", () => {
  const invalidPins = ["", "123", "56006", "5600641", "56006A", "ABCDEF"];
  for (const pin of invalidPins) {
    assert.throws(
      () =>
        computeShippingRateFromConfig(
          { destinationPincode: pin, shippingMode: "S", totalQuantity: 1, orderSubtotal: 2500 },
          DEFAULT_SHIPPING_SETTINGS
        ),
      (err: any) => err instanceof ShippingCalculationError && err.code === "INVALID_PINCODE",
      `Expected INVALID_PINCODE for "${pin}"`
    );
  }
});

// 6. Unsupported / unmapped destination PIN code (error policy vs fallback zone policy)
runTest("6. Handles unmapped destination PIN prefixes per unmappedDestinationPolicy", () => {
  // Prefix "99" is not in any standard Indian postal zone
  assert.throws(
    () =>
      computeShippingRateFromConfig(
        { destinationPincode: "990001", shippingMode: "S", totalQuantity: 1, orderSubtotal: 2500 },
        DEFAULT_SHIPPING_SETTINGS
      ),
    (err: any) =>
      err instanceof ShippingCalculationError &&
      err.code === "UNMAPPED_DESTINATION" &&
      err.message === "Shipping rate not configured for this destination"
  );

  // When unmappedDestinationPolicy is configured to use_fallback_zone, resolves fallback zone
  const fallbackSettings = normalizeShippingSettings({
    ...DEFAULT_SHIPPING_SETTINGS,
    unmappedDestinationPolicy: "use_fallback_zone",
    fallbackZone: "NATIONAL_MAINLAND",
  });
  const fallbackQuote = computeShippingRateFromConfig(
    { destinationPincode: "990001", shippingMode: "E", totalQuantity: 1, orderSubtotal: 2500 },
    fallbackSettings
  );
  assert.equal(fallbackQuote.zoneId, "FALLBACK_DEFAULT");
  assert.ok(fallbackQuote.shippingFee > 0);
});

// 7. Missing product weight/dimensions falls back safely to defaults
runTest("7. Falls back safely when product weight or dimensions are missing", () => {
  const quote = computeShippingRateFromConfig(
    {
      destinationPincode: "560064",
      shippingMode: "S",
      totalQuantity: 2,
      orderSubtotal: 5000,
      itemWeightsGrams: [], // Empty/missing item weights
    },
    DEFAULT_SHIPPING_SETTINGS
  );
  // 2 * 650g default + 150g packaging = 1450g
  assert.equal(quote.actualWeightGrams, 1450);
  assert.ok(quote.shippingFee > 0);
});

// 8. Missing shipping rate configuration / disabled modes
runTest("8. Rejects when shipping rate configuration is disabled or mode is disabled", () => {
  const disabledSettings = { ...DEFAULT_SHIPPING_SETTINGS, enabled: false };
  assert.throws(
    () =>
      computeShippingRateFromConfig(
        { destinationPincode: "560064", shippingMode: "S", totalQuantity: 1, orderSubtotal: 2500 },
        disabledSettings
      ),
    (err: any) => err instanceof ShippingCalculationError && err.code === "MISSING_RATE_CONFIG"
  );

  const expressDisabledSettings = { ...DEFAULT_SHIPPING_SETTINGS, expressEnabled: false };
  assert.throws(
    () =>
      computeShippingRateFromConfig(
        { destinationPincode: "560064", shippingMode: "E", totalQuantity: 1, orderSubtotal: 2500 },
        expressDisabledSettings
      ),
    (err: any) => err instanceof ShippingCalculationError && err.code === "MODE_DISABLED"
  );
});

// 9. Race condition / stale request handling when switching PIN code or shipping mode
runTest("9. Prevents stale shipping quote from applying when PIN or mode changes", () => {
  // Simulates checkout state verification: quote must match both current 6-digit PIN and selected mode
  const currentPin = "600001";
  const currentMode: "S" | "E" = "E";

  const staleSurfaceQuote = computeShippingRateFromConfig(
    { destinationPincode: "600001", shippingMode: "S", totalQuantity: 1, orderSubtotal: 2500 },
    DEFAULT_SHIPPING_SETTINGS
  );
  const stalePinQuote = computeShippingRateFromConfig(
    { destinationPincode: "560064", shippingMode: "E", totalQuantity: 1, orderSubtotal: 2500 },
    DEFAULT_SHIPPING_SETTINGS
  );
  const activeQuote = computeShippingRateFromConfig(
    { destinationPincode: "600001", shippingMode: "E", totalQuantity: 1, orderSubtotal: 2500 },
    DEFAULT_SHIPPING_SETTINGS
  );

  const isQuoteValidForState = (quote: typeof activeQuote, pin: string, mode: "S" | "E") =>
    quote.serviceable &&
    quote.destinationPincode === pin &&
    quote.shippingMode === mode &&
    quote.shippingFee > 0;

  assert.equal(isQuoteValidForState(staleSurfaceQuote, currentPin, currentMode), false);
  assert.equal(isQuoteValidForState(stalePinQuote, currentPin, currentMode), false);
  assert.equal(isQuoteValidForState(activeQuote, currentPin, currentMode), true);
});

// 10. Server rejection of client-submitted altered shipping total vs acceptance of matching total
runTest("10. Rejects client-tampered shipping fee/total and accepts matching server total", () => {
  const subtotal = 2500;
  const serverQuote = computeShippingRateFromConfig(
    { destinationPincode: "560064", shippingMode: "E", totalQuantity: 1, orderSubtotal: subtotal },
    DEFAULT_SHIPPING_SETTINGS
  );
  const feeBreakdown = calculatePaymentBreakdown(subtotal, undefined, serverQuote.shippingFee);
  const expectedTotal = feeBreakdown.totalAmount;

  const verifyCheckoutTotals = (clientShippingFee: number, clientTotal: number) => {
    if (Math.abs(clientShippingFee - serverQuote.shippingFee) > 1) {
      return { valid: false, reason: "SHIPPING_FEE_MISMATCH" };
    }
    if (Math.abs(clientTotal - expectedTotal) > 1) {
      return { valid: false, reason: "TOTAL_AMOUNT_MISMATCH" };
    }
    return { valid: true, expectedTotal };
  };

  // Tampered shipping fee (e.g., client sends ₹0 or Surface fee for Express)
  const tamperedShipping = verifyCheckoutTotals(0, subtotal + feeBreakdown.processingFee);
  assert.equal(tamperedShipping.valid, false);
  assert.equal(tamperedShipping.reason, "SHIPPING_FEE_MISMATCH");

  // Tampered grand total
  const tamperedTotal = verifyCheckoutTotals(serverQuote.shippingFee, expectedTotal - 100);
  assert.equal(tamperedTotal.valid, false);
  assert.equal(tamperedTotal.reason, "TOTAL_AMOUNT_MISMATCH");

  // Matching total
  const validSubmission = verifyCheckoutTotals(serverQuote.shippingFee, expectedTotal);
  assert.equal(validSubmission.valid, true);
  assert.equal(validSubmission.expectedTotal, expectedTotal);
});

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  process.exit(1);
}
