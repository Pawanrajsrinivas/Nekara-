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
  addToCart: (product: NekaraProduct, quantity?: number) => Promise<boolean>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Real-time synchronization with Firestore subcollection /users/{uid}/cart
  useEffect(() => {
    if (!isAuthenticated || !user || !db || typeof db.type !== "string") {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const cartRef = collection(db, "users", user.uid, "cart");

    const unsubscribe = onSnapshot(
      cartRef,
      (snapshot) => {
        const cartList: CartItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          cartList.push({
            id: docSnap.id,
            productId: data.productId || docSnap.id,
            name: data.name || "Handcrafted Saree",
            slug: data.slug || docSnap.id,
            price: typeof data.price === "number" ? data.price : parseFloat(data.price) || 0,
            originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
            image: data.image || "/images/categories/silk-sarees.jpg",
            quantity: typeof data.quantity === "number" ? data.quantity : 1,
            stock: typeof data.stock === "number" ? data.stock : 10,
            fabric: data.fabric || "",
            color: data.color || "",
            categoryName: data.categoryName || "",
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : undefined,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : undefined,
          });
        });
        setItems(cartList);
        setLoading(false);
      },
      (error) => {
        console.warn("[NEKARA Cart] Real-time cart error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isAuthenticated, user]);

  // Compute total item count (sum of all quantities)
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Compute total price amount
  const totalAmount = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const formattedTotalAmount = formatINR(totalAmount);

  // Add product to Firestore Cart
  const addToCart = async (product: NekaraProduct, qty = 1): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      return false;
    }

    if (!db || typeof db.type !== "string") {
      console.error("[NEKARA Cart] Database is not available.");
      return false;
    }

    try {
      const cartItemRef = doc(db, "users", user.uid, "cart", product.id);
      const existing = items.find((i) => i.productId === product.id);
      const newQuantity = existing ? existing.quantity + qty : qty;

      const payload = {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        originalPrice: product.originalPrice || null,
        image: product.image,
        quantity: newQuantity,
        stock: product.stock || 10,
        fabric: product.fabric || "",
        color: product.color || "",
        categoryName: product.categoryName || product.category || "",
        updatedAt: serverTimestamp(),
      };

      if (!existing) {
        (payload as any).createdAt = serverTimestamp();
      }

      await setDoc(cartItemRef, payload, { merge: true });
      return true;
    } catch (err) {
      console.error("[NEKARA Cart] Error adding to cart:", err);
      return false;
    }
  };

  // Update item quantity
  const updateQuantity = async (productId: string, quantity: number): Promise<void> => {
    if (!isAuthenticated || !user || !db || typeof db.type !== "string") return;

    try {
      const cartItemRef = doc(db, "users", user.uid, "cart", productId);
      if (quantity <= 0) {
        await deleteDoc(cartItemRef);
      } else {
        await updateDoc(cartItemRef, {
          quantity,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error("[NEKARA Cart] Error updating quantity:", err);
    }
  };

  // Remove item
  const removeFromCart = async (productId: string): Promise<void> => {
    if (!isAuthenticated || !user || !db || typeof db.type !== "string") return;

    try {
      const cartItemRef = doc(db, "users", user.uid, "cart", productId);
      await deleteDoc(cartItemRef);
    } catch (err) {
      console.error("[NEKARA Cart] Error removing from cart:", err);
    }
  };

  // Clear all items
  const clearCart = async (): Promise<void> => {
    if (!isAuthenticated || !user || !db || typeof db.type !== "string") return;

    try {
      const cartRef = collection(db, "users", user.uid, "cart");
      const snap = await getDocs(cartRef);
      const deletePromises = snap.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(deletePromises);
    } catch (err) {
      console.error("[NEKARA Cart] Error clearing cart:", err);
    }
  };

  const value: CartContextType = {
    items,
    totalItems,
    totalAmount,
    formattedTotalAmount,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
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
