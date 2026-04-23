import { db } from '../firebase';
import {
  doc, getDoc, setDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { DEALER_SETTINGS_VERSION } from '../utils/dealerSettingsMerge';

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
 * Persist dealer settings. Utilise `updateDoc` quand le document existe afin
 * de remplacer le champ `overrides` en entier (évite le merge profond des maps).
 * @param {string} dealerId
 * @param {object} settings
 */
export async function saveDealerSettings(dealerId, settings) {
  if (!dealerId) throw new Error('dealerId is required');
  const ref = doc(db, 'dealerSettings', dealerId);
  const snap = await getDoc(ref);
  const payload = { ...settings, updatedAt: serverTimestamp() };
  if (snap.exists()) {
    return updateDoc(ref, payload);
  }
  return setDoc(ref, { ...payload, schemaVersion: DEALER_SETTINGS_VERSION });
}
