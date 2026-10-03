import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/products";
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const product = await getProductBySlug(decodedSlug);

  if (!product) {
    return {
      title: "Saree Not Found — NEKARA",
      description: "Discover our handcrafted collection of luxury Indian sarees.",
    };
  }

  return {
    title: `${product.name} — NEKARA Luxury Sarees`,
    description:
      product.description ||
      `Explore ${product.name} handcrafted in ${product.categoryName}. Authentic Indian handloom heritage from NEKARA.`,
    openGraph: {
      title: `${product.name} — NEKARA`,
      description: product.subtitle || product.description,
      images: product.image ? [{ url: product.image }] : [],
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

  return <ProductDetailView product={product} relatedProducts={relatedProducts} />;
}
