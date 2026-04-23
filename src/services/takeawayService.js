import { db } from '../firebase';
import {
  collection, addDoc, doc, getDoc, serverTimestamp, query, where, limit, getDocs,
} from 'firebase/firestore';

/**
 * Crée un token takeaway unique pour une présentation.
 * Stocke { presentationId, token, createdAt } dans takeaways/{docId}.
 */
export async function createTakeaway(presentationId, payload = {}) {
  const token = generateToken();
  await addDoc(collection(db, 'takeaways'), {
    token,
    presentationId,
    clientName: payload.clientName || '',
    vehicle: payload.vehicle || {},
    responses: payload.responses || {},
    dealerName: payload.dealerName || '',
    representative: payload.representative || {},
    createdAt: serverTimestamp(),
  });
  return token;
}

/** Récupère un takeaway par son token. */
export async function getTakeawayByToken(token) {
  const q = query(collection(db, 'takeaways'), where('token', '==', token), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

function generateToken() {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let t = '';
  for (let i = 0; i < 10; i++) t += chars[Math.floor(Math.random() * chars.length)];
  return t;
}
