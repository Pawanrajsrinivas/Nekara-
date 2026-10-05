/**
 * NEKARA Luxury Handlooms — Payment Processing Fee & Pricing Configuration
 *
 * BUSINESS LOGIC (Gross-Up Recovery Model):
 * To recover payment gateway processing costs while keeping base product prices
 * clean in catalog and inventory, an explicit "Payment processing fee" is computed
 * on the order subtotal.
 *
 * Formula:
 * - baseFeePercent = 0.02 (2.0% standard Razorpay rate)
 * - taxPercent = 0.18 (18.0% GST on payment gateway services)
 * - effectiveFeeRate = baseFeePercent * (1 + taxPercent) = 0.0236 (2.36%)
 * - customerAmount = subtotal / (1 - effectiveFeeRate)
 * - processingFee = customerAmount - subtotal
 * - amountInPaise = Math.round(customerAmount * 100)
 */

export interface PaymentFeeConfig {
  enabled: boolean;
  baseFeePercent: number; // e.g. 0.02 for 2%
  taxPercent: number; // e.g. 0.18 for 18% GST
}

export const DEFAULT_PAYMENT_FEE_CONFIG: PaymentFeeConfig = {
  enabled: true,
  baseFeePercent: 0.02,
  taxPercent: 0.18,
};

export interface PaymentBreakdown {
  subtotal: number;
  processingFee: number;
  totalAmount: number;
  amountInPaise: number;
  effectiveRatePercent: number;
}

export function calculatePaymentBreakdown(
  subtotal: number,
  config: PaymentFeeConfig = DEFAULT_PAYMENT_FEE_CONFIG
): PaymentBreakdown {
  const cleanSubtotal = Math.max(0, typeof subtotal === "number" && !isNaN(subtotal) ? subtotal : 0);

  if (!config.enabled || cleanSubtotal <= 0) {
    return {
      subtotal: cleanSubtotal,
      processingFee: 0,
      totalAmount: cleanSubtotal,
      amountInPaise: Math.round(cleanSubtotal * 100),
      effectiveRatePercent: 0,
    };
  }

  const effectiveRate = config.baseFeePercent * (1 + config.taxPercent); // 0.0236
  const grossedUp = cleanSubtotal / (1 - effectiveRate);
  const totalAmount = Math.round(grossedUp * 100) / 100;
  const processingFee = Math.round((totalAmount - cleanSubtotal) * 100) / 100;
  const amountInPaise = Math.round(totalAmount * 100);

  return {
    subtotal: cleanSubtotal,
    processingFee,
    totalAmount,
    amountInPaise,
    effectiveRatePercent: Math.round(effectiveRate * 10000) / 100, // 2.36
  };
}
