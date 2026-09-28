export type ProductBadge = "NEW" | "BESTSELLER" | "EDITOR'S PICK";

export type SareeCategory =
  | "Silk Sarees"
  | "Cotton Sarees"
  | "Banarasi Sarees"
  | "Kanchipuram Sarees"
  | "Party Wear"
  | "Designer Sarees";

export interface NekaraProduct {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  formattedPrice: string;
  originalPrice?: number;
  formattedOriginalPrice?: string;
  discountPercentage?: number;
  image: string;
  images: string[];
  category: SareeCategory;
  rating?: number;
  badge?: ProductBadge;
  availability?: "In Stock" | "Low Stock";
  slug: string;
  href: string;
}

export interface DummyJsonProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage?: number;
  rating?: number;
  stock?: number;
  brand?: string;
  category?: string;
  thumbnail: string;
  images?: string[];
}

export interface DummyJsonResponse {
  products: DummyJsonProduct[];
  total: number;
  skip: number;
  limit: number;
}
