import { rtdb } from '../firebase';
import { ref, set, onValue, update, off } from 'firebase/database';

/**
 * Service RTDB — sync de la session de présentation pour client-view.
 * Structure : /client_sessions/{sessionId} = { vehicle, clientName, currentProduct, productIndex, responses, updatedAt }
 */
export function sessionRef(sessionId) {
  if (!rtdb) return null;
  return ref(rtdb, `client_sessions/${sessionId}`);
}

export async function initSession(sessionId, payload) {
  const r = sessionRef(sessionId);
  if (!r) return;
  await set(r, { ...payload, updatedAt: Date.now() });
}

export async function updateSession(sessionId, payload) {
  const r = sessionRef(sessionId);
  if (!r) return;
  await update(r, { ...payload, updatedAt: Date.now() });
}

export function subscribeSession(sessionId, cb) {
  const r = sessionRef(sessionId);
  if (!r) return () => {};
  const handler = onValue(r, (snap) => cb(snap.val()));
  return () => off(r, 'value', handler);
}
