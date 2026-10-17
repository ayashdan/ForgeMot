import { createContext, useContext, useState, useEffect } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, limit, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loginWithGoogle() {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (err.code === "auth/popup-blocked" || err.code === "auth/popup-closed-by-user") {
        await signInWithRedirect(auth, googleProvider);
      } else {
        throw err;
      }
    }
  }

  async function logout() {
    await signOut(auth);
    setProfile(null);
  }

  async function ensureProfile(user) {
    const ref = doc(db, "profiles", user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setProfile({ id: user.uid, ...snap.data() });
      return;
    }

    // First person to ever sign in becomes admin; everyone after is a
    // regular team member (every signed-in user still gets full access —
    // role is informational, not a security gate).
    const existing = await getDocs(query(collection(db, "profiles"), limit(1)));
    const role = existing.empty ? "admin" : "member";

    const newProfile = {
      email: user.email || "",
      full_name: user.displayName || null,
      avatar_url: user.photoURL || null,
      role,
      created_at: new Date().toISOString(),
    };
    await setDoc(ref, newProfile);
    setProfile({ id: user.uid, ...newProfile });
  }

  useEffect(() => {
    getRedirectResult(auth).catch(() => {});

    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await ensureProfile(user);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = { currentUser, profile, loading, loginWithGoogle, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
