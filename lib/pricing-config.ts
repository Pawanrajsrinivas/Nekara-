/**
 * NEKARA Luxury Handlooms — Payment Processing Fee & Pricing Configuration
 *
 * BUSINESS LOGIC (Direct Add-On Model):
 * Product prices in Firestore catalog remain exact and clean (e.g. ₹2,500.00).
 * A separate order-level payment processing fee is added on top of the product subtotal:
 *
 * 1. Base Gateway Processing Fee = 2% of product subtotal
 *    Example: 2% of ₹2,500 = ₹50.00 (5,000 paise)
 *
 * 2. GST on Processing Fee = 18% of the 2% processing fee
 *    Example: 18% of ₹50 = ₹9.00 (900 paise)
 *
 * 3. Total Payment Processing Fee = Base Processing Fee + GST on Fee
 *    Example: ₹50.00 + ₹9.00 = ₹59.00 (5,900 paise)
 *
 * 4. Customer Grand Total = Product Subtotal + Total Payment Processing Fee
 *    Example: ₹2,500.00 + ₹59.00 = ₹2,559.00 (255,900 paise)
 *
 * NOTE: NO GROSS-UP FORMULA IS USED. The fee is simply added on top of the subtotal.
 */

export interface PaymentFeeConfig {
  enabled: boolean;
  baseFeePercent: number; // e.g. 0.02 for 2%
  taxPercent: number; // e.g. 0.18 for 18% GST on the fee
}

export const DEFAULT_PAYMENT_FEE_CONFIG: PaymentFeeConfig = {
  enabled: true,
  baseFeePercent: 0.02, // 2% gateway processing fee
  taxPercent: 0.18,     // 18% GST applied exclusively to the 2% processing fee
};

export interface PaymentBreakdown {
  subtotal: number;
  processingFeeBase: number;
  processingFeeGST: number;
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
    const subtotalInPaise = Math.round(cleanSubtotal * 100);
    return {
      subtotal: cleanSubtotal,
      processingFeeBase: 0,
      processingFeeGST: 0,
      processingFee: 0,
      totalAmount: cleanSubtotal,
      amountInPaise: subtotalInPaise,
      effectiveRatePercent: 0,
    };
  }

  // Work with integer paise to eliminate floating-point precision issues
  const subtotalInPaise = Math.round(cleanSubtotal * 100);

  // 1. 2% gateway fee on product subtotal
  const processingFeeBaseInPaise = Math.round(subtotalInPaise * config.baseFeePercent);

  // 2. 18% GST applied ON the 2% fee
  const processingFeeGSTInPaise = Math.round(processingFeeBaseInPaise * config.taxPercent);

  // 3. Total payment processing fee
  const totalProcessingFeeInPaise = processingFeeBaseInPaise + processingFeeGSTInPaise;

  // 4. Customer grand total
  const totalAmountInPaise = subtotalInPaise + totalProcessingFeeInPaise;

  const processingFeeBase = processingFeeBaseInPaise / 100;
  const processingFeeGST = processingFeeGSTInPaise / 100;
  const processingFee = totalProcessingFeeInPaise / 100;
  const totalAmount = totalAmountInPaise / 100;

  return {
    subtotal: cleanSubtotal,
    processingFeeBase,
    processingFeeGST,
    processingFee,
    totalAmount,
    amountInPaise: totalAmountInPaise,
    effectiveRatePercent: 2.36,
  };
}
