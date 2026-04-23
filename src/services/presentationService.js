import { getInterest } from '../utils/responseHelpers.js';
import { db } from '../firebase';
import {
  collection, addDoc, serverTimestamp, query,
  where, orderBy, limit, getDocs, getDoc, doc, updateDoc, setDoc,
} from 'firebase/firestore';

/* ═══════════════════════════════════════
   UPSERT draft (autosave par décision)
   ═══════════════════════════════════════ */
export async function upsertDraft(draftId, payload) {
  try {
    const ref = doc(db, 'presentation_drafts', draftId);
    await setDoc(ref, { ...payload, updatedAt: serverTimestamp() }, { merge: true });
  } catch (e) {
    console.warn('upsertDraft failed', e);
  }
}

/* ═══════════════════════════════════════
   SAVE a completed presentation
   ═══════════════════════════════════════ */
export async function savePresentation(
  userId,
  dealerId,
  vehicle,
  responses,
  mode,
  timePerProduct = {},
  financing = null,
  menuFinal = null,
) {
  // « Intéressé » = décision positive du vendeur : si le menu est scellé,
  // on prend la colonne « important » comme vérité ; sinon yes + maybe depuis les slides.
  const sealed = !!menuFinal?.placements;
  const interested = sealed
    ? Object.entries(menuFinal.placements)
        .filter(([, v]) => v === 'important')
        .map(([k]) => k)
    : Object.entries(responses)
        .filter(([, v]) => ['yes', 'maybe'].includes(getInterest(v)))
        .map(([k]) => k);

  const total    = sealed
    ? Object.keys(menuFinal.placements).length
    : Object.keys(responses).length;
  const rate     = total > 0 ? Math.round((interested.length / total) * 100) : 0;
  const avgTime  = Object.values(timePerProduct).length
    ? Math.round(Object.values(timePerProduct).reduce((a, b) => a + b, 0) / Object.values(timePerProduct).length)
    : 0;

  const docRef = await addDoc(collection(db, 'presentations'), {
    userId,
    dealerId:         dealerId || null,
    clientName:       vehicle.clientName || '',
    createdAt:        serverTimestamp(),
    mode,
    vehicle: {
      year:     vehicle.year,
      make:     vehicle.make,
      model:    vehicle.model,
      color:    vehicle.color,
      category: vehicle.category,
      vin:      vehicle.vin || null,
    },
    responses,
    interested,
    interestedCount:  interested.length,
    totalProducts:    total,
    protectionRate:   rate,
    timePerProduct,
    avgTimePerSlide:  avgTime,
    financing:        financing || null,
    menuFinal:        menuFinal || null,
    responseFormatVersion: 2,
  });

  return docRef.id;
}

/**
 * Mise à jour d’une présentation (ex. menuFinal après l’écran menu).
 * @param {string} presId
 * @param {object} data
 */
export async function updatePresentation(presId, data) {
  if (!presId) throw new Error('presId is required');
  const ref = doc(db, 'presentations', presId);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

/**
 * Publie un aperçu public (lecture) pour le lien /t/:token
 * @param {string} token
 * @param {object} snapshot — véhicule, responses, financing, timePerProduit, optionnel
 */
export async function publishPublicSnapshot(token, snapshot) {
  if (!token) throw new Error('token is required');
  const ref = doc(db, 'publicPresentationTokens', token);
  await setDoc(
    ref,
    { ...snapshot, createdAt: serverTimestamp() },
    { merge: true },
  );
}

export async function getPublicSnapshot(token) {
  if (!token) return null;
  const s = await getDoc(doc(db, 'publicPresentationTokens', token));
  if (!s.exists()) return null;
  return s.data();
}

/* ═══════════════════════════════════════
   GET presentations for a user
   ═══════════════════════════════════════ */
export const DEFAULT_LIST_LIMIT = 500;

export async function getUserPresentations(userId, max = DEFAULT_LIST_LIMIT) {
  const q = query(
    collection(db, 'presentations'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/* ═══════════════════════════════════════
   GET presentations for a dealer
   ═══════════════════════════════════════ */
export async function getDealerPresentations(dealerId, max = DEFAULT_LIST_LIMIT) {
  const q = query(
    collection(db, 'presentations'),
    where('dealerId', '==', dealerId),
    orderBy('createdAt', 'desc'),
    limit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/* ═══════════════════════════════════════
   GET ALL presentations (admin) — borné par défaut
   ═══════════════════════════════════════ */
export async function getAllPresentations(max = DEFAULT_LIST_LIMIT) {
  const q = query(
    collection(db, 'presentations'),
    orderBy('createdAt', 'desc'),
    limit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/* ═══════════════════════════════════════
   STATS for a user
   ═══════════════════════════════════════ */
export async function getUserStats(userId) {
  const presentations = await getUserPresentations(userId);
  const now = new Date();
  const thisMonth = presentations.filter(p => {
    if (!p.createdAt?.toDate) return false;
    const d = p.createdAt.toDate();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const avgRate = thisMonth.length > 0
    ? Math.round(thisMonth.reduce((a, p) => a + (p.protectionRate || 0), 0) / thisMonth.length)
    : 0;

  return {
    total:             presentations.length,
    thisMonth:         thisMonth.length,
    avgProtectionRate: avgRate,
  };
}

/* ═══════════════════════════════════════
   COMPUTE ANALYTICS from array of presentations
   ═══════════════════════════════════════ */
export function computeAnalytics(presentations) {
  if (!presentations.length) {
    return {
      total: 0,
      avgRate: 0,
      productStats: {},
      byMonth: {},
      menuMix: { sealed: 0, avgImportantCount: 0, avgImportantShare: 0 },
    };
  }

  const total   = presentations.length;
  const avgRate = Math.round(
    presentations.reduce((s, p) => s + (p.protectionRate || 0), 0) / total
  );

  // Menu binaire : on mesure la part moyenne de produits "important" après scellé
  let sealed = 0;
  let sumImportant = 0;
  let sumTotal = 0;
  presentations.forEach((p) => {
    const mf = p.menuFinal;
    if (!mf?.placements) return;
    sealed++;
    const values = Object.values(mf.placements);
    const totalP = values.length;
    const imp = values.filter((v) => v === 'important').length;
    sumImportant += imp;
    sumTotal += totalP;
  });
  const menuMix = {
    sealed,
    avgImportantCount: sealed ? Math.round(sumImportant / sealed) : 0,
    avgImportantShare: sumTotal ? Math.round((sumImportant / sumTotal) * 100) : 0,
  };

  /* Per-product aggregated stats */
  const productStats = {};
  presentations.forEach(p => {
    Object.entries(p.responses || {}).forEach(([pid, resp]) => {
      if (!productStats[pid]) productStats[pid] = { yes: 0, no: 0, total: 0, timeTotal: 0 };
      productStats[pid].total++;
      if (getInterest(resp) === 'yes') productStats[pid].yes++;
      else productStats[pid].no++;
      if (p.timePerProduct?.[pid]) productStats[pid].timeTotal += p.timePerProduct[pid];
    });
  });

  /* By month (last 6 months) */
  const byMonth = {};
  presentations.forEach(p => {
    if (!p.createdAt?.toDate) return;
    const d    = p.createdAt.toDate();
    const key  = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!byMonth[key]) byMonth[key] = { count: 0, totalRate: 0 };
    byMonth[key].count++;
    byMonth[key].totalRate += p.protectionRate || 0;
  });

  return { total, avgRate, productStats, byMonth, menuMix };
}
