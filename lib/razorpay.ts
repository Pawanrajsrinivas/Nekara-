import Razorpay from "razorpay";

/**
 * Server-side singleton for Razorpay instance.
 * Uses environment variables RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.
 * Never expose RAZORPAY_KEY_SECRET to the client.
 */
let razorpayInstance: Razorpay | null = null;
let cachedKeyId: string | null = null;
let cachedKeySecret: string | null = null;

export function getRazorpay(): Razorpay {
  const serverKeyId = process.env.RAZORPAY_KEY_ID?.trim();
  const publicKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim();
  const keyId = serverKeyId || publicKeyId;
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    throw new Error(
      "[RAZORPAY] Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in environment variables."
    );
  }

  // Ensure public and server keys belong to the same mode (live vs test)
  if (serverKeyId && publicKeyId) {
    const serverMode = serverKeyId.startsWith("rzp_live_")
      ? "live"
      : serverKeyId.startsWith("rzp_test_")
      ? "test"
      : "unknown";
    const publicMode = publicKeyId.startsWith("rzp_live_")
      ? "live"
      : publicKeyId.startsWith("rzp_test_")
      ? "test"
      : "unknown";

    if (serverMode !== publicMode && serverMode !== "unknown" && publicMode !== "unknown") {
      throw new Error(
        `[RAZORPAY CONFIG ERROR] Mode mismatch: RAZORPAY_KEY_ID is in ${serverMode} mode, but NEXT_PUBLIC_RAZORPAY_KEY_ID is in ${publicMode} mode. Both must be set to the same mode.`
      );
    }
  }

  if (!razorpayInstance || cachedKeyId !== keyId || cachedKeySecret !== keySecret) {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    cachedKeyId = keyId;
    cachedKeySecret = keySecret;
  }

  return razorpayInstance;
}

/**
 * Client-side script loader for Razorpay checkout.js
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.getElementById("razorpay-checkout-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-checkout-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
