import { NekaraProduct } from "./product";

export interface WishlistItem {
  productId: string;
  addedAt?: string;
  product?: NekaraProduct;
}
