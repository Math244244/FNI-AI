import React, { createContext, useContext, useState, useCallback } from 'react';

const PresentationContext = createContext();
export function usePresentation() { return useContext(PresentationContext); }

export function PresentationProvider({ children }) {
  const [vehicle,         setVehicleState]  = useState(null);
  const [clientName,      setClientName]    = useState('');
  const [condition,       setCondition]     = useState('neuf');
  const [transactionType, setTransactionType] = useState('financement');
  const [mode,            setMode]          = useState('live');
  const [sessionStart,    setSessionStart]  = useState(null);

  const setVehicle = useCallback((v) => setVehicleState(v), []);

  const startSession = useCallback((vehicleData) => {
    setSessionStart(Date.now());
    if (vehicleData) setVehicleState(vehicleData);
  }, []);

  const clearSession = useCallback(() => {
    setVehicleState(null);
    setClientName('');
    setCondition('neuf');
    setTransactionType('financement');
    setMode('live');
    setSessionStart(null);
  }, []);

  return (
    <PresentationContext.Provider value={{
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
    }}>
      {children}
    </PresentationContext.Provider>
  );
}
