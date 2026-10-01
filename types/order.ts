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

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  slug?: string;
}

export interface ShippingAddress {
  name?: string;
  phone?: string;
  email?: string;
  street?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  pincode?: string;
  country?: string;
}

export interface NekaraOrder {
  id: string;
  userId: string;
  paymentId?: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress?: ShippingAddress;
  paidAt?: any;
  createdAt?: any;
  updatedAt?: any;
}
