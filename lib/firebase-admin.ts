/**
 * NEKARA Luxury Sarees — Firebase Admin SDK (Server-Side Only)
 * 
 * CRITICAL ARCHITECTURAL RULES:
 * 1. This module MUST NEVER be imported into client components or browser contexts.
 * 2. It is used exclusively by server API routes (/api/razorpay/...) and server actions
 *    for trusted payment verification, atomic inventory decrements, and order finalization.
 * 3. The Firebase Admin SDK operates with full administrative privileges on Firestore,
 *    bypassing client-facing Firestore Security Rules while keeping rules strictly locked down.
 */

import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore, FieldValue } from "firebase-admin/firestore";

let adminApp: App | undefined;
let adminDb: Firestore | undefined;

/**
 * Checks if Firebase Admin credentials are configured in the environment.
 */
export function isFirebaseAdminConfigured(): boolean {
  // 1. Check for individual environment variables
  if (
    process.env.FIREBASE_CLIENT_EMAIL?.trim() &&
    process.env.FIREBASE_PRIVATE_KEY?.trim()
  ) {
    return true;
  }

  // 2. Check for JSON service account string or base64
  if (
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim() ||
    process.env.FIREBASE_SERVICE_ACCOUNT?.trim()
  ) {
    return true;
  }

  return false;
}

/**
 * Formats a raw private key string from environment variables,
 * correctly restoring newlines (\n), stripping accidental wrapping quotes,
 * and handling Windows CRLF carriage returns.
 */
function formatPrivateKey(rawKey: string): string {
  if (!rawKey) return "";
  let key = rawKey.trim();

  // Strip wrapping single or double quotes
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }

  // Strip escaped quotes if passed as \"...\"
  if (key.startsWith('\\"') && key.endsWith('\\"')) {
    key = key.slice(2, -2).trim();
  }

  // Replace double-escaped \\n with \n
  key = key.replace(/\\\\n/g, "\n");

  // Replace escaped \n with actual newlines and remove Windows carriage returns
  key = key.replace(/\\n/g, "\n").replace(/\r/g, "");

  // If base64 encoded private key was provided:
  if (!key.includes("BEGIN PRIVATE KEY") && !key.includes("BEGIN RSA PRIVATE KEY")) {
    try {
      const decoded = Buffer.from(key, "base64").toString("utf-8");
      if (decoded.includes("BEGIN PRIVATE KEY") || decoded.includes("BEGIN RSA PRIVATE KEY")) {
        key = decoded.replace(/\r/g, "");
      }
    } catch {
      // not base64, keep key
    }
  }

  // Ensure trailing newline for OpenSSL PEM parser
  if (!key.endsWith("\n")) {
    key += "\n";
  }

  return key;
}

/**
 * Initializes or retrieves the Firebase Admin App singleton.
 */
export function getAdminApp(): App {
  if (adminApp) {
    return adminApp;
  }

  const existingApps = getApps();
  if (existingApps.length > 0) {
    adminApp = existingApps[0];
    return adminApp;
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID?.trim() ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ||
    "nekara-b0160";

  // Option A: Full service account JSON or Base64 string in single env var
  const serviceAccountJson =
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim() ||
    process.env.FIREBASE_SERVICE_ACCOUNT?.trim();

  if (serviceAccountJson) {
    try {
      let parsed = JSON.parse(
        serviceAccountJson.startsWith("{")
          ? serviceAccountJson
          : Buffer.from(serviceAccountJson, "base64").toString("utf-8")
      );
      adminApp = initializeApp({
        credential: cert(parsed),
        projectId: parsed.project_id || projectId,
      });
      return adminApp;
    } catch (e: any) {
      console.error("[FIREBASE ADMIN] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", e.message);
    }
  }

  // Option B: Individual environment variables
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (clientEmail && rawPrivateKey) {
    try {
      const privateKey = formatPrivateKey(rawPrivateKey);
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
      });
      return adminApp;
    } catch (e: any) {
      console.error("[FIREBASE ADMIN] Initialization with service account credentials failed:", e.message);
      throw new Error(
        `[FIREBASE ADMIN] Service account credential initialization failed: ${e.message}`
      );
    }
  }

  // No fallback — fail fast with a clear message instead of hanging 30s on metadata lookup
  throw new Error(
    "[FIREBASE ADMIN] Missing server-side credentials.\n" +
    "Set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in website/.env.local.\n" +
    "Get them from: Firebase Console → nekara-b0160 → Project Settings → Service Accounts → Generate new private key."
  );
}

/**
 * Returns the Firebase Admin Firestore instance.
 */
export function getAdminDb(): Firestore {
  if (!adminDb) {
    const app = getAdminApp();
    adminDb = getFirestore(app);
    // Explicitly configure settings for serverless environments (HTTP REST transport prevents gRPC channel hangs on Vercel/Lambda)
    try {
      adminDb.settings({ preferRest: true, ignoreUndefinedProperties: true });
    } catch {
      // Ignore if already initialized
    }
  }
  return adminDb;
}

export { FieldValue };
