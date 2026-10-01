import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond, Montserrat } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NEKARA — Luxury Indian Sarees & Handloom Textiles | Estd. 2001",
  description:
    "Discover timeless handcrafted sarees, heirloom bridal silks, Kanjeevarams, and Banarasi weaves at NEKARA. Established in 2001.",
  icons: {
    icon: [
      {
        url: "/images/brand/tab_logo.png",
        type: "image/png",
      },
      {
        url: "/icon.png",
        type: "image/png",
      },
    ],
    shortcut: "/images/brand/tab_logo.png",
    apple: "/images/brand/tab_logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${cinzel.variable} ${cormorant.variable} ${montserrat.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/images/brand/tab_logo.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/images/brand/tab_logo.png" />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[#FDFBF7] text-[#241A15] font-sans selection:bg-[#075E5A] selection:text-[#F7F0E4]"
      >
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Navbar />
              <main className="flex-1 w-full">{children}</main>
              <Footer />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
