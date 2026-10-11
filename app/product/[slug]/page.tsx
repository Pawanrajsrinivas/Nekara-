import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { getProductBySlug, getProducts } from "@/lib/products";
import { SITE_URL, SITE_NAME, getCanonicalUrl } from "@/lib/seo-config";
import { NekaraProduct } from "@/types/product";
import { ProductDetailView } from "@/components/product/ProductDetailView";
import { IndianOrnament } from "@/components/ui/IndianOrnament";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

function buildProductSeoDescription(product: NekaraProduct): string {
  const rawDescription = (product.description || product.shortDescription || "").trim();
  if (rawDescription.length >= 40) {
    return rawDescription.slice(0, 160);
  }
  const attributes = [
    product.fabric,
    product.color,
    product.weave,
    product.categoryName || product.category,
  ]
    .filter(Boolean)
    .join(", ");
  return attributes
    ? `Shop ${product.name} (${attributes}) online at NEKARA with delivery across India.`
    : `Shop ${product.name} online at NEKARA with delivery across India.`;
}

function resolveAbsoluteImageUrl(imageUrl: string): string {
  if (!imageUrl) return `${SITE_URL}/images/categories/silk-sarees.jpg`;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  return `${SITE_URL}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const product = await getProductBySlug(decodedSlug);

  if (!product) {
    return {
      title: "Saree Not Found",
      description: "Explore sarees online at NEKARA.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalSlug = encodeURIComponent(product.slug || product.id);
  const canonicalPath = `/product/${canonicalSlug}`;
  const description = buildProductSeoDescription(product);
  const primaryImage = resolveAbsoluteImageUrl(product.image);
  const isIndexable = product.active !== false;

  return {
    title: product.name,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    robots: isIndexable
      ? {
          index: true,
          follow: true,
        }
      : {
          index: false,
          follow: false,
        },
    openGraph: {
      type: "website",
      url: getCanonicalUrl(canonicalPath),
      siteName: SITE_NAME,
      title: `${product.name} | ${SITE_NAME}`,
      description,
      images: product.image
        ? [
            {
              url: primaryImage,
              alt: product.name,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ${SITE_NAME}`,
      description,
      images: product.image ? [primaryImage] : [],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const product = await getProductBySlug(decodedSlug);

  if (!product) {
    return (
      <div className="w-full bg-[#FDFBF7] min-h-[70vh] flex flex-col items-center justify-center pt-36 pb-20 px-4 text-center">
        <div className="bg-[#FAF6F0] border border-[#B58A45]/30 rounded-xs p-8 sm:p-12 max-w-lg mx-auto shadow-sm">
          <IndianOrnament size={28} className="text-[#B58A45] mb-4 mx-auto" />
          <h1 className="font-serif text-2xl sm:text-3xl text-[#241A15] font-normal mb-2">
            Saree Not Found
          </h1>
          <p className="text-xs sm:text-sm text-[#3A2115]/70 max-w-sm mx-auto mb-6">
            The weave you are searching for may have been archived or belongs to an exclusive private collection.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-8 py-3 rounded-xs bg-[#02221D] hover:bg-[#075E5A] text-[#FAF5ED] font-sans font-semibold text-xs tracking-[0.18em] uppercase transition-all shadow-sm min-h-[44px]"
          >
            Explore Available Sarees
          </Link>
        </div>
      </div>
    );
  }

  // Fetch complementary / related products
  let relatedProducts: NekaraProduct[] = [];
  try {
    const relatedResult = await getProducts({
      category: product.categoryName,
      limit: 6,
    });
    relatedProducts = relatedResult.products.filter((p) => p.id !== product.id).slice(0, 4);

    // If not enough products in same category, get general products
    if (relatedProducts.length < 2) {
      const generalResult = await getProducts({ limit: 6 });
      relatedProducts = generalResult.products.filter((p) => p.id !== product.id).slice(0, 4);
    }
  } catch (error) {
    console.warn("Could not fetch related products:", error);
  }

  const canonicalSlug = encodeURIComponent(product.slug || product.id);
  const canonicalProductUrl = getCanonicalUrl(`/product/${canonicalSlug}`);
  const structuredImages = (
    product.images && product.images.length > 0 ? product.images : [product.image]
  )
    .filter(Boolean)
    .map(resolveAbsoluteImageUrl);

  const schemaAvailability =
    product.stock > 0 && product.availability !== "Out of Stock"
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";

  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: buildProductSeoDescription(product),
    image: structuredImages,
    sku: product.sku || product.id,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    ...(product.categoryName || product.category
      ? { category: product.categoryName || product.category }
      : {}),
    ...(product.fabric ? { material: product.fabric } : {}),
    ...(product.color ? { color: product.color } : {}),
    ...(typeof product.price === "number" && product.price > 0
      ? {
          offers: {
            "@type": "Offer",
            url: canonicalProductUrl,
            priceCurrency: "INR",
            price: Number(product.price).toFixed(2),
            availability: schemaAvailability,
            itemCondition: "https://schema.org/NewCondition",
          },
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop",
        item: `${SITE_URL}/shop`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: canonicalProductUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <ProductDetailView product={product} relatedProducts={relatedProducts} />
    </>
  );
}

