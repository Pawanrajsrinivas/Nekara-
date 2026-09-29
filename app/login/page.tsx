"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { getProductBySlug } from "@/lib/products";
import { IndianOrnament } from "@/components/ui/IndianOrnament";
import { cn } from "@/lib/utils";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, signInWithEmail, signInWithGoogle, authError, clearAuthError, loading: authLoading } = useAuth();
  const { addToCart } = useCart();

  const redirectUrl = searchParams.get("redirect") || "/account";
  const action = searchParams.get("action");
  const qtyParam = searchParams.get("qty");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // If already authenticated and not pending a submit, navigate away
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      handlePostAuthRedirect();
    }
  }, [isAuthenticated, authLoading, user]);

  const handlePostAuthRedirect = async () => {
    // If user arrived from "Add to Cart" flow:
    if (action === "addToCart" && redirectUrl.startsWith("/product/")) {
      const slug = redirectUrl.replace("/product/", "").split("?")[0];
      try {
        const product = await getProductBySlug(slug);
        if (product) {
          const qty = parseInt(qtyParam || "1", 10) || 1;
          await addToCart(product, qty);
          // Navigate directly to cart with the newly added item
          router.replace("/cart");
          return;
        }
      } catch (err) {
        console.warn("[NEKARA Login] Auto add to cart error:", err);
      }
    }

    router.replace(redirectUrl);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (!email.trim()) {
      setLocalError("Please enter your email address.");
      return;
    }
    if (!password) {
      setLocalError("Please enter your password.");
      return;
    }

    setSubmitting(true);
    const success = await signInWithEmail(email, password);
    setSubmitting(false);

    if (success) {
      await handlePostAuthRedirect();
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    clearAuthError();
    setSubmitting(true);
    const success = await signInWithGoogle();
    setSubmitting(false);

    if (success) {
      await handlePostAuthRedirect();
    }
  };

  return (
    <div className="w-full min-h-screen pt-28 sm:pt-36 pb-20 px-4 flex items-center justify-center bg-[#FDFBF7]">
      <div className="w-full max-w-md bg-[#FFFBF5] rounded-xs border border-[#B58A45]/30 shadow-[0_8px_32px_rgba(58,33,21,0.06)] p-6 sm:p-10 relative overflow-hidden">
        {/* Subtle Watermark Medallion */}
        <div className="absolute -top-12 -right-12 w-36 h-36 opacity-10 pointer-events-none select-none">
          <Image src="/images/brand/brand1.png" alt="" fill className="object-contain" />
        </div>

        {/* Top Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-8 h-[1px] bg-[#B58A45]/40" />
            <IndianOrnament size={20} className="text-[#B58A45]" />
            <span className="w-8 h-[1px] bg-[#B58A45]/40" />
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl text-[#241A15] font-normal tracking-wide">
            Welcome to NEKARA
          </h1>
          <p className="text-xs sm:text-sm text-[#3A2115]/70 mt-1.5 font-sans">
            Sign in to access your personal shopping bag and curated drapes
          </p>

          {/* Context Notice if redirected from Cart or Add to Cart */}
          {action === "addToCart" ? (
            <div className="mt-4 p-3 bg-[#FAF3E7] border border-[#B58A45]/30 rounded-xs text-[11px] text-[#075E5A] font-medium">
              Please sign in to add this handcrafted saree to your shopping bag.
            </div>
          ) : redirectUrl.includes("/cart") ? (
            <div className="mt-4 p-3 bg-[#FAF3E7] border border-[#B58A45]/30 rounded-xs text-[11px] text-[#075E5A] font-medium">
              Please sign in to view and manage your shopping bag.
            </div>
          ) : null}
        </div>

        {/* Error Notification */}
        {(localError || authError) && (
          <div className="mb-6 p-3 bg-[#FAF0F0] border border-[#8B2626]/30 rounded-xs text-xs text-[#8B2626] font-sans">
            {localError || authError}
          </div>
        )}

        {/* Google Authentication Button */}
        <div className="mb-6 relative z-10">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={submitting}
            className="w-full h-12 px-4 rounded-xs border border-[#B58A45]/40 bg-[#FAF6F0] hover:bg-[#FAF3E7] text-[#241A15] font-sans font-medium text-xs sm:text-[13px] tracking-wide transition-all flex items-center justify-center gap-3 shadow-xs hover:shadow-sm disabled:opacity-50 min-h-[44px]"
          >
            {/* Official Google 'G' icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-full border-t border-[#B58A45]/20" />
          <span className="px-3 bg-[#FFFBF5] text-[10px] sm:text-xs font-sans uppercase tracking-widest text-[#3A2115]/50">
            Or with email
          </span>
          <div className="w-full border-t border-[#B58A45]/20" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4 relative z-10">
          <div>
            <label
              htmlFor="login-email"
              className="block text-[11px] font-sans font-semibold uppercase tracking-wider text-[#3A2115]/80 mb-1.5"
            >
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@domain.com"
              className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#B58A45]/30 rounded-xs text-xs text-[#241A15] placeholder:text-[#3A2115]/40 focus:outline-none focus:ring-1 focus:ring-[#075E5A] focus:border-[#075E5A] min-h-[44px]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="login-password"
                className="block text-[11px] font-sans font-semibold uppercase tracking-wider text-[#3A2115]/80"
              >
                Password
              </label>
            </div>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#B58A45]/30 rounded-xs text-xs text-[#241A15] placeholder:text-[#3A2115]/40 focus:outline-none focus:ring-1 focus:ring-[#075E5A] focus:border-[#075E5A] min-h-[44px]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 mt-2 rounded-xs bg-[#02221D] hover:bg-[#075E5A] text-[#FAF5ED] font-sans font-semibold text-xs tracking-[0.18em] uppercase transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 min-h-[44px] flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span>Signing in...</span>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Footer Navigation Link to Signup */}
        <div className="mt-8 pt-6 border-t border-[#B58A45]/20 text-center relative z-10">
          <p className="text-xs text-[#3A2115]/75 font-sans">
            Don&apos;t have an account?{" "}
            <Link
              href={`/signup${searchParams.toString() ? `?${searchParams.toString()}` : ""}`}
              className="font-semibold text-[#075E5A] hover:text-[#B58A45] underline ml-1 transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen pt-36 pb-20 flex items-center justify-center bg-[#FDFBF7]">
          <div className="w-10 h-10 border-2 border-[#B58A45] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
