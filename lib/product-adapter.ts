import { NekaraProduct, DummyJsonProduct, SareeCategory } from "@/types/product";

/**
 * Deterministic Indian Rupee string formatting.
 * Guaranteed identical output across SSR and client hydration.
 */
export function formatINR(amount: number): string {
  const str = Math.round(amount).toString();
  if (str.length <= 3) return `₹${str}`;
  const lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  const formattedOthers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `₹${formattedOthers},${lastThree}`;
}

/**
 * Curated authentic Indian luxury saree profiles.
 * Used to deterministically transform raw DummyJSON items into NEKARA products.
 */
interface SareeProfile {
  name: string;
  subtitle: string;
  category: SareeCategory;
  price: number;
  originalPrice?: number;
  badge?: "NEW" | "BESTSELLER" | "EDITOR'S PICK";
  description: string;
}

const SAREE_PROFILES: SareeProfile[] = [
  {
    name: "Kanchipuram Silk Saree",
    subtitle: "Pure Zari Temple Silk",
    category: "Kanchipuram Sarees",
    price: 12500,
    originalPrice: 15000,
    badge: "BESTSELLER",
    description: "Handcrafted pure mulberry silk woven with opulent gold zari motifs, honoring centuries of royal Dravidian heritage.",
  },
  {
    name: "Soft Silk Festive Saree",
    subtitle: "Royal Handloom Mulberry Silk",
    category: "Silk Sarees",
    price: 6800,
    originalPrice: 8500,
    badge: "NEW",
    description: "Lightweight and radiant silk drape woven with fine zari butis, ideal for festive celebrations and sacred rituals.",
  },
  {
    name: "Banarasi Organza Saree",
    subtitle: "Handwoven Pastel Gold Zari",
    category: "Banarasi Sarees",
    price: 4950,
    description: "Delicate and ethereal organza silk with intricate antique gold floral jaal work handcrafted by Varanasi master weavers.",
  },
  {
    name: "Royal Crimson Tissue Saree",
    subtitle: "Metallic Sheen Bridal Drape",
    category: "Party Wear",
    price: 7200,
    originalPrice: 9000,
    description: "Stunning metallic luster with delicate hand-embroidered borders, tailored for celebrations, weddings, and soirees.",
  },
  {
    name: "Chanderi Handloom Saree",
    subtitle: "Fine Zari Border & Floral Butis",
    category: "Cotton Sarees",
    price: 5400,
    badge: "EDITOR'S PICK",
    description: "Traditional Chanderi weave blending sheer cotton silk with shimmering gold border elegance for breathable grace.",
  },
  {
    name: "Tussar Georgette Drape",
    subtitle: "Contemporary Couture Saree",
    category: "Designer Sarees",
    price: 8900,
    originalPrice: 11000,
    description: "A modern interpretation of indigenous Indian silks, combining fluid drape with artisanal hand-embroidered accents.",
  },
  {
    name: "Varanasi Kadwa Silk Saree",
    subtitle: "Heritage Pure Zari Brocade",
    category: "Banarasi Sarees",
    price: 14200,
    badge: "BESTSELLER",
    description: "Authentic Kadwa handloom technique where each leaf and peacock motif is individually etched into pure katan silk.",
  },
  {
    name: "Pure Maheshwari Cotton Silk",
    subtitle: "Reversible Border Handloom",
    category: "Cotton Sarees",
    price: 3850,
    description: "Handcrafted by master artisans of Madhya Pradesh featuring historic fort and sacred Narmada river patterns.",
  },
  {
    name: "Peacock Legacy Bridal Saree",
    subtitle: "Opulent Pure Zari Masterpiece",
    category: "Kanchipuram Sarees",
    price: 18500,
    originalPrice: 22000,
    badge: "NEW",
    description: "The crown jewel of NEKARA bridal drapes, adorned with majestic peacock and mayil motifs in certified pure zari.",
  },
  {
    name: "Hand-Painted Kalamkari Silk",
    subtitle: "Artisanal Natural Dye Drape",
    category: "Designer Sarees",
    price: 9600,
    description: "Exquisite hand-painted mythological and botanical murals on pure silk using organic dyes and bamboo pens.",
  },
  {
    name: "Rose Blush Shimmer Tissue",
    subtitle: "Celebration Evening Saree",
    category: "Party Wear",
    price: 6200,
    description: "Reflective metallic sheen with scalloped zari edging, catching the ambient light gracefully with every step.",
  },
  {
    name: "Raw Silk Temple Border Saree",
    subtitle: "South Heritage Handspun Drape",
    category: "Silk Sarees",
    price: 7500,
    badge: "EDITOR'S PICK",
    description: "Textured pure raw silk highlighted by contrasting korvai temple borders in heritage temple jewel tones.",
  },
];

/**
 * Transforms a raw DummyJSON product into a luxury NEKARA Saree product.
 * Fully deterministic based on the product ID / index.
 */
