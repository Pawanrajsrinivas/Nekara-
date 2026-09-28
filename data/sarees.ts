export interface SareeProduct {
  id: string;
  name: string;
  type: string;
  price: number;
  formattedPrice: string;
  image: string;
  alt: string;
  badge?: string;
  slug: string;
  href: string;
}

export const SIGNATURE_SAREES: SareeProduct[] = [
  {
    id: "kanchipuram-silk",
    name: "Kanchipuram Silk",
    type: "Pure Zari Temple Silk",
    price: 12500,
    formattedPrice: "₹12,500",
    image: "/images/categories/kanchipuram-sarees.jpg",
    alt: "Kanchipuram Silk Saree in regal crimson and gold zari",
    badge: "BESTSELLER",
    slug: "kanchipuram-silk",
    href: "/shop?category=kanchipuram-sarees",
  },
  {
    id: "soft-silk-saree",
    name: "Soft Silk Saree",
    type: "Royal Handloom Silk",
    price: 6800,
    formattedPrice: "₹6,800",
    image: "/images/categories/silk-sarees.jpg",
    alt: "Soft Silk Saree woven with delicate motifs",
    badge: "NEW",
    slug: "soft-silk-saree",
    href: "/shop?category=silk-sarees",
  },
  {
    id: "organza-saree",
    name: "Organza Saree",
    type: "Handwoven Pastel Zari",
    price: 4950,
    formattedPrice: "₹4,950",
    image: "/images/categories/banarasi-sarees.jpg",
    alt: "Ethereal Banarasi Organza Saree with floral jaal",
    slug: "organza-saree",
    href: "/shop?category=banarasi-sarees",
  },
  {
    id: "tissue-saree",
    name: "Tissue Saree",
    type: "Metallic Sheen Bridal Drape",
    price: 7200,
    formattedPrice: "₹7,200",
    image: "/images/categories/party-wear.jpg",
    alt: "Golden Crimson Festive Tissue Saree",
    slug: "tissue-saree",
    href: "/shop?category=party-wear",
  },
];
