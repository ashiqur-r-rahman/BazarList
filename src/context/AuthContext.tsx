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
      const errorCode = (error as any)?.code;
      // Use console.warn to avoid triggering the Next.js error overlay for a handled error.
      console.warn("Error signing in with Google: ", error);

      let title = "Login Failed";
      let description = "An unexpected error occurred. Please try again.";

      switch (errorCode) {
        case 'auth/configuration-not-found':
          title = "Configuration Error";
          description = "Google Sign-In is not enabled for this project. Please enable it in your Firebase Console.";
          break;
        case 'auth/popup-closed-by-user':
          // This is a common case and doesn't need an error toast.
          console.log("User closed the sign-in popup.");
          return; // Exit without showing a toast
        case 'auth/popup-blocked-by-browser':
          title = "Popup Blocked";
          description = "Your browser blocked the login popup. Please allow popups for this site and try again.";
          break;
        case 'auth/unauthorized-domain':
            title = "Unauthorized Domain";
            description = "This domain is not authorized for Google Sign-In. Please add it to the authorized domains in your Firebase project settings.";
            break;
        default:
          description = `There was a problem signing in with Google. (Error: ${errorCode || 'UNKNOWN'})`;
          break;
      }
      
      toast({
        variant: "destructive",
        title: title,
        description: description,
      });
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
