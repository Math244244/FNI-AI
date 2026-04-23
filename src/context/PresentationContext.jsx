import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const PresentationContext = createContext();
export function usePresentation() { return useContext(PresentationContext); }

const emptyResponses = () => ({});

export function PresentationProvider({ children }) {
  const { currentUser } = useAuth();
  const [vehicle, setVehicleState]     = useState(null);
  const [clientName, setClientName]  = useState('');
  const [condition, setCondition]     = useState('neuf');
  const [transactionType, setTransactionType] = useState('financement');
  const [mode, setMode]               = useState('live');
  const [sessionStart, setSessionStart] = useState(null);
  const [financing, setFinancing]     = useState(null);
  /** @type {Record<string, { interest: 'no'|'maybe'|'yes', tierId?: string, priceCents?: number, notes?: string }>} */
  const [responses, setResponses]   = useState(emptyResponses);
  const [menuState, setMenuState]     = useState(null);
  const [dealerSettingsSnapshot, setDealerSettingsSnapshot] = useState(null);
  /** Produits retirés de la présentation en cours (déjà vendus / non pertinents). */
  const [excludedProductIds, setExcludedProductIds] = useState(/** @type {string[]} */ ([]));

  const setVehicle = useCallback((v) => setVehicleState(v), []);

  const startSession = useCallback((vehicleData) => {
    setSessionStart(Date.now());
    if (vehicleData) setVehicleState(vehicleData);
    setResponses(emptyResponses());
    setMenuState(null);
    setExcludedProductIds([]);
  }, []);

  const toggleExcludedProduct = useCallback((productId) => {
    setExcludedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  }, []);

  const clearSession = useCallback(() => {
    setVehicleState(null);
    setClientName('');
    setCondition('neuf');
    setTransactionType('financement');
    setMode('live');
    setSessionStart(null);
    setFinancing(null);
    setResponses(emptyResponses());
    setMenuState(null);
    setDealerSettingsSnapshot(null);
    setExcludedProductIds([]);
  }, []);

  // Réinitialisation automatique si l'utilisateur change (logout / changement de compte)
  const lastUidRef = useRef(null);
  useEffect(() => {
    const uid = currentUser?.uid || null;
    if (lastUidRef.current !== null && lastUidRef.current !== uid) {
      clearSession();
    }
    lastUidRef.current = uid;
  }, [currentUser, clearSession]);

  const updateResponse = useCallback((productId, patch) => {
    setResponses((prev) => {
      const cur = prev[productId];
      const base = typeof cur === 'string' ? { interest: cur } : { ...(cur || {}) };
      return { ...prev, [productId]: { ...base, ...patch } };
    });
  }, []);

  return (
    <PresentationContext.Provider
      value={{
        vehicle,
        setVehicle,
        clientName,
        setClientName,
        condition,
        setCondition,
        transactionType,
        setTransactionType,
        mode,
        setMode,
        sessionStart,
        startSession,
        clearSession,
        financing,
        setFinancing,
        responses,
        setResponses,
        updateResponse,
        menuState,
        setMenuState,
        dealerSettingsSnapshot,
        setDealerSettingsSnapshot,
        excludedProductIds,
        setExcludedProductIds,
        toggleExcludedProduct,
      }}
    >
      {children}
    </PresentationContext.Provider>
  );
}
