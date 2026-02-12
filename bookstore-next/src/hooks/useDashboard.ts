import { useState, useEffect } from 'react';
import { DashboardMetrics } from '../types/analytics';
import { analyticsService } from '../services/analytics.service';

export function useDashboard() {
  const [dashboard, setDashboard] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getDashboard();
      // Validar que data sea un objeto válido
      if (data && typeof data === 'object') {
        setDashboard(data);
      } else {
        setDashboard(null);
        setError('Datos de dashboard inválidos');
      }
    } catch (err) {
      console.error('Error en useDashboard:', err);
      setDashboard(null);
      setError(err instanceof Error ? err.message : 'Error al cargar dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return { dashboard, loading, error, refetch: fetchDashboard };
}
