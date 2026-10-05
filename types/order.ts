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

export type PaymentStatus = "Pending" | "Paid" | "Failed" | "Cancelled" | "Refunded";

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
  shippingFee?: number;
  shippingAddress?: ShippingAddress;
  notes?: string;
  hiddenFromCustomer?: boolean;
  deletedAt?: any;
  deletedBy?: string;
  paidAt?: any;
  createdAt?: any;
  updatedAt?: any;
}
