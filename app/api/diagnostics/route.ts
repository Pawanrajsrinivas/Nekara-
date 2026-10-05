import { NextResponse } from "next/server";
import { isFirebaseAdminConfigured, getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Safe server-only diagnostic endpoint.
 * NEVER exposes secrets, private keys, or sensitive credentials.
 * Confirms whether Firebase Admin and Firestore are functioning on Vercel.
 */
export async function GET() {
  const envCheck = {
    FIREBASE_PROJECT_ID: Boolean(
      process.env.FIREBASE_PROJECT_ID?.trim() || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim()
    ),
    FIREBASE_CLIENT_EMAIL: Boolean(process.env.FIREBASE_CLIENT_EMAIL?.trim()),
    FIREBASE_PRIVATE_KEY: Boolean(process.env.FIREBASE_PRIVATE_KEY?.trim()),
    RAZORPAY_KEY_ID: Boolean(
      process.env.RAZORPAY_KEY_ID?.trim() || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim()
    ),
    RAZORPAY_KEY_SECRET: Boolean(process.env.RAZORPAY_KEY_SECRET?.trim()),
    NEXT_PUBLIC_RAZORPAY_KEY_ID: Boolean(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim()),
    RAZORPAY_MODE: (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "").startsWith("rzp_test_")
      ? "test"
      : (process.env.RAZORPAY_KEY_ID || "").startsWith("rzp_live_")
      ? "live"
      : "missing",
  };

  let firebaseAdminInitialized = false;
  let firestoreRead = false;
  let initError: string | null = null;
  let sampleProductFound = false;

  try {
    const adminDb = getAdminDb();
    if (adminDb) {
      firebaseAdminInitialized = true;
      const snap = await adminDb.collection("products").limit(1).get();
      firestoreRead = true;
      sampleProductFound = !snap.empty;
    }
  } catch (err: any) {
    initError = err?.message || "Failed to initialize Firebase Admin";
    console.error("[DIAGNOSTICS] Firebase Admin error:", err?.message);
  }

  return NextResponse.json({
    status: firestoreRead ? "healthy" : "misconfigured",
    environment: process.env.NODE_ENV || "unknown",
    vercelEnv: process.env.VERCEL_ENV || "local",
    envCheck,
    firebaseAdminConfigured: isFirebaseAdminConfigured(),
    firebaseAdminInitialized,
    firestoreRead,
    sampleProductFound,
    error: initError,
  });
}
