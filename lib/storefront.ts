import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { HomeSection, NekaraProduct } from "@/types/product";

export const ESSENTIAL_SECTION_IDS = new Set([
  "hero",
  "featured",
  "trending",
  "shopByStyle",
  "signature",
  "newArrivals",
  "bestsellers",
  "bestseller",
  "offers",
]);

export const DEFAULT_STOREFRONT_SECTIONS: HomeSection[] = [
  {
    id: "hero",
    title: "Heritage in Every Thread",
    subtitle: "Timeless Sarees. Modern Elegance.",
    enabled: true,
    mode: "manual",
    productIds: [],
    displayOrder: 1,
    limit: 3,
  },
  {
    id: "featured",
    title: "Featured Sarees",
    subtitle: "Handpicked mastercrafted sarees representing our finest handloom weaves",
    enabled: true,
    mode: "automatic",
    productIds: [],
    displayOrder: 2,
    limit: 8,
  },
  {
    id: "newArrivals",
    title: "New Arrivals",
    subtitle: "Fresh additions directly from our master artisan looms",
    enabled: true,
    mode: "automatic",
    productIds: [],
    displayOrder: 3,
    limit: 8,
  },
  {
    id: "bestsellers",
    title: "Bestselling Sarees",
    subtitle: "Our most cherished and celebrated heirloom weaves",
    enabled: true,
    mode: "automatic",
    productIds: [],
    displayOrder: 4,
    limit: 8,
  },
];

/**
 * Fetches homepage sections from Firestore `homeSections` collection.
 * Gracefully returns empty array on failure or when uninitialized.
 */
export async function getHomeSections(): Promise<HomeSection[]> {
  if (!db || typeof db.type !== "string") {
    return [];
  }

  try {
    const snap = await getDocs(collection(db, "homeSections"));
    if (snap.empty) {
      return [];
    }

    const sections: HomeSection[] = [];
    snap.forEach((d) => {
      if (ESSENTIAL_SECTION_IDS.has(d.id)) {
        const data = d.data() as Omit<HomeSection, "id">;
        sections.push({ id: d.id, ...data });
      }
    });

    sections.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    return sections;
  } catch (error) {
    console.warn("[NEKARA] Could not fetch homeSections from Firestore:", error);
    return [];
  }
}

/**
 * Resolves active products for a homepage section based on Admin product flags:
 * - Featured: active == true && featured == true
 * - New Arrivals: active == true && newArrival == true
 * - Bestsellers: active == true && bestseller == true
 * - Stock = 0: Active products with 0 stock stay visible and display "SOLD OUT"
 * - Gracefully hides empty sections without falling back to fake/dummy products.
 */
export function resolveSectionProducts(
  section: HomeSection,
  allProducts: NekaraProduct[]
): NekaraProduct[] {
  // Keep all active products (even if stock is 0, they display "SOLD OUT")
  const activeProducts = allProducts.filter((p) => p.active !== false);
  const limit = section.limit || 8;

  // 1. Manual Mode: If specific product IDs are explicitly configured in the section
  if (section.mode === "manual" && Array.isArray(section.productIds) && section.productIds.length > 0) {
    const productsMap = new Map<string, NekaraProduct>();
    for (const p of activeProducts) {
      productsMap.set(p.id, p);
    }

    const resolved: NekaraProduct[] = [];
    for (const id of section.productIds) {
      const p = productsMap.get(id);
      if (p) {
        resolved.push(p);
      }
    }
    return resolved.slice(0, limit);
  }

  // 2. Automatic Mode strictly driven by Firestore product attributes
  switch (section.id) {
    case "newArrivals": {
      // Products where active === true && newArrival === true
      const matches = activeProducts.filter((p) => p.newArrival === true);
      return matches.slice(0, limit);
    }

    case "bestsellers":
    case "bestseller": {
      // Products where active === true && bestseller === true
      const matches = activeProducts.filter((p) => p.bestseller === true);
      return matches.slice(0, limit);
    }

    case "offers": {
      // Products with active === true and real discounted salePrice
      const onSale = activeProducts.filter(
        (p) => typeof p.salePrice === "number" && p.salePrice > 0 && p.salePrice < p.price
      );
      return onSale.slice(0, limit);
    }

    case "featured":
    case "trending":
    case "signature":
    default: {
      // Products where active === true && featured === true
      const matches = activeProducts.filter((p) => p.featured === true);
      return matches.slice(0, limit);
    }
  }
}
