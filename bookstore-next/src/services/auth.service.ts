import { env } from '../config/env';
import { User, LoginRequest, LoginResponse, RegisterRequest } from '../types/user';
import { apiClient } from './api-client';

class AuthService {
  private baseUrl = env.authServiceUrl;

  private getHeaders(includeAuth = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al iniciar sesión');
    }

    const data: LoginResponse = await response.json();
    this.setSession(data);
    return data;
  }

  async register(data: RegisterRequest): Promise<User> {
    const response = await apiClient.fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al registrar usuario');
    }

    return response.json();
  }

  async publicRegister(data: RegisterRequest): Promise<{ message: string; user: { id: string; email: string; name: string } }> {
    const response = await apiClient.fetch(`${this.baseUrl}/auth/public-register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al registrar usuario');
    }

    return response.json();
  }

  async getProfile(): Promise<User> {
    const response = await apiClient.fetch(`${this.baseUrl}/auth/profile`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener perfil');
    }

    return response.json();
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Verifica si el token actual está expirado o está próximo a expirar
   * @param bufferSeconds - Segundos de buffer antes de considerar expirado (default: 60)
   */
  isTokenExpired(bufferSeconds = 60): boolean {
    const token = this.getToken();
    if (!token) return true;
    return apiClient.isTokenExpired(token, bufferSeconds);
  }

  /**
   * Obtiene el tiempo restante hasta que expire el token (en segundos)
   */
  getTokenTimeRemaining(): number {
    const token = this.getToken();
    if (!token) return 0;
    return apiClient.getTokenTimeRemaining(token);
  }

  /**
   * Decodifica el token actual
   */
  getTokenPayload(): { exp?: number; sub?: string; email?: string; role?: string } | null {
    const token = this.getToken();
    if (!token) return null;
    return apiClient.decodeToken(token);
  }

  private setSession(response: LoginResponse): void {
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('current_user', JSON.stringify(response.user));
  }
}

export const authService = new AuthService();
