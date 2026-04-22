import { db } from '../firebase';
import {
  collection, addDoc, doc, getDoc, getDocs, setDoc,
  updateDoc, query, where, orderBy, serverTimestamp, deleteDoc,
} from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

/* ═══════════════════════════════════════
   Secondary app for admin user creation
   (prevents logging out current admin)
   ═══════════════════════════════════════ */
const FIREBASE_CONFIG = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

let _secondaryApp;
function getSecondaryAuth() {
  if (!_secondaryApp) {
    _secondaryApp = initializeApp(FIREBASE_CONFIG, 'secondary-admin');
  }
  return getAuth(_secondaryApp);
}

/* ═══════════════════════════════════════
   DEALERS
   ═══════════════════════════════════════ */
export async function createDealer(data, createdByUid) {
  const ref = await addDoc(collection(db, 'dealers'), {
    name:      data.name,
    address:   data.address  || '',
    phone:     data.phone    || '',
    email:     data.email    || '',
    logo:      data.logo     || '',
    city:      data.city     || '',
    province:  data.province || 'QC',
    active:    true,
    createdAt: serverTimestamp(),
    createdBy: createdByUid,
  });
  return ref.id;
}

export async function getDealers() {
  const snap = await getDocs(query(collection(db, 'dealers'), orderBy('name')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getDealer(dealerId) {
  const snap = await getDoc(doc(db, 'dealers', dealerId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateDealer(dealerId, data) {
  return updateDoc(doc(db, 'dealers', dealerId), { ...data, updatedAt: serverTimestamp() });
}

export async function toggleDealerActive(dealerId, active) {
  return updateDoc(doc(db, 'dealers', dealerId), { active });
}

/* ═══════════════════════════════════════
   USERS
   ═══════════════════════════════════════ */

/**
 * Create a Firebase Auth user + Firestore profile
 * Uses secondary auth so admin stays logged in
 */
export async function createUser({ email, password, displayName, role, dealerId, phone }) {
  const secondAuth = getSecondaryAuth();
  const cred = await createUserWithEmailAndPassword(secondAuth, email, password);
  const uid  = cred.user.uid;

  await setDoc(doc(db, 'users', uid), {
    uid,
    email,
    displayName,
    role,          // 'dealerAdmin' | 'seller'
    dealerId:      dealerId || null,
    phone:         phone    || '',
    active:        true,
    createdAt:     serverTimestamp(),
  });

  // Sign out the secondary auth instance so the temp session is dropped
  await secondAuth.signOut();

  return uid;
}

export async function getAllUsers() {
  const snap = await getDocs(query(collection(db, 'users'), orderBy('displayName')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getUsersByDealer(dealerId) {
  const q = query(
    collection(db, 'users'),
    where('dealerId', '==', dealerId),
    orderBy('displayName'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateUser(uid, data) {
  return updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() });
}

export async function toggleUserActive(uid, active) {
  return updateDoc(doc(db, 'users', uid), { active });
}

/* ═══════════════════════════════════════
   GLOBAL STATS (for admin dashboard)
   ═══════════════════════════════════════ */
export async function getGlobalStats() {
  const [dealersSnap, usersSnap, presSnap] = await Promise.all([
    getDocs(collection(db, 'dealers')),
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'presentations')),
  ]);

  const presentations = presSnap.docs.map(d => d.data());
  const avgRate = presentations.length
    ? Math.round(presentations.reduce((s, p) => s + (p.protectionRate || 0), 0) / presentations.length)
    : 0;

  return {
    totalDealers:       dealersSnap.size,
    totalUsers:         usersSnap.size,
    totalPresentations: presSnap.size,
    avgProtectionRate:  avgRate,
  };
}
