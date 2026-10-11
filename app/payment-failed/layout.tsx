import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Status",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PaymentFailedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
