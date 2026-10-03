import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  limit as firestoreLimit,
} from "firebase/firestore";
import { db } from "./firebase";
import { NekaraProduct, NekaraCategory, ProductBadge } from "@/types/product";

/**
 * Deterministic Indian Rupee string formatting.
 * Guaranteed identical output across SSR and client hydration.
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return "₹0";
  const str = Math.round(amount).toString();
  if (str.length <= 3) return `₹${str}`;
  const lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  const formattedOthers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `₹${formattedOthers},${lastThree}`;
}

/**
 * Maps a raw Firestore document to a strongly-typed NekaraProduct.
 * Resilient to different formats of images and prices.
 */
export function mapDocToProduct(id: string, data: Record<string, any>): NekaraProduct {
  const regularPrice = typeof data.price === "number" ? data.price : parseFloat(data.price) || 0;
  const salePrice =
    typeof data.salePrice === "number"
      ? data.salePrice
      : data.salePrice
      ? parseFloat(data.salePrice)
      : undefined;

  const hasSale = typeof salePrice === "number" && salePrice > 0 && salePrice < regularPrice;
  const effectivePrice = hasSale ? salePrice! : regularPrice;
  const originalPrice = hasSale ? regularPrice : undefined;

  const discountPercentage =
    hasSale && regularPrice > 0
      ? Math.round(((regularPrice - salePrice!) / regularPrice) * 100)
      : undefined;

  // Resilient Cloudinary images extraction (handles string[], {url: string}[], or single URL)
  let rawImages: string[] = [];
  if (Array.isArray(data.images)) {
    rawImages = data.images
      .map((img: any) => {
        if (typeof img === "string") return img.trim();
        if (img && typeof img === "object" && typeof img.url === "string") return img.url.trim();
        return "";
      })
      .filter((url: string) => url.length > 0);
  } else if (typeof data.image === "string" && data.image.trim()) {
    rawImages = [data.image.trim()];
  }

  // Thumbnail / Main image extraction
  let thumbnail = "";
  if (typeof data.thumbnail === "string" && data.thumbnail.trim()) {
    thumbnail = data.thumbnail.trim();
  } else if (data.thumbnail && typeof data.thumbnail === "object" && typeof data.thumbnail.url === "string") {
    thumbnail = data.thumbnail.url.trim();
  } else if (rawImages.length > 0) {
    thumbnail = rawImages[0];
  } else {
    thumbnail = "/images/categories/silk-sarees.jpg";
  }

  // Design Image extraction (optional)
  let designImage: string | undefined = undefined;
  if (typeof data.designImage === "string" && data.designImage.trim()) {
    designImage = data.designImage.trim();
  } else if (
    data.designImage &&
    typeof data.designImage === "object" &&
    typeof data.designImage.url === "string" &&
    data.designImage.url.trim()
  ) {
    designImage = data.designImage.url.trim();
  }

  // Ordered and Deduplicated Images:
  // 1. Main / Thumbnail image (first)
  // 2. Design Image (second, if present)
  // 3. Other images (remaining, deduplicated)
  const orderedImages: string[] = [];
  if (thumbnail) {
    orderedImages.push(thumbnail);
  }
  if (designImage && !orderedImages.includes(designImage)) {
    orderedImages.push(designImage);
  }
  for (const img of rawImages) {
    if (img && !orderedImages.includes(img)) {
      orderedImages.push(img);
    }
  }

  if (orderedImages.length === 0) {
    orderedImages.push(thumbnail || "/images/categories/silk-sarees.jpg");
  }

  // Stock & Availability
  const stock = typeof data.stock === "number" ? data.stock : parseInt(data.stock, 10) || 10;
  let availability: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock";
  if (stock <= 0) {
    availability = "Out of Stock";
  } else if (stock < 5) {
    availability = "Low Stock";
  }

  // Badge resolution
  let badge: ProductBadge | undefined;
  if (data.newArrival) {
    badge = "NEW";
  } else if (data.bestseller) {
    badge = "BESTSELLER";
  } else if (data.featured) {
    badge = "FEATURED";
  }

  const categoryName = data.categoryName || data.category || "Silk Sarees";
  const slug = data.slug || id;

  // Subtitle generation for editorial luxury feel
  const subtitle =
    data.shortDescription ||
    [data.fabric, data.color, data.weave].filter(Boolean).join(" • ") ||
    categoryName;

  return {
    id,
    name: data.name || "Handcrafted Luxury Saree",
    slug,
    subtitle,
    shortDescription: data.shortDescription || "",
    description: data.description || data.shortDescription || "",
    sku: data.sku || "",
    price: effectivePrice,
    salePrice: hasSale ? salePrice : undefined,
    originalPrice,
    formattedPrice: formatINR(effectivePrice),
    formattedOriginalPrice: originalPrice ? formatINR(originalPrice) : undefined,
    discountPercentage,
    image: thumbnail,
    images: orderedImages,
    designImage,
    category: categoryName,
    categoryId: data.categoryId || "",
    categoryName,
    subcategoryId: data.subcategoryId || "",
    fabric: data.fabric || "",
    color: data.color || "",
    occasion: data.occasion || "",
    weave: data.weave || "",
    collection: data.collection || "",
    stock,
    rating: 4.9,
    badge,
    availability,
    href: `/product/${slug}`,
    featured: Boolean(data.featured),
    bestseller: Boolean(data.bestseller),
    newArrival: Boolean(data.newArrival),
    active: data.active !== false,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : undefined,
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : undefined,
  };
}

