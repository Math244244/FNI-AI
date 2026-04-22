import { db } from '../firebase';
import {
  doc, getDoc, setDoc, serverTimestamp,
} from 'firebase/firestore';

/**
 * Load dealer-specific settings from Firestore.
 * Returns null if not yet saved.
 */
export async function loadDealerSettings(dealerId) {
  if (!dealerId) return null;
  try {
    const snap = await getDoc(doc(db, 'dealerSettings', dealerId));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.error('loadDealerSettings error:', e);
    return null;
  }
}

/**
 * Persist dealer settings to Firestore.
 * @param {string} dealerId
 * @param {object} settings  { productOrder, customProducts, productOverrides }
 */
export async function saveDealerSettings(dealerId, settings) {
  if (!dealerId) throw new Error('dealerId is required');
  return setDoc(
    doc(db, 'dealerSettings', dealerId),
    { ...settings, updatedAt: serverTimestamp() },
    { merge: true },
  );
}
