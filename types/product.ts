export type ProductBadge = "NEW" | "BESTSELLER" | "FEATURED";

export interface NekaraProduct {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  shortDescription?: string;
  description: string;
  sku?: string;
  price: number;
  salePrice?: number;
  originalPrice?: number;
  formattedPrice: string;
  formattedOriginalPrice?: string;
  discountPercentage?: number;
  image: string;
  images: string[];
  category: string;
  categoryId: string;
  categoryName: string;
  subcategoryId?: string;
  fabric?: string;
  color?: string;
  occasion?: string;
  weave?: string;
  collection?: string;
  stock: number;
  rating: number;
  badge?: ProductBadge;
  availability: "In Stock" | "Low Stock" | "Out of Stock";
  href: string;
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NekaraCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  active?: boolean;
}
