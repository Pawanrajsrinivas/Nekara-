import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo-config";
import { getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { getProducts } from "@/lib/products";

export const revalidate = 3600; // Revalidate sitemap at most every hour

interface SitemapProductRecord {
  slugOrId: string;
  active: boolean;
  lastModified?: Date;
}

/**
 * Safely parses a Firestore Timestamp, Date, or ISO string into a valid Date object.
 * Returns undefined if no valid timestamp is present (avoids fabricating dates).
 */
function parseFirestoreDate(value: unknown): Date | undefined {
  if (!value) return undefined;

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? undefined : value;
  }

  if (typeof value === "object" && value !== null) {
    const maybeTimestamp = value as { toDate?: () => Date; _seconds?: number; seconds?: number };
    if (typeof maybeTimestamp.toDate === "function") {
      try {
        const d = maybeTimestamp.toDate();
        return isNaN(d.getTime()) ? undefined : d;
      } catch {
        return undefined;
      }
    }
    const seconds =
      typeof maybeTimestamp._seconds === "number"
        ? maybeTimestamp._seconds
        : typeof maybeTimestamp.seconds === "number"
        ? maybeTimestamp.seconds
        : undefined;
    if (typeof seconds === "number") {
      const d = new Date(seconds * 1000);
      return isNaN(d.getTime()) ? undefined : d;
    }
  }

  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d;
  }

  return undefined;
}

/**
 * Fetches published/active products for sitemap generation.
 * Uses Firebase Admin SDK when credentials are configured, with a safe fallback
 * to the public Firestore reader so builds never fail and never invent fake products.
 */
async function fetchActiveProductsForSitemap(): Promise<SitemapProductRecord[]> {
  // 1. Primary path: Server-side Firebase Admin SDK
  if (isFirebaseAdminConfigured()) {
    try {
      const adminDb = getAdminDb();
      const snapshot = await adminDb.collection("products").get();
      const records: SitemapProductRecord[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() || {};
        const isActive = data.active !== false;
        const rawSlug = typeof data.slug === "string" && data.slug.trim() ? data.slug.trim() : docSnap.id;
        const lastModified =
          parseFirestoreDate(data.updatedAt) || parseFirestoreDate(data.createdAt);

        if (isActive && rawSlug) {
          records.push({
            slugOrId: rawSlug,
            active: true,
            lastModified,
          });
        }
      });

      return records;
    } catch (error) {
      console.warn("[SITEMAP] Admin SDK product fetch failed, attempting public Firestore fallback:", error);
    }
  }

  // 2. Fallback path: Read-only Firestore query via existing product helper
  try {
    const { products } = await getProducts({ limit: 1000 });
    return products
      .filter((product) => product.active !== false && Boolean(product.slug || product.id))
      .map((product) => ({
        slugOrId: (product.slug || product.id).trim(),
        active: true,
        lastModified:
          parseFirestoreDate(product.updatedAt) || parseFirestoreDate(product.createdAt),
      }));
  } catch (error) {
    console.warn("[SITEMAP] Fallback product fetch failed, returning static routes only:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/shop`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/shipping`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/returns`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/terms`,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/privacy`,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  const seenUrls = new Set<string>(staticEntries.map((entry) => entry.url));
  const productRecords = await fetchActiveProductsForSitemap();

  const productEntries: MetadataRoute.Sitemap = [];
  for (const item of productRecords) {
    const encodedSlug = encodeURIComponent(item.slugOrId);
    const productUrl = `${SITE_URL}/product/${encodedSlug}`;

    if (seenUrls.has(productUrl)) {
      continue;
    }
    seenUrls.add(productUrl);

    const sitemapEntry: MetadataRoute.Sitemap[number] = {
      url: productUrl,
      changeFrequency: "weekly",
      priority: 0.8,
    };

    if (item.lastModified) {
      sitemapEntry.lastModified = item.lastModified;
    }

    productEntries.push(sitemapEntry);
  }

  return [...staticEntries, ...productEntries];
}
