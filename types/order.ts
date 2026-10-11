export type OrderStatus =
  | "PAID"
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Failed"
  | "Refunded";

export type PaymentStatus =
  | "Pending"
  | "Paid"
  | "Failed"
  | "Cancelled"
  | "Refund Pending"
  | "Refund Processing"
  | "Refunded"
  | "Refund Failed";

export interface OrderRefundInfo {
  refundId?: string;
  amount: number;
  reason?: string;
  status: "pending" | "processing" | "processed" | "failed" | "reported_unverified";
  method: "razorpay" | "manual";
  source?: "razorpay_api" | "external_dashboard";
  externalRefundReference?: string | null;
  externalRefundDate?: string | null;
  verifiedExternalReference?: boolean;
  notes?: string;
  refundedAt?: any;
  createdAt?: any;
  referenceId?: string;
  processedBy?: string;
  recordedByEmail?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal?: number;
  image?: string;
  slug?: string;
  fabric?: string;
  color?: string;
  colour?: string;
  design?: string;
  sku?: string;
}

export interface ShippingAddress {
  name?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  house?: string;
  area?: string;
  landmark?: string;
  street?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  pincode?: string;
  country?: string;
}

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface OrderPaymentInfo {
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  currency: string;
  paymentMethod?: string;
}

export interface NekaraOrder {
  id: string;
  userId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customer?: OrderCustomer;
  payment?: OrderPaymentInfo;
  paymentId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: OrderStatus;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  items: OrderItem[];
  totalAmount: number;
  subtotal?: number;
  paymentProcessingFee?: number;
  paymentProcessingFeeBase?: number;
  paymentProcessingFeeGST?: number;
  shippingFee?: number;
  shippingMode?: "S" | "E";
  shippingAddress?: ShippingAddress;
  refund?: OrderRefundInfo;
  refundHistory?: OrderRefundInfo[];
  shipment?: OrderShipmentInfo;
  shippingQuote?: ShippingQuoteSnapshot;
  notes?: string;
  hiddenFromCustomer?: boolean;
  deletedAt?: any;
  deletedBy?: string;
  paidAt?: any;
  createdAt?: any;
  updatedAt?: any;
}

export interface OrderShipmentInfo {
  carrier: "Delhivery" | "Blue Dart" | "Shadowfax" | "DTDC" | "Ekart" | "XpressBees" | "Other";
  customCarrierName?: string;
  trackingId: string;
  trackingUrl?: string;
  carrierPhone?: string;
  dispatchedAt?: any;
  notes?: string;
  status: "Manifested" | "In Transit" | "Out for Delivery" | "Delivered" | "RTO" | "Pending";
  updatedAt?: any;
  updatedBy?: string;
}

export interface ShippingQuoteSnapshot {
  destinationPincode: string;
  originPincode: string;
  shippingMode: "S" | "E";
  shippingModeLabel?: string;
  quotedAmount: number;
  quoteSource: "delhivery" | "configured_fallback";
  quotedAt: any;
  chargeableWeightGrams: number;
  dimensionsCm: {
    length: number;
    breadth: number;
    height: number;
  };
  providerReference?: string;
}
