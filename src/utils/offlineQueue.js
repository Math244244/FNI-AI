/**
 * File d’attente basique pour futures sauvegardes offline (IndexedDB + retry).
 * Placeholder : l’appli PWA pourra y brancher les échecs réseau.
 */
const queue = [];

export function enqueueOfflinePayload(type, payload) {
  queue.push({ type, payload, at: Date.now() });
}

export function peekOfflineQueue() {
  return [...queue];
}

export function clearOfflineQueue() {
  queue.length = 0;
}
