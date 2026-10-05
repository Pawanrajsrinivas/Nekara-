import { NextResponse } from "next/server";
import { isFirebaseAdminConfigured, getAdminDb } from "@/lib/firebase-admin";
import { getRazorpay } from "@/lib/razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Safe server-only diagnostic endpoint.
 * NEVER exposes secrets, private keys, or sensitive credentials.
 * Confirms whether Firebase Admin, Firestore, and Razorpay are functioning on Vercel.
 */
export async function GET() {
  const rawKey = process.env.FIREBASE_PRIVATE_KEY || "";
  const rawEmail = process.env.FIREBASE_CLIENT_EMAIL || "";
  const rawRzpKey = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  const rawRzpSecret = process.env.RAZORPAY_KEY_SECRET || "";

  const envCheck = {
    FIREBASE_PROJECT_ID: Boolean(
      process.env.FIREBASE_PROJECT_ID?.trim() || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim()
    ),
    firebaseProjectIdValue:
      process.env.FIREBASE_PROJECT_ID?.trim() || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() || "missing",
    FIREBASE_CLIENT_EMAIL: Boolean(rawEmail.trim()),
    clientEmailDomain: rawEmail.includes("@") ? rawEmail.split("@")[1] : "missing",
    FIREBASE_PRIVATE_KEY: Boolean(rawKey.trim()),
    privateKeyLength: rawKey.length,
    privateKeyHasBeginHeader: rawKey.includes("BEGIN PRIVATE KEY") || rawKey.includes("BEGIN RSA PRIVATE KEY"),
    privateKeyHasEndHeader: rawKey.includes("END PRIVATE KEY") || rawKey.includes("END RSA PRIVATE KEY"),
    privateKeyNewlineCount: (rawKey.match(/\n/g) || []).length,
    privateKeyEscapedNewlineCount: (rawKey.match(/\\n/g) || []).length,
    privateKeyDoubleEscapedNewlineCount: (rawKey.match(/\\\\n/g) || []).length,
    privateKeyHasSurroundingQuotes:
      (rawKey.trim().startsWith('"') && rawKey.trim().endsWith('"')) ||
      (rawKey.trim().startsWith("'") && rawKey.trim().endsWith("'")),
    RAZORPAY_KEY_ID: Boolean(rawRzpKey.trim()),
    razorpayKeyPrefix: rawRzpKey.trim().substring(0, 9),
    razorpayMode: rawRzpKey.trim().startsWith("rzp_test_")
      ? "test"
      : rawRzpKey.trim().startsWith("rzp_live_")
      ? "live"
      : "missing",
    RAZORPAY_KEY_SECRET: Boolean(rawRzpSecret.trim()),
    razorpayKeySecretLength: rawRzpSecret.trim().length,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: Boolean(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim()),
  };

  let firebaseAdminInitialized = false;
  let firestoreRead = false;
  let sampleProductFound = false;
  let firestoreDurationMs = 0;
  let firestoreError: string | null = null;

  // 1. Test Firebase Admin + Firestore with 3500ms safety timeout
  const firestoreStartTime = Date.now();
  try {
    const adminDb = getAdminDb();
    if (adminDb) {
      firebaseAdminInitialized = true;
      const readPromise = adminDb.collection("products").limit(1).get();
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Firestore read timed out after 3500ms")), 3500)
      );

      const snap = await Promise.race([readPromise, timeoutPromise]);
      firestoreDurationMs = Date.now() - firestoreStartTime;
      firestoreRead = true;
      sampleProductFound = !snap.empty;
    }
  } catch (err: any) {
    firestoreDurationMs = Date.now() - firestoreStartTime;
    firestoreError = err?.message || String(err);
    console.error("[DIAGNOSTICS] Firestore error:", firestoreError);
  }

  // 2. Test Razorpay Order Creation with 3500ms safety timeout
  let razorpayTestOrderSuccess = false;
  let razorpayTestOrderId: string | null = null;
  let razorpayTestDurationMs = 0;
  let razorpayError: string | null = null;

  const rzpStartTime = Date.now();
  try {
    const rzp = getRazorpay();
    const rzpPromise = rzp.orders.create({
      amount: 100, // ₹1 (100 paise)
      currency: "INR",
      receipt: `diag_${Date.now()}`,
      notes: { test: "diagnostic" },
    });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Razorpay orders.create timed out after 3500ms")), 3500)
    );

    const testOrder = await Promise.race([rzpPromise, timeoutPromise]);
    razorpayTestDurationMs = Date.now() - rzpStartTime;
    razorpayTestOrderSuccess = Boolean(testOrder?.id);
    razorpayTestOrderId = testOrder?.id || null;
  } catch (err: any) {
    razorpayTestDurationMs = Date.now() - rzpStartTime;
    razorpayError = err?.message || err?.error?.description || String(err);
    console.error("[DIAGNOSTICS] Razorpay error:", razorpayError);
  }

  const overallStatus = firestoreRead && razorpayTestOrderSuccess
    ? "healthy"
    : !firestoreRead && !razorpayTestOrderSuccess
    ? "both_services_failed"
    : !firestoreRead
    ? "firestore_failed"
    : "razorpay_failed";

  return NextResponse.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "unknown",
    vercelEnv: process.env.VERCEL_ENV || "unknown",
    vercelRegion: process.env.VERCEL_REGION || "unknown",
    envCheck,
    firebaseAdminConfigured: isFirebaseAdminConfigured(),
    firebaseAdminInitialized,
    firestore: {
      readSuccess: firestoreRead,
      sampleProductFound,
      durationMs: firestoreDurationMs,
      error: firestoreError,
    },
    razorpay: {
      orderCreateSuccess: razorpayTestOrderSuccess,
      testOrderId: razorpayTestOrderId,
      durationMs: razorpayTestDurationMs,
      error: razorpayError,
    },
  });
}
