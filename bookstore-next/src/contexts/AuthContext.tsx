'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, LoginRequest, RegisterRequest } from '../types/user';
import { authService } from '../services/auth.service';
import { apiClient } from '../services/api-client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  publicRegister: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    authService.logout();
    apiClient.clearTokenExpirationTimer();
    setUser(null);
    router.push('/login');
  }, [router]);

  const login = async (credentials: LoginRequest) => {
    const response = await authService.login(credentials);
    setUser(response.user);
    
    // Configurar timer para verificar expiración del token
    apiClient.setupTokenExpirationTimer(response.access_token, () => {
      console.warn('Token próximo a expirar - cerrando sesión');
      logout();
    }, 60);
  };

  const register = async (data: RegisterRequest) => {
    await authService.register(data);
  };

  const publicRegister = async (data: RegisterRequest) => {
    await authService.publicRegister(data);
  };

  useEffect(() => {
    // Configurar callback para errores 401
    apiClient.setOnUnauthorized(() => {
      console.warn('Sesión expirada - redirigiendo al login');
      logout();
    });

    // Check for existing session on mount
    const currentUser = authService.getCurrentUser();
    const token = authService.getToken();

    if (currentUser && token) {
      // Verificar si el token está expirado
      if (authService.isTokenExpired()) {
        console.warn('Token expirado al cargar - limpiando sesión');
        authService.logout();
        setUser(null);
      } else {
        setUser(currentUser);
        
        // Configurar timer para verificar expiración del token
        // Se ejecutará 60 segundos antes de que expire
        apiClient.setupTokenExpirationTimer(token, () => {
          console.warn('Token próximo a expirar - cerrando sesión');
          logout();
        }, 60);
      }
    }

    setLoading(false);

    // Cleanup al desmontar el componente
    return () => {
      apiClient.clearTokenExpirationTimer();
    };
  }, [logout]);

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    publicRegister,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
