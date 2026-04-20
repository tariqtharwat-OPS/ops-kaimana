import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export type UserRole = 'Admin' | 'Operator' | 'Buyer';

export interface AppUser {
  id: string;
  fullName: string;
  position: string;
  email: string;
  role: UserRole;
  languagePreference: 'id' | 'en';
  isActive: boolean;
  linkedBuyerId?: string;
  active_status?: boolean;
}

interface AuthContextType {
  currentUser: AppUser | null;
  isAuthLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;
    let resolved = false;

    // Safety timeout: if state doesn't resolve in 10s, force stop loading
    const timeout = setTimeout(() => {
      if (!resolved) {
        console.warn("Auth resolution timed out. Forcing stop loading.");
        setIsAuthLoading(false);
      }
    }, 10000);

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubProfile) { unsubProfile(); unsubProfile = null; }

      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          unsubProfile = onSnapshot(userDocRef, (snap) => {
            if (snap.exists()) {
              const d = snap.data();
              if (d.isActive === false || d.active_status === false) {
                firebaseSignOut(auth);
                setCurrentUser(null);
              } else {
                setCurrentUser({
                  id: firebaseUser.uid,
                  fullName: d.fullName || '',
                  position: d.position || '',
                  email: d.email || firebaseUser.email || '',
                  role: d.role || 'Operator',
                  languagePreference: d.languagePreference || 'id',
                  isActive: d.isActive !== false,
                  linkedBuyerId: d.linkedBuyerId,
                  active_status: d.active_status,
                });
              }
            } else {
              setCurrentUser(null);
            }
            resolved = true;
            setIsAuthLoading(false);
          }, (err) => {
            console.error("Profile snapshot error:", err);
            resolved = true;
            setIsAuthLoading(false);
          });
        } catch (err) {
          console.error("Profile setup error:", err);
          resolved = true;
          setIsAuthLoading(false);
        }
      } else {
        setCurrentUser(null);
        resolved = true;
        setIsAuthLoading(false);
      }
    });

    return () => {
      clearTimeout(timeout);
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};