export function transformDummyJsonProduct(
  raw: DummyJsonProduct,
  index: number
): NekaraProduct {
  const profileIndex = (raw.id + index) % SAREE_PROFILES.length;
  const profile = SAREE_PROFILES[profileIndex];

  // Image strategy: Use DummyJSON thumbnail / image, with reliable local fallback
  const primaryImage = raw.thumbnail || (raw.images && raw.images[0]) || "/images/categories/silk-sarees.jpg";
  const allImages = raw.images && raw.images.length > 0 ? raw.images : [primaryImage];

  const slug = `${profile.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${raw.id}`;

  return {
    id: `nekara-${raw.id}`,
    name: profile.name,
    subtitle: profile.subtitle,
    description: profile.description || raw.description,
    price: profile.price,
    formattedPrice: formatINR(profile.price),
    originalPrice: profile.originalPrice,
    formattedOriginalPrice: profile.originalPrice ? formatINR(profile.originalPrice) : undefined,
    discountPercentage: profile.originalPrice
      ? Math.round(((profile.originalPrice - profile.price) / profile.originalPrice) * 100)
      : undefined,
    image: primaryImage,
    images: allImages,
    category: profile.category,
    rating: raw.rating || 4.8,
    badge: profile.badge,
    availability: (raw.stock && raw.stock < 5) ? "Low Stock" : "In Stock",
    slug,
    href: `/shop?category=${encodeURIComponent(profile.category.toLowerCase().replace(/\s+/g, "-"))}`,
  };
}

/**
 * High-quality fallback dataset using only local project assets.
 * Ensures the website continues to render seamlessly even if DummyJSON is offline.
 */
export const FALLBACK_PRODUCTS: NekaraProduct[] = [
  {
    id: "nekara-fallback-1",
    name: "Kanchipuram Silk Saree",
    subtitle: "Pure Zari Temple Silk",
    description: "Handcrafted pure mulberry silk woven with opulent gold zari motifs, honoring centuries of royal Dravidian heritage.",
    price: 12500,
    formattedPrice: "₹12,500",
    originalPrice: 15000,
    formattedOriginalPrice: "₹15,000",
    discountPercentage: 17,
    image: "/images/categories/kanchipuram-sarees.jpg",
    images: ["/images/categories/kanchipuram-sarees.jpg"],
    category: "Kanchipuram Sarees",
    rating: 4.9,
    badge: "BESTSELLER",
    availability: "In Stock",
    slug: "kanchipuram-silk-saree-1",
    href: "/shop?category=kanchipuram-sarees",
  },
  {
    id: "nekara-fallback-2",
    name: "Soft Silk Festive Saree",
    subtitle: "Royal Handloom Mulberry Silk",
    description: "Lightweight and radiant silk drape woven with fine zari butis, ideal for festive celebrations and sacred rituals.",
    price: 6800,
    formattedPrice: "₹6,800",
    originalPrice: 8500,
    formattedOriginalPrice: "₹8,500",
    discountPercentage: 20,
    image: "/images/categories/silk-sarees.jpg",
    images: ["/images/categories/silk-sarees.jpg"],
    category: "Silk Sarees",
    rating: 4.8,
    badge: "NEW",
    availability: "In Stock",
    slug: "soft-silk-festive-saree-2",
    href: "/shop?category=silk-sarees",
  },
  {
    id: "nekara-fallback-3",
    name: "Banarasi Organza Saree",
    subtitle: "Handwoven Pastel Gold Zari",
    description: "Delicate and ethereal organza silk with intricate antique gold floral jaal work handcrafted by Varanasi master weavers.",
    price: 4950,
    formattedPrice: "₹4,950",
    image: "/images/categories/banarasi-sarees.jpg",
    images: ["/images/categories/banarasi-sarees.jpg"],
    category: "Banarasi Sarees",
    rating: 4.7,
    availability: "In Stock",
    slug: "banarasi-organza-saree-3",
    href: "/shop?category=banarasi-sarees",
  },
  {
    id: "nekara-fallback-4",
    name: "Royal Crimson Tissue Saree",
    subtitle: "Metallic Sheen Bridal Drape",
    description: "Stunning metallic luster with delicate hand-embroidered borders, tailored for celebrations, weddings, and soirees.",
    price: 7200,
    formattedPrice: "₹7,200",
    originalPrice: 9000,
    formattedOriginalPrice: "₹9,000",
    discountPercentage: 20,
    image: "/images/categories/party-wear.jpg",
    images: ["/images/categories/party-wear.jpg"],
    category: "Party Wear",
    rating: 4.9,
    availability: "In Stock",
    slug: "royal-crimson-tissue-saree-4",
    href: "/shop?category=party-wear",
  },
  {
    id: "nekara-fallback-5",
    name: "Chanderi Handloom Saree",
    subtitle: "Fine Zari Border & Floral Butis",
    description: "Traditional Chanderi weave blending sheer cotton silk with shimmering gold border elegance for breathable grace.",
    price: 5400,
    formattedPrice: "₹5,400",
    image: "/images/categories/cotton-sarees.jpg",
    images: ["/images/categories/cotton-sarees.jpg"],
    category: "Cotton Sarees",
    rating: 4.8,
    badge: "EDITOR'S PICK",
    availability: "In Stock",
    slug: "chanderi-handloom-saree-5",
    href: "/shop?category=cotton-sarees",
  },
  {
    id: "nekara-fallback-6",
    name: "Tussar Georgette Drape",
    subtitle: "Contemporary Couture Saree",
    description: "A modern interpretation of indigenous Indian silks, combining fluid drape with artisanal hand-embroidered accents.",
    price: 8900,
    formattedPrice: "₹8,900",
    originalPrice: 11000,
    formattedOriginalPrice: "₹11,000",
    discountPercentage: 19,
    image: "/images/categories/designer-sarees.jpg",
    images: ["/images/categories/designer-sarees.jpg"],
    category: "Designer Sarees",
    rating: 4.8,
    availability: "In Stock",
    slug: "tussar-georgette-drape-6",
    href: "/shop?category=designer-sarees",
  },
];
