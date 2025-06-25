"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { BazarList } from '@/lib/types';

interface BazarContextType {
  bazarLists: BazarList[];
  addBazarList: (list: BazarList) => void;
  getBazarList: (id: string) => BazarList | undefined;
  clearAllHistory: () => void;
  loading: boolean;
}

const BazarContext = createContext<BazarContextType | undefined>(undefined);

export const BazarProvider = ({ children }: { children: ReactNode }) => {
  const [bazarLists, setBazarLists] = useState<BazarList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem('bazarLists');
      if (item) {
        setBazarLists(JSON.parse(item));
      }
    } catch (error) {
      console.error("Failed to load from local storage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      try {
        window.localStorage.setItem('bazarLists', JSON.stringify(bazarLists));
      } catch (error) {
        console.error("Failed to save to local storage", error);
      }
    }
  }, [bazarLists, loading]);

  const addBazarList = (list: BazarList) => {
    setBazarLists(prevLists => [...prevLists, list]);
  };

  const getBazarList = (id: string) => {
    return bazarLists.find(list => list.id === id);
  };
  
  const clearAllHistory = () => {
    setBazarLists([]);
  };

  return (
    <BazarContext.Provider value={{ bazarLists, addBazarList, getBazarList, clearAllHistory, loading }}>
      {children}
    </BazarContext.Provider>
  );
};

export const useBazar = (): BazarContextType => {
  const context = useContext(BazarContext);
  if (context === undefined) {
    throw new Error('useBazar must be used within a BazarProvider');
  }
  return context;
};
