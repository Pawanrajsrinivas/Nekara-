"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  type User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import { CustomerProfile } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  profile: CustomerProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function formatFirebaseError(error: any): string {
  if (!error) return "An unexpected error occurred.";
  const code = error.code || "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email or password is incorrect.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Please sign in.";
    case "auth/weak-password":
      return "Please choose a stronger password (at least 6 characters).";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";
    case "auth/popup-blocked":
      return "Sign-in popup was blocked by your browser. Please allow popups for this site.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    case "auth/too-many-requests":
      return "Access to this account has been temporarily disabled due to many failed login attempts. Please reset your password or try again later.";
    case "auth/operation-not-allowed":
      return "This sign-in method is currently disabled in Firebase settings.";
    default:
      return error.message || "Authentication failed. Please try again.";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Fetch or initialize customer profile in Firestore
  const syncCustomerProfile = async (firebaseUser: User, customName?: string, isGoogle = false): Promise<CustomerProfile | null> => {
    if (!db || typeof db.type !== "string") {
      const basicProfile: CustomerProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName: customName || firebaseUser.displayName || "Valued Client",
        photoURL: firebaseUser.photoURL || undefined,
        provider: isGoogle ? "google" : "password",
      };
      setProfile(basicProfile);
      return basicProfile;
    }

    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();
        const existingProfile: CustomerProfile = {
          uid: firebaseUser.uid,
          email: data.email || firebaseUser.email || "",
          displayName: data.displayName || customName || firebaseUser.displayName || "Valued Client",
          photoURL: data.photoURL || firebaseUser.photoURL || undefined,
          phone: data.phone || undefined,
          provider: data.provider || (isGoogle ? "google" : "password"),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : undefined,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : undefined,
        };
        setProfile(existingProfile);
        return existingProfile;
      } else {
        // Create new customer profile document
        const newProfileData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          displayName: customName || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Valued Client",
          photoURL: firebaseUser.photoURL || "",
          provider: isGoogle ? "google" : "password",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(userRef, newProfileData, { merge: true });

        const createdProfile: CustomerProfile = {
          uid: firebaseUser.uid,
          email: newProfileData.email,
          displayName: newProfileData.displayName,
          photoURL: newProfileData.photoURL || undefined,
          provider: newProfileData.provider as "google" | "password",
        };
        setProfile(createdProfile);
        return createdProfile;
      }
    } catch (err) {
      console.warn("[NEKARA] Could not sync customer profile to Firestore (may be offline or pending rules):", err);
      const fallbackProfile: CustomerProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName: customName || firebaseUser.displayName || "Valued Client",
        photoURL: firebaseUser.photoURL || undefined,
        provider: isGoogle ? "google" : "password",
      };
      setProfile(fallbackProfile);
      return fallbackProfile;
    }
  };

  const refreshProfile = useCallback(async () => {
    if (user) {
      await syncCustomerProfile(user);
    }
  }, [user]);

  // Listen to Firebase Auth state
  useEffect(() => {
    if (!isFirebaseConfigured() || !auth || typeof auth.onAuthStateChanged !== "function") {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncCustomerProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Email & Password Sign In
  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    setAuthError(null);
    if (!auth) {
      setAuthError("Firebase Authentication is not configured.");
      return false;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      await syncCustomerProfile(cred.user, undefined, false);
      return true;
    } catch (err: any) {
      console.error("[NEKARA Auth] Sign in error:", err);
      setAuthError(formatFirebaseError(err));
      return false;
    }
  };

  // Email & Password Sign Up
  const signUpWithEmail = async (email: string, pass: string, name: string): Promise<boolean> => {
    setAuthError(null);
    if (!auth) {
      setAuthError("Firebase Authentication is not configured.");
      return false;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const trimmedName = name.trim() || "Valued Client";
      try {
        await updateProfile(cred.user, { displayName: trimmedName });
      } catch (profileErr) {
        console.warn("[NEKARA Auth] updateProfile error:", profileErr);
      }
      await syncCustomerProfile(cred.user, trimmedName, false);
      return true;
    } catch (err: any) {
      console.error("[NEKARA Auth] Sign up error:", err);
      setAuthError(formatFirebaseError(err));
      return false;
    }
  };

  // Google Sign In
  const signInWithGoogle = async (): Promise<boolean> => {
    setAuthError(null);
    if (!auth || !googleProvider) {
      setAuthError("Google Sign-In is not configured.");
      return false;
    }

    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await syncCustomerProfile(cred.user, cred.user.displayName || undefined, true);
      return true;
    } catch (err: any) {
      console.error("[NEKARA Auth] Google sign in error:", err);
      setAuthError(formatFirebaseError(err));
      return false;
    }
  };

  // Sign Out
  const logout = async (): Promise<void> => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setProfile(null);
      clearAuthError();
    } catch (err) {
      console.error("[NEKARA Auth] Logout error:", err);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    isAuthenticated: Boolean(user),
    authError,
    clearAuthError,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
