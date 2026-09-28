export interface TrustFeature {
  id: string;
  iconName: "lotus" | "weave" | "diamond" | "delivery";
  title: string;
  subtitle?: string;
}

export const TRUST_FEATURES: TrustFeature[] = [
  {
    id: "premium-quality",
    iconName: "lotus",
    title: "Premium Quality",
    subtitle: "Pure Silk & Zari",
  },
  {
    id: "traditional-weaves",
    iconName: "weave",
    title: "Traditional Weaves",
    subtitle: "Authentic Handlooms",
  },
  {
    id: "elegant-designs",
    iconName: "diamond",
    title: "Elegant Designs",
    subtitle: "Timeless Craft",
  },
  {
    id: "pan-india-delivery",
    iconName: "delivery",
    title: "Pan India Delivery",
    subtitle: "Insured & Express",
  },
];
