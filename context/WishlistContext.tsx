"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { NekaraProduct } from "@/types/product";
import { mapDocToProduct } from "@/lib/products";
import { useRouter } from "next/navigation";

interface WishlistContextType {
  wishlistIds: string[];
  wishlistProducts: NekaraProduct[];
  wishlistCount: number;
  loading: boolean;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (product: NekaraProduct) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<NekaraProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Cache to avoid refetching product docs unnecessarily
  const productCacheRef = useRef<Map<string, NekaraProduct>>(new Map());

  /**
   * Helper to fetch full product details for an array of product IDs
   */
  const loadProductDetails = useCallback(async (ids: string[]) => {
    if (!db || ids.length === 0) {
      setWishlistProducts([]);
      return;
    }

    try {
      const loaded: NekaraProduct[] = [];

      for (const id of ids) {
        // Check local cache first
        if (productCacheRef.current.has(id)) {
          loaded.push(productCacheRef.current.get(id)!);
          continue;
        }

        try {
          const prodRef = doc(db, "products", id);
          const snap = await getDoc(prodRef);

          if (snap.exists()) {
            const product = mapDocToProduct(snap.id, snap.data());
            productCacheRef.current.set(id, product);
            loaded.push(product);
          } else {
            // Product deleted or not found: create a placeholder item so user can remove it safely
            const tombstone: NekaraProduct = {
              id,
              name: "Product No Longer Available",
              slug: id,
              subtitle: "This heirloom piece has been retired from the collection.",
              description: "",
              price: 0,
              formattedPrice: "—",
              image: "/images/categories/silk-sarees.jpg",
              images: ["/images/categories/silk-sarees.jpg"],
              category: "Archived",
              categoryId: "",
              categoryName: "Archived",
              stock: 0,
              rating: 0,
              availability: "Out of Stock",
              href: "#",
              active: false,
            };
            loaded.push(tombstone);
          }
        } catch (fetchErr) {
          console.warn(`[NEKARA WISHLIST] Could not load product ${id}:`, fetchErr);
        }
      }

      setWishlistProducts(loaded);
    } catch (err) {
      console.error("[NEKARA WISHLIST] Error fetching wishlist products:", err);
    }
  }, []);

  /**
   * Real-time Firestore sync with the authenticated user's profile document:
   * /users/{userId} -> field "wishlist": string[]
   */
  useEffect(() => {
    if (!isAuthenticated || !user || !db || typeof db.type !== "string") {
      setWishlistIds([]);
      setWishlistProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const userRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const ids: string[] = Array.isArray(data.wishlist) ? data.wishlist : [];
          setWishlistIds(ids);
          loadProductDetails(ids);
        } else {
          setWishlistIds([]);
          setWishlistProducts([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error("[NEKARA WISHLIST] Firestore snapshot error:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isAuthenticated, user, loadProductDetails]);

  /**
   * Check if a product ID is wishlisted
   */
  const isWishlisted = useCallback(
    (productId: string) => {
      return wishlistIds.includes(productId);
    },
    [wishlistIds]
  );

  /**
   * Toggle a product in/out of the user's wishlist
   */
  const toggleWishlist = useCallback(
    async (product: NekaraProduct): Promise<boolean> => {
      if (!isAuthenticated || !user) {
        // Redirect unauthenticated user to login with return path
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
        }
        return false;
      }

      if (!db || typeof db.type !== "string") {
        return false;
      }

      const id = product.id;
      const currentlyWishlisted = wishlistIds.includes(id);
      const userRef = doc(db, "users", user.uid);

      // Cache product data in memory for immediate display
      productCacheRef.current.set(id, product);

      if (currentlyWishlisted) {
        // Optimistic local remove
        setWishlistIds((prev) => prev.filter((item) => item !== id));
        setWishlistProducts((prev) => prev.filter((item) => item.id !== id));

        try {
          await updateDoc(userRef, {
            wishlist: arrayRemove(id),
          });
          return false;
        } catch (err) {
          console.error("[NEKARA WISHLIST] Failed to remove from wishlist:", err);
          // Rollback on failure
          setWishlistIds((prev) => [...prev, id]);
          return true;
        }
      } else {
        // Optimistic local add
        setWishlistIds((prev) => [...prev, id]);
        setWishlistProducts((prev) => [product, ...prev]);

        try {
          await setDoc(
            userRef,
            {
              wishlist: arrayUnion(id),
            },
            { merge: true }
          );
          return true;
        } catch (err) {
          console.error("[NEKARA WISHLIST] Failed to add to wishlist:", err);
          // Rollback on failure
          setWishlistIds((prev) => prev.filter((item) => item !== id));
          return false;
        }
      }
    },
    [isAuthenticated, user, wishlistIds, router]
  );

  /**
   * Directly remove a product from wishlist
   */
  const removeFromWishlist = useCallback(
    async (productId: string) => {
      if (!isAuthenticated || !user || !db || typeof db.type !== "string") {
        return;
      }

      // Optimistic local update
      setWishlistIds((prev) => prev.filter((id) => id !== productId));
      setWishlistProducts((prev) => prev.filter((p) => p.id !== productId));

      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          wishlist: arrayRemove(productId),
        });
      } catch (err) {
        console.error("[NEKARA WISHLIST] Failed to remove item:", err);
      }
    },
    [isAuthenticated, user]
  );

  /**
   * Manually force a re-fetch of wishlist products
   */
  const refreshWishlist = useCallback(async () => {
    await loadProductDetails(wishlistIds);
  }, [loadProductDetails, wishlistIds]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistProducts,
        wishlistCount: wishlistIds.length,
        loading,
        isWishlisted,
        toggleWishlist,
        removeFromWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
