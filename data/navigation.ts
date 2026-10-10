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
  },
  {
    label: "Category",
    href: "/shop",
    hasDropdown: true,
  },
  {
    label: "About",
    href: "/about",
  },
];

export const MOBILE_PRIMARY_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Sarees", href: "/shop" },
  { label: "Category", href: "/shop", hasDropdown: true },
  { label: "About", href: "/about" },
];

export const MOBILE_SECONDARY_NAV_ITEMS: NavItem[] = [
  { label: "My Account", href: "/account" },
  { label: "My Orders", href: "/orders" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Cart", href: "/cart" },
];