interface GetProductsParams {
  limit?: number;
  category?: string;
  sort?: string;
  featured?: boolean;
}

interface GetProductsResult {
  products: NekaraProduct[];
  total: number;
}

/**
 * Fetches real products from Firestore `products` collection.
 * Performs zero premature filtering so existing product is never hidden.
 */
export async function getProducts({
  limit = 20,
  category,
  sort,
  featured,
}: GetProductsParams = {}): Promise<GetProductsResult> {
  console.log("[NEKARA] Fetching products...");
  console.log("[NEKARA] Product collection: products");

  if (!db || typeof db.type !== "string") {
    console.warn("[NEKARA] Firestore db instance is not configured or not available.");
    return { products: [], total: 0 };
  }

  try {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);

    let items: NekaraProduct[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      // DO NOT automatically filter out: Include every product document present in Firestore
      items.push(mapDocToProduct(docSnap.id, data));
    });

    console.log(`[NEKARA] Products fetched: ${items.length}`);
    console.log("[NEKARA] Product IDs:", items.map((p) => p.id));
    if (items.length > 0) {
      console.log("[NEKARA] First product:", {
        id: items[0].id,
        name: items[0].name,
        slug: items[0].slug,
        price: items[0].price,
        image: items[0].image,
        category: items[0].category,
        active: items[0].active,
      });
    }

    // Category filter: only apply if category is explicitly selected and not "All"
    if (category && category !== "All") {
      const normalizedFilter = category.toLowerCase().trim();
      const filtered = items.filter(
        (p) =>
          p.category.toLowerCase().trim() === normalizedFilter ||
          p.categoryName.toLowerCase().trim() === normalizedFilter ||
          p.categoryId.toLowerCase().trim() === normalizedFilter
      );
      if (filtered.length > 0) {
        items = filtered;
      }
    }

    // Featured filter: only prioritize if featured sarees exist
    if (featured) {
      const featuredItems = items.filter((p) => p.featured);
      if (featuredItems.length > 0) {
        items = featuredItems;
      }
    }

    // Sorting
    if (sort) {
      switch (sort) {
        case "price-asc":
          items.sort((a, b) => a.price - b.price);
          break;
        case "price-desc":
          items.sort((a, b) => b.price - a.price);
          break;
        case "rating":
          items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        default:
          break;
      }
    }

    const total = items.length;
    const finalProducts = items.slice(0, limit);

    return {
      products: finalProducts,
      total,
    };
  } catch (error: any) {
    console.error("[NEKARA] Error fetching products from Firestore:", error?.code || error?.message || error);
    if (error?.code === "permission-denied") {
      console.error(
        "[NEKARA] FIRESTORE PERMISSION DENIED: Public read access is currently blocked by Firestore Security Rules. Firestore rules must allow 'allow read: if true;' on /products/{productId}"
      );
    }
    return { products: [], total: 0 };
  }
}

/**
 * Returns featured signature products for the Homepage.
 */
export async function getFeaturedProducts(limit = 4): Promise<NekaraProduct[]> {
  const result = await getProducts({ limit, featured: true });
  if (result.products.length > 0) {
    return result.products;
  }
  const generalResult = await getProducts({ limit });
  return generalResult.products;
}

/**
 * Retrieves a single product by its slug or document ID.
 */
export async function getProductBySlug(slug: string): Promise<NekaraProduct | null> {
  if (!db || !slug || typeof db.type !== "string") return null;

  try {
    const productsRef = collection(db, "products");

    // 1. Try querying by slug field
    const q = query(productsRef, where("slug", "==", slug), firestoreLimit(1));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return mapDocToProduct(docSnap.id, docSnap.data());
    }

    // 2. If not found by slug, try direct document ID lookup
    const docRef = doc(db, "products", slug);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return mapDocToProduct(docSnap.id, docSnap.data());
    }

    // 3. Fallback: scan all products in case of URL case-mismatch
    const allSnapshot = await getDocs(productsRef);
    for (const snap of allSnapshot.docs) {
      const data = snap.data();
      if (data.slug?.toLowerCase() === slug.toLowerCase() || snap.id === slug) {
        return mapDocToProduct(snap.id, data);
      }
    }

    return null;
  } catch (error: any) {
    console.error("[NEKARA] Error getting product by slug:", error?.code || error?.message || error);
    return null;
  }
}

/**
 * Fetches real active categories from Firestore `categories` collection.
 */
export async function getCategories(): Promise<NekaraCategory[]> {
  if (!db || typeof db.type !== "string") return [];

  try {
    const categoriesRef = collection(db, "categories");
    const snapshot = await getDocs(categoriesRef);

    const categories: NekaraCategory[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      categories.push({
        id: docSnap.id,
        name: data.name || "Sarees",
        slug: data.slug || docSnap.id,
        description: data.description || "",
        active: data.active !== false,
      });
    });

    categories.sort((a, b) => a.name.localeCompare(b.name));
    return categories;
  } catch (error: any) {
    console.error("[NEKARA] Error fetching categories from Firestore:", error?.code || error?.message || error);
    return [];
  }
}
