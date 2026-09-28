export interface NavItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
  badge?: string;
  subItems?: { label: string; href: string; description?: string }[];
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    label: "Sarees",
    href: "/shop",
    hasDropdown: true,
    subItems: [
      { label: "Kanjeevaram Silks", href: "/shop?category=kanchipuram-sarees" },
      { label: "Banarasi Heritage", href: "/shop?category=banarasi-sarees" },
      { label: "Chanderi & Maheshwari", href: "/shop?category=cotton-sarees" },
      { label: "Tussar & Raw Silk", href: "/shop?category=silk-sarees" },
      { label: "Handloom Georgette", href: "/shop?category=designer-sarees" },
    ],
  },
  {
    label: "Collections",
    href: "/collections",
    hasDropdown: true,
    subItems: [
      { label: "Bridal Heirloom 2026", href: "/collections/bridal" },
      { label: "Royal Festive Weaves", href: "/collections/festive" },
      { label: "Peacock Legacy Edition", href: "/collections/peacock-legacy" },
      { label: "Minimalist Silk Drapes", href: "/collections/minimalist" },
    ],
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Craftsmanship",
    href: "/craftsmanship",
  },
  {
    label: "Journal",
    href: "/journal",
  },
];

export const MOBILE_PRIMARY_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Sarees", href: "/shop", hasDropdown: true },
  { label: "Collections", href: "/collections", hasDropdown: true },
  { label: "About", href: "/about" },
  { label: "Craftsmanship", href: "/craftsmanship" },
  { label: "Journal", href: "/journal" },
  { label: "Contact", href: "/contact" },
];

export const MOBILE_SECONDARY_NAV_ITEMS: NavItem[] = [
  { label: "My Account", href: "/account" },
  { label: "My Orders", href: "/orders" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Cart", href: "/cart" },
];
