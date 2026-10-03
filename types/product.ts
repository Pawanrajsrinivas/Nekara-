export type ProductBadge = "NEW" | "BESTSELLER" | "FEATURED";

export interface NekaraProduct {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  shortDescription?: string;
  description: string;
  sku?: string;
  productId?: string;
  design?: string;
  price: number;
  salePrice?: number;
  originalPrice?: number;
  formattedPrice: string;
  formattedOriginalPrice?: string;
  discountPercentage?: number;
  image: string;
  images: string[];
  designImage?: string;
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

export type HomeSectionMode = "manual" | "automatic";

export type HomeSectionType =
  | "hero"
  | "trending"
  | "shopByStyle"
  | "signature"
  | "newArrivals"
  | "offers";

export interface HomeSection {
  id: string;
  title: string;
  subtitle?: string;
  enabled: boolean;
  mode: HomeSectionMode;
  productIds: string[];
  categoryIds?: string[];
  displayOrder: number;
  limit: number;
  updatedAt?: any;
}

