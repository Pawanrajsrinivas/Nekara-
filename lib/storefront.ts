import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { HomeSection, NekaraProduct } from "@/types/product";

export const ESSENTIAL_SECTION_IDS = new Set([
  "hero",
  "trending",
  "shopByStyle",
  "signature",
  "newArrivals",
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
    id: "trending",
    title: "Trending Sarees",
    subtitle: "Discover the sarees everyone is loving",
    enabled: true,
    mode: "manual",
    productIds: [],
    displayOrder: 2,
    limit: 6,
  },
  {
    id: "shopByStyle",
    title: "Shop by Style",
    subtitle: "Curated collections of timeless Indian handlooms",
    enabled: true,
    mode: "manual",
    productIds: [],
    categoryIds: [],
    displayOrder: 3,
    limit: 5,
  },
  {
    id: "signature",
    title: "Our Signature Sarees",
    subtitle: "Mastercrafted creations embodying royal Indian tradition",
    enabled: true,
    mode: "manual",
    productIds: [],
    displayOrder: 4,
    limit: 6,
  },
  {
    id: "newArrivals",
    title: "New Arrivals",
    subtitle: "Fresh additions to the NEKARA collection",
    enabled: true,
    mode: "automatic",
    productIds: [],
    displayOrder: 5,
    limit: 6,
  },
  {
    id: "offers",
    title: "Special Offers & Limited Editions",
    subtitle: "Exquisite drapes at exceptional values",
    enabled: true,
    mode: "automatic",
    productIds: [],
    displayOrder: 6,
    limit: 6,
  },
];

/**
 * Fetches all homepage sections from Firestore `homeSections` collection.
 * Gracefully returns empty array on failure or when uninitialized.
 * Filters strictly to the 6 essential sections.
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
      // Strictly ignore deprecated sections
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
 * Resolves active products for a homepage section based on mode (manual vs automatic)
 * and limits the output strictly to `section.limit`.
 */
export function resolveSectionProducts(
  section: HomeSection,
  allProducts: NekaraProduct[]
): NekaraProduct[] {
  const activeProducts = allProducts.filter((p) => p.active !== false);
  const limit = section.limit || 6;

  // 1. Manual Mode: Preserve the exact configured product order
  if (section.mode === "manual") {
    if (!Array.isArray(section.productIds) || section.productIds.length === 0) {
      return [];
    }

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

  // 2. Automatic Mode: Curate based on real Firestore product attributes
  switch (section.id) {
    case "newArrivals": {
      // Sort by newest created date or newArrival flag
      const sorted = [...activeProducts].sort((a, b) => {
        if (a.newArrival && !b.newArrival) return -1;
        if (!a.newArrival && b.newArrival) return 1;
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      return sorted.slice(0, limit);
    }

    case "offers": {
      // Products with a real discounted sale price lower than regular price
      const onSale = activeProducts.filter(
        (p) => typeof p.salePrice === "number" && p.salePrice > 0 && p.salePrice < p.price
      );
      if (onSale.length > 0) {
        return onSale.slice(0, limit);
      }
      return [];
    }

    case "trending":
    case "signature":
    default: {
      // Featured or high rated products fallback
      const featured = activeProducts.filter((p) => p.featured);
      if (featured.length >= limit) {
        return featured.slice(0, limit);
      }
      const others = activeProducts.filter((p) => !p.featured);
      return [...featured, ...others].slice(0, limit);
    }
  }
}
