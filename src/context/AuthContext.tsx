import React, { createContext, useContext, useState, useEffect } from 'react';
import { masterDataService } from '../services/masterDataService';

export type UserRole = 'Admin' | 'Operator' | 'Buyer';

export interface User {
  id: string;
  fullName: string;
  position: string;
  email: string;
  role: UserRole;
  languagePreference: 'id' | 'en';
  isActive: boolean;
  linkedBuyerId?: string;
  createdAt?: string;
  createdBy?: string;
  active_status?: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  loginAs: (userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Subscribe to all users for the mock login
    const unsubscribe = masterDataService.subscribe('users', (data) => {
      setUsers(data as User[]);
      
      // If we have a logged in user, update their state if it changes in DB
      setCurrentUser((prev) => {
        if (!prev) return null;
        const updatedUser = data.find((u: any) => u.id === prev.id);
        if (updatedUser) {
          // Only return updated if active. If they became inactive, log them out.
          if (updatedUser.isActive === false || updatedUser.active_status === false) {
            return null;
          }
          return updatedUser as User;
        }
        return null;
      });
    });

    return () => unsubscribe();
  }, []);

  const loginAs = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user && (user.isActive !== false && user.active_status !== false)) {
      setCurrentUser(user);
    } else {
      alert("User is inactive or not found.");
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, users, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
