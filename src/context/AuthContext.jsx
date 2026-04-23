import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();
export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser]     = useState(null);
  const [userProfile, setUserProfile]     = useState(null);
  const [loading, setLoading]             = useState(true);

  /* ── Load Firestore profile ── */
  async function loadProfile(uid) {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      return snap.exists() ? snap.data() : null;
    } catch { return null; }
  }

  /* ── Auth methods ── */
  function loginWithEmail(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function loginWithGoogle() {
    return signInWithPopup(auth, new GoogleAuthProvider());
  }

  function loginAsDemo() {
    const u = { email: 'demo@avantageplus.com', displayName: 'Mode Démo', uid: 'demo' };
    const p = { role: 'seller', dealerId: 'demo', dealerName: 'Démo Avantage Plus' };
    setCurrentUser(u);
    setUserProfile(p);
  }

  function logout() {
    if (currentUser?.uid === 'demo') {
      setCurrentUser(null); setUserProfile(null);
      return Promise.resolve();
    }
    setUserProfile(null);
    return signOut(auth);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  /* ── Auth state listener ── */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const profile = await loadProfile(user.uid);
        setUserProfile(profile);
      } else {
        setCurrentUser((prev) => (prev?.uid === 'demo' ? prev : null));
        setUserProfile((prev) => (prev && currentUserIsDemoRef.current ? prev : null));
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // Ref miroir pour éviter une closure périmée sur `currentUser`
  const currentUserIsDemoRef = React.useRef(false);
  useEffect(() => {
    currentUserIsDemoRef.current = currentUser?.uid === 'demo';
  }, [currentUser]);

  const isDemo        = currentUser?.uid === 'demo';
  const isSuperAdmin  = userProfile?.role === 'superAdmin';
  const isDealerAdmin = userProfile?.role === 'dealerAdmin';
  const isSeller      = userProfile?.role === 'seller' || isDemo;

  const value = {
    currentUser,
    userProfile,
    loading,
    isDemo,
    isSuperAdmin,
    isDealerAdmin,
    isSeller,
    loginWithEmail,
    loginWithGoogle,
    loginAsDemo,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
