import React, { createContext, useContext, useState, useEffect } from 'react';
import { masterDataService } from '../services/masterDataService';

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
  users: AppUser[];
  login: (email: string) => string | null;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = masterDataService.subscribe('users', (data) => {
      setUsers(data as AppUser[]);
      // If logged in user was updated/deactivated, reflect it
      setCurrentUser(prev => {
        if (!prev) return null;
        const updated = data.find((u: any) => u.id === prev.id) as AppUser | undefined;
        if (!updated || updated.isActive === false || updated.active_status === false) return null;
        return updated;
      });
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const login = (email: string): string | null => {
    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) return 'User not found';
    if (user.isActive === false || user.active_status === false) return 'Account inactive';
    setCurrentUser(user);
    return null;
  };

  const logout = () => setCurrentUser(null);

  return (
    <AuthContext.Provider value={{ currentUser, users, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
