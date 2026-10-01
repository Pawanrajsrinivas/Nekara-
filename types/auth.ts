export interface CustomerProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  provider: "google" | "password";
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string; // document id (same as productId)
  productId: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  stock?: number;
  fabric?: string;
  color?: string;
  categoryName?: string;
  nameSnapshot?: string;
  priceSnapshot?: number;
  originalPriceSnapshot?: number;
  imageSnapshot?: string;
  addedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
