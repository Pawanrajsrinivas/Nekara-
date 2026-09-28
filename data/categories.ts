export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  href: string;
  image: string;
  alt: string;
}

export const CATEGORIES_DATA: CategoryItem[] = [
  {
    id: "silk-sarees",
    name: "Silk Sarees",
    slug: "silk-sarees",
    href: "/shop?category=silk-sarees",
    image: "/images/categories/silk-sarees.jpg",
    alt: "Handcrafted pure Silk Sarees collection",
  },
  {
    id: "cotton-sarees",
    name: "Cotton Sarees",
    slug: "cotton-sarees",
    href: "/shop?category=cotton-sarees",
    image: "/images/categories/cotton-sarees.jpg",
    alt: "Authentic Handloom Cotton Sarees collection",
  },
  {
    id: "banarasi-sarees",
    name: "Banarasi Sarees",
    slug: "banarasi-sarees",
    href: "/shop?category=banarasi-sarees",
    image: "/images/categories/banarasi-sarees.jpg",
    alt: "Royal Banarasi Silk & Zari Weaves collection",
  },
  {
    id: "kanchipuram-sarees",
    name: "Kanchipuram Sarees",
    slug: "kanchipuram-sarees",
    href: "/shop?category=kanchipuram-sarees",
    image: "/images/categories/kanchipuram-sarees.jpg",
    alt: "Pure Kanchipuram Bridal & Temple Silk Sarees",
  },
  {
    id: "party-wear",
    name: "Party Wear",
    slug: "party-wear",
    href: "/shop?category=party-wear",
    image: "/images/categories/party-wear.jpg",
    alt: "Celebration & Festive Party Wear Sarees",
  },
  {
    id: "designer-sarees",
    name: "Designer Sarees",
    slug: "designer-sarees",
    href: "/shop?category=designer-sarees",
    image: "/images/categories/designer-sarees.jpg",
    alt: "Contemporary Haute Couture & Designer Sarees",
  },
];
