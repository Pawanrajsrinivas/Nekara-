/**
 * NEKARA — Central SEO & Canonical Domain Configuration
 *
 * Canonical production domain: https://www.nekara.store
 */

export const CANONICAL_DOMAIN = "https://www.nekara.store";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ||
  CANONICAL_DOMAIN
);

export const SITE_NAME = "NEKARA";

export const DEFAULT_SEO_TITLE = "NEKARA | Sarees Online";

export const DEFAULT_SEO_DESCRIPTION =
  "Shop sarees online at NEKARA. Explore silk, Banarasi, Kanchipuram, cotton, party wear, and contemporary sarees with delivery across India.";

export const GOOGLE_SITE_VERIFICATION =
  "Q4Mwyaf2erOgeP4zVZ5NgpWtVLm0n5OYZn0SAuolZK8";

/**
 * Resolves a relative path or URL into a full canonical URL on https://www.nekara.store
 */
export function getCanonicalUrl(path = "/"): string {
  if (!path || path === "/") {
    return SITE_URL;
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}
