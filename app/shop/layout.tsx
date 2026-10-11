import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Sarees Online",
  description:
    "Explore NEKARA's online collection of silk, Banarasi, Kanchipuram, cotton, party wear, and contemporary sarees with delivery across India.",
  alternates: {
    canonical: "/shop",
  },
  openGraph: {
    title: "Shop Sarees Online | NEKARA",
    description:
      "Explore NEKARA's online collection of silk, Banarasi, Kanchipuram, cotton, party wear, and contemporary sarees with delivery across India.",
    url: "/shop",
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
