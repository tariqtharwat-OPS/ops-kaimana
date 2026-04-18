import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  User as FirebaseUser
} from 'firebase/auth';
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

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (unsubProfile) { unsubProfile(); unsubProfile = null; }

      if (firebaseUser) {
        // Real user found, load Firestore profile
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        unsubProfile = onSnapshot(userDocRef, (snap) => {
          if (snap.exists()) {
            const d = snap.data();
            // Strict check: if deactivated, force logout
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
            // Profile missing - might be a new setup or error
            setCurrentUser(null);
          }
          setIsAuthLoading(false);
        }, (err) => {
          console.error("Profile snapshot error:", err);
          setIsAuthLoading(false);
        });
      } else {
        setCurrentUser(null);
        setIsAuthLoading(false);
      }
    });

    return () => {
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
