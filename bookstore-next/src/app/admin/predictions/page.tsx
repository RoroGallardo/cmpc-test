'use client';

import { useState } from 'react';
import AdminRoute from '../../../components/AdminRoute';
import Navbar from '../../../components/Navbar';
import { analyticsService } from '../../../services/analytics.service';
import { DemandPrediction, RestockRecommendation } from '../../../types/analytics';

export default function PredictionsPage() {
  return (
    <AdminRoute>
      <PredictionsContent />
    </AdminRoute>
  );
}

function PredictionsContent() {
  const [predictions, setPredictions] = useState<DemandPrediction[]>([]);
  const [recommendations, setRecommendations] = useState<RestockRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPredictions, setShowPredictions] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const handleGeneratePrediction = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await analyticsService.getPredictiveDemand();
      setPredictions(data);
      setShowPredictions(true);
      setShowRecommendations(false);
    } catch (err: any) {
      setError(err.message || 'Error al cargar predicciones');
    } finally {
      setLoading(false);
    }
  };

  const handleShowRecommendations = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await analyticsService.getRestockRecommendations();
      setRecommendations(data);
      setShowRecommendations(true);
      setShowPredictions(false);
    } catch (err: any) {
      setError(err.message || 'Error al cargar recomendaciones');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Predicciones y Recomendaciones</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Predicción de Demanda</h2>
              <span className="text-5xl">🔮</span>
            </div>
            <p className="text-indigo-100 mb-6">
              Análisis predictivo basado en datos históricos de ventas para anticipar la demanda futura.
            </p>
            <button 
              onClick={handleGeneratePrediction}
              disabled={loading}
              className="w-full bg-white text-indigo-600 py-3 px-6 rounded-lg font-medium hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Cargando...' : 'Generar Predicción'}
            </button>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg p-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recomendaciones de Reabastecimiento</h2>
              <span className="text-5xl">📦</span>
            </div>
            <p className="text-pink-100 mb-6">
              Sugerencias inteligentes de reabastecimiento basadas en patrones de venta y niveles de stock.
            </p>
            <button 
              onClick={handleShowRecommendations}
              disabled={loading}
              className="w-full bg-white text-pink-600 py-3 px-6 rounded-lg font-medium hover:bg-pink-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Cargando...' : 'Ver Recomendaciones'}
            </button>
          </div>

          {error && (
            <div className="lg:col-span-2 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {showPredictions && predictions.length > 0 && (
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Predicciones de Demanda</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Libro</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Actual</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Predicción 7 días</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Predicción 30 días</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tendencia</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confianza</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {predictions.map((pred, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pred.bookTitle}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pred.currentStock}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pred.predicted7Days}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pred.predicted30Days}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            pred.trend === 'increasing' ? 'bg-green-100 text-green-800' :
                            pred.trend === 'decreasing' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {pred.trend === 'increasing' ? '↑ Creciente' : pred.trend === 'decreasing' ? '↓ Decreciente' : '→ Estable'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(pred.confidence * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {showRecommendations && recommendations.length > 0 && (
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recomendaciones de Reabastecimiento</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Libro</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Actual</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad Recomendada</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgencia</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Días hasta agotamiento</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo Estimado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recommendations.map((rec, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rec.bookTitle}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rec.currentStock}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rec.recommendedQuantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            rec.urgency === 'critical' ? 'bg-red-100 text-red-800' :
                            rec.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                            rec.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {rec.urgency === 'critical' ? 'Crítico' :
                             rec.urgency === 'high' ? 'Alto' :
                             rec.urgency === 'medium' ? 'Medio' : 'Bajo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rec.estimatedDaysUntilStockout}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${rec.estimatedCost.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Métricas Predictivas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border-l-4 border-indigo-500 pl-4">
                <p className="text-gray-600 text-sm mb-1">Precisión del Modelo</p>
                <p className="text-3xl font-bold text-gray-900">87%</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <p className="text-gray-600 text-sm mb-1">Items Analizados</p>
                <p className="text-3xl font-bold text-gray-900">{predictions.length > 0 ? predictions.length : 245}</p>
              </div>
              <div className="border-l-4 border-pink-500 pl-4">
                <p className="text-gray-600 text-sm mb-1">Recomendaciones Activas</p>
                <p className="text-3xl font-bold text-gray-900">{recommendations.length > 0 ? recommendations.length : 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
