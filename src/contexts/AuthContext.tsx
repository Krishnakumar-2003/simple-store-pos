import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/pos';
import { mockUsers } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, pin: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users] = useState<User[]>(mockUsers);

  useEffect(() => {
    const savedUser = localStorage.getItem('pos_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (email: string, pin: string): boolean => {
    const foundUser = users.find(u => u.email === email && u.pin === pin);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('pos_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pos_user');
  };

  return (
    <AuthContext.Provider value={{ user, users, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
