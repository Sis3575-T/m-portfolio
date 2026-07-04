import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getPortfolioData, getData, setData, subscribe, generateId, resetToDefaults } from '../services/store';

const PortfolioContext = createContext();

export function PortfolioProvider({ children }) {
  const [data, setPortfolioState] = useState(() => getPortfolioData());
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const unsub = subscribe(() => {
      setPortfolioState(getPortfolioData());
      setVersion(v => v + 1);
    });
    return unsub;
  }, []);

  const updateData = useCallback((key, value) => {
    setData(key, value);
  }, []);

  const updateNested = useCallback((key, path, value) => {
    const current = getData(key);
    const parts = path.split('.');
    let obj = current;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!obj[parts[i]]) obj[parts[i]] = {};
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;
    setData(key, current);
  }, []);

  const addItem = useCallback((key, item) => {
    const list = getData(key) || [];
    const newItem = { ...item, _id: item._id || generateId() };
    list.push(newItem);
    setData(key, list);
  }, []);

  const updateItem = useCallback((key, id, updates) => {
    const list = getData(key) || [];
    const idx = list.findIndex(i => i._id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      setData(key, list);
    }
  }, []);

  const removeItem = useCallback((key, id) => {
    const list = getData(key) || [];
    setData(key, list.filter(i => i._id !== id));
  }, []);

  const reorderItems = useCallback((key, fromIdx, toIdx) => {
    const list = getData(key) || [];
    const [moved] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, moved);
    setData(key, list);
  }, []);

  const resetAll = useCallback(() => {
    resetToDefaults();
  }, []);

  return (
    <PortfolioContext.Provider value={{
      ...data,
      version,
      updateData,
      updateNested,
      addItem,
      updateItem,
      removeItem,
      reorderItems,
      resetAll,
      generateId,
    }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio must be used within PortfolioProvider');
  return ctx;
}
