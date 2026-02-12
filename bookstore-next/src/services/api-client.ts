/**
 * Cliente API centralizado con manejo de errores y control de token
 */

type OnUnauthorizedCallback = () => void;

class ApiClient {
  private onUnauthorizedCallback: OnUnauthorizedCallback | null = null;
  private isHandling401 = false;
  private tokenExpirationTimer: NodeJS.Timeout | null = null;

  /**
   * Registra un callback que se ejecutará cuando se detecte un error 401
   * Esto permite manejar la redirección al login de forma centralizada
   */
  setOnUnauthorized(callback: OnUnauthorizedCallback) {
    this.onUnauthorizedCallback = callback;
  }

  /**
   * Realiza una petición HTTP con manejo automático de errores 401
   */
  async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    try {
      const response = await fetch(url, options);

      // Si es 401 y no estamos ya manejando un 401, ejecutar callback
      if (response.status === 401 && !this.isHandling401) {
        this.isHandling401 = true;
        
        // Limpiar almacenamiento local
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('current_user');
        }

        // Ejecutar callback si existe
        if (this.onUnauthorizedCallback) {
          this.onUnauthorizedCallback();
        }

        // Resetear el flag después de un breve delay para evitar múltiples llamadas
        setTimeout(() => {
          this.isHandling401 = false;
        }, 1000);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Decodifica un token JWT sin verificar la firma
   * Solo para obtener el payload y verificar expiración
   */
  decodeToken(token: string): { exp?: number; sub?: string; email?: string; role?: string } | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  /**
   * Verifica si un token está expirado o está a punto de expirar
   * @param token - Token JWT a verificar
   * @param bufferSeconds - Segundos de buffer antes de considerar expirado (default: 60)
   */
  isTokenExpired(token: string, bufferSeconds = 60): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp - bufferSeconds <= currentTime;
  }

  /**
   * Obtiene el tiempo restante hasta que expire el token (en segundos)
   */
  getTokenTimeRemaining(token: string): number {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return 0;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, decoded.exp - currentTime);
  }

  /**
   * Configura un timer que ejecutará un callback cuando el token esté a punto de expirar
   * @param token - Token JWT a monitorear
   * @param callback - Función a ejecutar cuando el token esté por expirar
   * @param bufferSeconds - Segundos antes de expiración para ejecutar el callback (default: 60)
   */
  setupTokenExpirationTimer(
    token: string,
    callback: () => void,
    bufferSeconds = 60
  ): void {
    // Limpiar timer anterior si existe
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    const timeRemaining = this.getTokenTimeRemaining(token);
    const timeUntilExpiration = (timeRemaining - bufferSeconds) * 1000;

    if (timeUntilExpiration > 0) {
      this.tokenExpirationTimer = setTimeout(() => {
        callback();
      }, timeUntilExpiration);
    } else {
      // Token ya está expirado o está a punto de expirar
      callback();
    }
  }

  /**
   * Limpia el timer de expiración de token
   */
  clearTokenExpirationTimer(): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }
  }

  /**
   * Verifica si el cliente está manejando un error 401
   */
  isHandlingUnauthorized(): boolean {
    return this.isHandling401;
  }
}

export const apiClient = new ApiClient();
