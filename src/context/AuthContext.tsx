"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, firebaseInitialized } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!firebaseInitialized || !auth) {
        setLoading(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!firebaseInitialized || !auth || !googleProvider) {
        toast({
          variant: "destructive",
          title: "Firebase Not Configured",
          description: "Please add your Firebase credentials to .env.local to enable login.",
        });
        return;
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      router.push('/dashboard');
      toast({
        title: "Login Successful",
        description: `Welcome back, ${result.user.displayName}!`,
      });
    } catch (error) {
      console.error("Error signing in with Google: ", error);
      if ((error as any)?.code === 'auth/configuration-not-found') {
         toast({
            variant: "destructive",
            title: "Configuration Error",
            description: "Google Sign-In is not enabled for this project. Please enable it in your Firebase Console.",
          });
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "There was a problem signing in with Google. Please try again.",
        });
      }
    }
  };

  const logout = async () => {
     if (!firebaseInitialized || !auth) {
        toast({
          variant: "destructive",
          title: "Firebase Not Configured",
          description: "Cannot log out.",
        });
        return;
    }
    try {
      await auth.signOut();
      router.push('/');
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Error signing out: ", error);
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "There was a problem signing out. Please try again.",
      });
    }
  };


  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
