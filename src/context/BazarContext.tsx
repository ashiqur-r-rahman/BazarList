"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { BazarList } from '@/lib/types';
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface BazarContextType {
  bazarLists: BazarList[];
  addBazarList: (list: BazarList) => Promise<void>;
  getBazarList: (id: string) => BazarList | undefined;
  clearAllHistory: () => Promise<void>;
  loading: boolean;
}

const BazarContext = createContext<BazarContextType | undefined>(undefined);

export const BazarProvider = ({ children }: { children: ReactNode }) => {
  const [bazarLists, setBazarLists] = useState<BazarList[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchBazarLists = async () => {
      if (user && db) {
        setLoading(true);
        try {
          const q = query(collection(db, "bazar_lists"), where("userId", "==", user.uid));
          const querySnapshot = await getDocs(q);
          const lists = querySnapshot.docs.map(doc => doc.data() as BazarList);
          setBazarLists(lists);
        } catch (error) {
          console.error("Failed to fetch bazar lists from Firestore", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load your bazar lists.",
          });
        } finally {
          setLoading(false);
        }
      } else {
        // If there's no user or db, clear the lists and stop loading.
        setBazarLists([]);
        setLoading(false);
      }
    };
    
    fetchBazarLists();

  }, [user, toast]);

  const addBazarList = async (list: BazarList) => {
    if (!user || !db) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to save a list." });
      return;
    }
    try {
      await setDoc(doc(db, "bazar_lists", list.id), list);
      setBazarLists(prevLists => [...prevLists, list]);
    } catch (error) {
      console.error("Failed to save to Firestore", error);
      toast({ variant: "destructive", title: "Save Error", description: "Could not save your bazar list." });
    }
  };

  const getBazarList = (id: string) => {
    return bazarLists.find(list => list.id === id);
  };
  
  const clearAllHistory = async () => {
    if (!user || !db) {
       toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to clear history." });
       return;
    }
     try {
        const q = query(collection(db, "bazar_lists"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        const batch = writeBatch(db);
        querySnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        await batch.commit();
        setBazarLists([]);

      } catch (error) {
        console.error("Failed to clear history in Firestore", error);
        toast({ variant: "destructive", title: "Error", description: "Could not clear history." });
      }
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
