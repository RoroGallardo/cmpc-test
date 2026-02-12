import { env } from '../config/env';
import { User, RegisterRequest } from '../types/user';
import { authService } from './auth.service';
import { apiClient } from './api-client';

class UserService {
  private baseUrl = env.authServiceUrl;

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = authService.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async getUsers(): Promise<User[]> {
    const response = await apiClient.fetch(`${this.baseUrl}/users`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener usuarios');
    }

    return response.json();
  }

  async getUserById(id: string): Promise<User> {
    const response = await apiClient.fetch(`${this.baseUrl}/users/${id}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener usuario');
    }

    return response.json();
  }

  async createUser(data: RegisterRequest): Promise<User> {
    const response = await apiClient.fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear usuario');
    }

    return response.json();
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await apiClient.fetch(`${this.baseUrl}/users/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar usuario');
    }

    return response.json();
  }

  async deleteUser(id: string): Promise<void> {
    const response = await apiClient.fetch(`${this.baseUrl}/users/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al eliminar usuario');
    }
  }
}

export const userService = new UserService();
