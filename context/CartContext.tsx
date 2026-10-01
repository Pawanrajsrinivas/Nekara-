"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { CartItem } from "@/types/auth";
import { NekaraProduct } from "@/types/product";
import { formatINR } from "@/lib/products";

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  formattedTotalAmount: string;
  loading: boolean;
  cartError: string | null;
  clearCartError: () => void;
  addToCart: (product: NekaraProduct, quantity?: number) => Promise<boolean>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshLiveStock: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cartError, setCartError] = useState<string | null>(null);

  const clearCartError = useCallback(() => {
    setCartError(null);
  }, []);

  /**
   * Helper to log diagnostic information safely in development without exposing secrets
   */
  const logDiagnostic = useCallback(
    (operation: string, subPath?: string) => {
      if (process.env.NODE_ENV === "development" && user) {
        const fullPath = subPath
          ? `carts/${user.uid}/${subPath}`
          : `carts/${user.uid}`;
        console.log(
          `[NEKARA CART] Authenticated UID: ${user.uid} | Path: ${fullPath} | Operation: ${operation}`
        );
      }
    },
    [user]
  );

  /**
   * Real-time synchronization with Firestore canonical path:
   * /carts/{userId}/items/{productId}
   */
  useEffect(() => {
    // If not authenticated or Firebase not ready, clear in-memory cart state immediately
    if (!isAuthenticated || !user || !db || typeof db.type !== "string") {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    logDiagnostic("onSnapshot (listener start)", "items");

    // Canonical Firestore subcollection: /carts/{uid}/items
    const cartItemsRef = collection(db, "carts", user.uid, "items");

    const unsubscribe = onSnapshot(
      cartItemsRef,
      async (snapshot) => {
        const cartList: CartItem[] = [];

        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          const productId = data.productId || docSnap.id;

          // Snapshot values saved when added
          const name = data.nameSnapshot || data.name || "Handcrafted Saree";
          const price =
            typeof data.priceSnapshot === "number"
              ? data.priceSnapshot
              : typeof data.price === "number"
              ? data.price
              : parseFloat(data.price) || 0;
          const originalPrice =
            data.originalPriceSnapshot || data.originalPrice
              ? Number(data.originalPriceSnapshot || data.originalPrice)
              : undefined;
          const image =
            data.imageSnapshot || data.image || "/images/categories/silk-sarees.jpg";
          const quantity = typeof data.quantity === "number" ? data.quantity : 1;

          cartList.push({
            id: docSnap.id,
            productId,
            name,
            nameSnapshot: data.nameSnapshot || name,
            slug: data.slug || productId,
            price,
            priceSnapshot: price,
            originalPrice,
            originalPriceSnapshot: originalPrice,
            image,
            imageSnapshot: image,
            quantity,
            stock: typeof data.stock === "number" ? data.stock : 10,
            fabric: data.fabric || "",
            color: data.color || "",
            categoryName: data.categoryName || "",
            addedAt: data.addedAt?.toDate
              ? data.addedAt.toDate().toISOString()
              : undefined,
            createdAt: data.createdAt?.toDate
              ? data.createdAt.toDate().toISOString()
              : undefined,
            updatedAt: data.updatedAt?.toDate
              ? data.updatedAt.toDate().toISOString()
              : undefined,
          });
        }

        setItems(cartList);
        setLoading(false);
      },
      (error) => {
        console.error(
          `[NEKARA CART] Listener error at carts/${user.uid}/items:`,
          error
        );
        if (error.code === "permission-denied") {
          setCartError(
            "Please ensure you are signed in with an authorized account to access your Shop Bag."
          );
        } else {
          setCartError("We couldn't synchronize your Shop Bag. Please try again.");
        }
        setLoading(false);
      }
    );

    return () => {
      logDiagnostic("onSnapshot (listener unsubscribe)", "items");
      unsubscribe();
    };
  }, [isAuthenticated, user, logDiagnostic]);

  /**
   * Re-verify current live stock from /products/{productId} for all items in the cart
   */
  const refreshLiveStock = useCallback(async () => {
    if (!isAuthenticated || !user || !db || items.length === 0) return;

    try {
      const updatedStockMap = new Map<string, number>();

      for (const item of items) {
        const prodDoc = await getDoc(doc(db, "products", item.productId));
        if (prodDoc.exists()) {
          const prodData = prodDoc.data();
          const liveStock =
            typeof prodData.stock === "number"
              ? prodData.stock
              : parseInt(prodData.stock, 10) || 0;
          updatedStockMap.set(item.productId, liveStock);
        }
      }

      setItems((prevItems) =>
        prevItems.map((item) => {
          if (updatedStockMap.has(item.productId)) {
            const liveStock = updatedStockMap.get(item.productId)!;
            return { ...item, stock: liveStock };
          }
          return item;
        })
      );
    } catch (err) {
      console.warn("[NEKARA Cart] Could not refresh live product stock:", err);
    }
  }, [isAuthenticated, user, items]);

  // Compute total item count (sum of all quantities: Saree A x 1 + Saree B x 2 = 3)
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Compute total price amount
  const totalAmount = items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );
  const formattedTotalAmount = formatINR(totalAmount);

  /**
   * Add a product to the authenticated user's Firestore Cart.
   *
   * BUSINESS RULE: Adding to cart DOES NOT decrement product inventory.
   * Stock in /products/{productId} remains untouched.
   */
  const addToCart = async (
    product: NekaraProduct,
    qty = 1
  ): Promise<boolean> => {
    setCartError(null);

    // 1. Check authentication
    if (!isAuthenticated || !user) {
      setCartError("Please sign in to add items to your Shop Bag.");
      return false;
    }

    if (!db || typeof db.type !== "string") {
      setCartError("Shop Bag service is temporarily unavailable.");
      return false;
    }

    // 2. Check product availability & stock
    const availableStock =
      typeof product.stock === "number" ? product.stock : 0;
    if (availableStock <= 0 || product.availability === "Out of Stock") {
      setCartError("This handcrafted saree is currently sold out.");
      return false;
    }

    // 3. Check requested quantity against existing cart quantity
    const existing = items.find((i) => i.productId === product.id);
    const currentQty = existing ? existing.quantity : 0;
    const requestedTotal = currentQty + qty;

    if (requestedTotal > availableStock) {
      setCartError(
        `Only ${availableStock} available in stock. You already have ${currentQty} in your bag.`
      );
      return false;
    }

    try {
      logDiagnostic(`setDoc (addToCart qty: ${qty})`, `items/${product.id}`);

      // Canonical Firestore item path: /carts/{uid}/items/{productId}
      const cartItemRef = doc(db, "carts", user.uid, "items", product.id);

      const payload = {
        productId: product.id,
        quantity: requestedTotal,
        nameSnapshot: product.name,
        priceSnapshot: product.price,
        originalPriceSnapshot: product.originalPrice || null,
        imageSnapshot: product.image,
        slug: product.slug,
        fabric: product.fabric || "",
        color: product.color || "",
        categoryName: product.categoryName || product.category || "",
        stock: availableStock,
        updatedAt: serverTimestamp(),
      };

      if (!existing) {
        (payload as any).addedAt = serverTimestamp();
      }

      await setDoc(cartItemRef, payload, { merge: true });

      // Update / ensure parent cart document exists: /carts/{uid}
      const cartDocRef = doc(db, "carts", user.uid);
      await setDoc(
        cartDocRef,
        {
          userId: user.uid,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // NOTICE: We strictly DO NOT decrement /products/{productId}.stock!
      return true;
    } catch (err: any) {
      console.error(
        `[NEKARA CART] Error writing to carts/${user.uid}/items/${product.id}:`,
        err
      );
      if (err.code === "permission-denied") {
        setCartError(
          "We could not update your Shop Bag due to permissions. Please verify you are signed in."
        );
      } else {
        setCartError("Failed to add saree to your Shop Bag. Please try again.");
      }
      return false;
    }
  };

  /**
   * Update item quantity in the cart.
   *
   * BUSINESS RULE: Does NOT modify product stock.
   */
  const updateQuantity = async (
    productId: string,
    quantity: number
  ): Promise<void> => {
    setCartError(null);
    if (!isAuthenticated || !user || !db || typeof db.type !== "string") return;

    try {
      const cartItemRef = doc(db, "carts", user.uid, "items", productId);

      if (quantity <= 0) {
        logDiagnostic("deleteDoc (quantity <= 0)", `items/${productId}`);
        await deleteDoc(cartItemRef);
      } else {
        // Enforce stock ceiling if available
        const currentItem = items.find((i) => i.productId === productId);
        let finalQuantity = quantity;

        if (currentItem?.stock && quantity > currentItem.stock) {
          finalQuantity = currentItem.stock;
          setCartError(`Only ${currentItem.stock} available in stock.`);
        }

        logDiagnostic(`updateDoc (quantity: ${finalQuantity})`, `items/${productId}`);
        await updateDoc(cartItemRef, {
          quantity: finalQuantity,
          updatedAt: serverTimestamp(),
        });
      }

      // Update parent document timestamp
      const cartDocRef = doc(db, "carts", user.uid);
      await setDoc(
        cartDocRef,
        {
          userId: user.uid,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err: any) {
      console.error(
        `[NEKARA CART] Error updating quantity at carts/${user.uid}/items/${productId}:`,
        err
      );
      setCartError("Could not update item quantity. Please try again.");
    }
  };

  /**
   * Remove a product from the authenticated user's cart.
   *
   * BUSINESS RULE: Does NOT modify product stock.
   */
  const removeFromCart = async (productId: string): Promise<void> => {
    setCartError(null);
    if (!isAuthenticated || !user || !db || typeof db.type !== "string") return;

    try {
      logDiagnostic("deleteDoc (removeFromCart)", `items/${productId}`);
      const cartItemRef = doc(db, "carts", user.uid, "items", productId);
      await deleteDoc(cartItemRef);

      // Update parent document timestamp
      const cartDocRef = doc(db, "carts", user.uid);
      await setDoc(
        cartDocRef,
        {
          userId: user.uid,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err: any) {
      console.error(
        `[NEKARA CART] Error removing from carts/${user.uid}/items/${productId}:`,
        err
      );
      setCartError("Could not remove saree from your Shop Bag.");
    }
  };

  /**
   * Clear all items from the authenticated user's cart.
   *
   * BUSINESS RULE: Does NOT modify product stock.
   */
  const clearCart = async (): Promise<void> => {
    setCartError(null);
    if (!isAuthenticated || !user || !db || typeof db.type !== "string") return;

    try {
      logDiagnostic("deleteDoc (clearCart batch)", "items");
      const cartItemsRef = collection(db, "carts", user.uid, "items");
      const snap = await getDocs(cartItemsRef);
      const deletePromises = snap.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(deletePromises);

      // Update parent cart doc
      const cartDocRef = doc(db, "carts", user.uid);
      await setDoc(
        cartDocRef,
        {
          userId: user.uid,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err: any) {
      console.error(
        `[NEKARA CART] Error clearing carts/${user.uid}/items:`,
        err
      );
      setCartError("Could not clear your Shop Bag.");
    }
  };

  const value: CartContextType = {
    items,
    totalItems,
    totalAmount,
    formattedTotalAmount,
    loading,
    cartError,
    clearCartError,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshLiveStock,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
