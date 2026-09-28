import { NekaraProduct, DummyJsonResponse } from "@/types/product";
import { transformDummyJsonProduct, FALLBACK_PRODUCTS } from "@/lib/product-adapter";

interface GetProductsParams {
  limit?: number;
  skip?: number;
  category?: string;
  sort?: string;
}

interface GetProductsResult {
  products: NekaraProduct[];
  total: number;
  isFallback?: boolean;
}

const DUMMY_JSON_API_BASE = "https://dummyjson.com/products";

/**
 * Fetches products from DummyJSON and transforms them into NekaraProduct instances.
 * Falls back seamlessly to local curated products if DummyJSON is unreachable.
 */
export async function getProducts({
  limit = 12,
  skip = 0,
  category,
  sort,
}: GetProductsParams = {}): Promise<GetProductsResult> {
  try {
    // Request a batch to allow category filtering if requested
    const fetchLimit = category && category !== "All" ? 30 : limit;
    const res = await fetch(`${DUMMY_JSON_API_BASE}?limit=${fetchLimit}&skip=${skip}`, {
      // Allow next.js cache with periodic revalidation (5 mins) or fresh fetch
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error(`DummyJSON responded with HTTP status ${res.status}`);
    }

    const data: DummyJsonResponse = await res.json();
    let transformed: NekaraProduct[] = data.products.map((raw, idx) =>
      transformDummyJsonProduct(raw, idx)
    );

    // Apply category filter if requested
    if (category && category !== "All") {
      const normalizedFilter = category.toLowerCase().trim();
      transformed = transformed.filter(
        (p) => p.category.toLowerCase().trim() === normalizedFilter
      );
    }

    // Apply sorting if requested
    if (sort) {
      switch (sort) {
        case "price-asc":
          transformed.sort((a, b) => a.price - b.price);
          break;
        case "price-desc":
          transformed.sort((a, b) => b.price - a.price);
          break;
        case "rating":
          transformed.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        default:
          // "featured" retains default curated order
          break;
      }
    }

    // Slice to the requested limit
    const finalProducts = transformed.slice(0, limit);

    return {
      products: finalProducts,
      total: data.total || finalProducts.length,
      isFallback: false,
    };
  } catch (error) {
    console.warn("ProductService: Falling back to local dataset due to API error:", error);

    let fallback = [...FALLBACK_PRODUCTS];

    if (category && category !== "All") {
      const normalizedFilter = category.toLowerCase().trim();
      fallback = fallback.filter(
        (p) => p.category.toLowerCase().trim() === normalizedFilter
      );
    }

    if (sort) {
      switch (sort) {
        case "price-asc":
          fallback.sort((a, b) => a.price - b.price);
          break;
        case "price-desc":
          fallback.sort((a, b) => b.price - a.price);
          break;
        case "rating":
          fallback.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        default:
          break;
      }
    }

    return {
      products: fallback.slice(0, limit),
      total: fallback.length,
      isFallback: true,
    };
  }
}

/**
 * Returns signature/featured products for the Home page (default 4 items).
 */
export async function getFeaturedProducts(limit = 4): Promise<NekaraProduct[]> {
  const result = await getProducts({ limit });
  return result.products;
}

/**
 * Retrieves a single product by its id or slug.
 */
export async function getProductById(idOrSlug: string): Promise<NekaraProduct | null> {
  const allResult = await getProducts({ limit: 30 });
  const found = allResult.products.find(
    (p) => p.id === idOrSlug || p.slug === idOrSlug
  );
  if (found) return found;

  const fallbackFound = FALLBACK_PRODUCTS.find(
    (p) => p.id === idOrSlug || p.slug === idOrSlug
  );
  return fallbackFound || null;
}
