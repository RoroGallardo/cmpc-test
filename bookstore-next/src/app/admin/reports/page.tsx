'use client';

import { useState } from 'react';
import AdminRoute from '../../../components/AdminRoute';
import Navbar from '../../../components/Navbar';
import { analyticsService } from '../../../services/analytics.service';
import { ABCAnalysis, ProfitabilityReport, SeasonalityReport, StockRotationReport, AuditTrailReport } from '../../../types/analytics';

export default function ReportsPage() {
  return (
    <AdminRoute>
      <ReportsContent />
    </AdminRoute>
  );
}

function ReportsContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  
  // Estados para cada tipo de reporte
  const [abcReport, setAbcReport] = useState<ABCAnalysis[] | null>(null);
  const [profitabilityReport, setProfitabilityReport] = useState<ProfitabilityReport | null>(null);
  const [seasonalityReport, setSeasonalityReport] = useState<SeasonalityReport | null>(null);
  const [stockRotationReport, setStockRotationReport] = useState<StockRotationReport | null>(null);
  const [auditTrailReport, setAuditTrailReport] = useState<AuditTrailReport | null>(null);

  // Filtros de fecha
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleGenerateReport = async (reportType: string) => {
    setLoading(true);
    setError('');
    setSelectedReport(reportType);
    
    // Limpiar reportes anteriores
    setAbcReport(null);
    setProfitabilityReport(null);
    setSeasonalityReport(null);
    setStockRotationReport(null);
    setAuditTrailReport(null);

    const filters = {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };

    try {
      switch (reportType) {
        case 'abc':
          const abc = await analyticsService.getABCAnalysis(filters);
          setAbcReport(abc);
          break;
        case 'profitability':
          const profitability = await analyticsService.getProfitabilityReport(filters);
          setProfitabilityReport(profitability);
          break;
        case 'seasonality':
          const seasonality = await analyticsService.getSeasonalityReport();
          setSeasonalityReport(seasonality);
          break;
        case 'stock-rotation':
          const stockRotation = await analyticsService.getStockRotationReport();
          setStockRotationReport(stockRotation);
          break;
        case 'audit':
          const audit = await analyticsService.getAuditTrailReport(filters);
          setAuditTrailReport(audit);
          break;
      }
    } catch (err: any) {
      setError(err.message || 'Error al generar reporte');
      setSelectedReport(null);
    } finally {
      setLoading(false);
    }
  };

  const reports = [
    { id: 'abc', name: 'Análisis ABC', icon: '📊', description: 'Clasificación de productos por importancia', needsDates: true },
    { id: 'profitability', name: 'Rentabilidad', icon: '💰', description: 'Análisis de rentabilidad por producto', needsDates: true },
    { id: 'seasonality', name: 'Estacionalidad', icon: '📅', description: 'Patrones estacionales de venta', needsDates: false },
    { id: 'stock-rotation', name: 'Rotación de Stock', icon: '🔄', description: 'Análisis de rotación de inventario', needsDates: false },
    { id: 'audit', name: 'Auditoría', icon: '📋', description: 'Registro de auditoría del sistema', needsDates: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Reportes y Análisis</h1>

        {/* Filtros de fecha */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Botones de reportes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="text-5xl mb-4">{report.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{report.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{report.description}</p>
              <button
                onClick={() => handleGenerateReport(report.id)}
                disabled={loading}
                className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-pink-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading && selectedReport === report.id ? 'Generando...' : 'Generar Reporte'}
              </button>
            </div>
          ))}
        </div>

        {/* Resultados */}
        {abcReport && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Análisis ABC</h2>
            {abcReport.map((category) => (
              <div key={category.category} className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Categoría {category.category}
                </h3>
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Productos:</strong> {category.summary.count} ({category.summary.percentageOfProducts.toFixed(1)}%)
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Ingresos:</strong> ${category.summary.totalRevenue.toLocaleString()} ({category.summary.percentageOfRevenue.toFixed(1)}%)
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Libro</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">% del Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">% Acumulado</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {category.books.slice(0, 10).map((book) => (
                        <tr key={book.bookId}>
                          <td className="px-6 py-4 text-sm text-gray-900">{book.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">${book.revenue.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{book.percentageOfTotal.toFixed(2)}%</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{book.cumulativePercentage.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {profitabilityReport && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reporte de Rentabilidad</h2>
            
            <div className="mb-6 p-4 bg-pink-50 rounded-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Resumen General</h3>
              <p className="text-sm text-gray-600">
                <strong>Ingresos Totales:</strong> ${profitabilityReport.overall.totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Ganancia Bruta:</strong> ${profitabilityReport.overall.grossProfit.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Margen:</strong> {profitabilityReport.overall.margin.toFixed(2)}%
              </p>
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-2">Por Categoría</h3>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ganancia</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Margen</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidades</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {profitabilityReport.byCategory.map((cat, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 text-sm text-gray-900">{cat.categoryName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${cat.totalRevenue.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${cat.profit.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{cat.margin.toFixed(2)}%</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{cat.unitsSold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {seasonalityReport && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reporte de Estacionalidad</h2>
            
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Tendencias</h3>
              <p className="text-sm text-gray-600"><strong>Mejor Mes:</strong> {seasonalityReport.trends.bestMonth}</p>
              <p className="text-sm text-gray-600"><strong>Peor Mes:</strong> {seasonalityReport.trends.worstMonth}</p>
              <p className="text-sm text-gray-600"><strong>Mejor Día:</strong> {seasonalityReport.trends.bestDayOfWeek}</p>
              <p className="text-sm text-gray-600"><strong>Peor Día:</strong> {seasonalityReport.trends.worstDayOfWeek}</p>
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-2">Ventas por Mes</h3>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ventas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket Promedio</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {seasonalityReport.monthly.map((m, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 text-sm text-gray-900">{m.month}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{m.sales}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${m.revenue.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${m.averageOrderValue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {stockRotationReport && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reporte de Rotación de Stock</h2>
            
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Resumen</h3>
              <p className="text-sm text-gray-600">
                <strong>Tasa Promedio de Rotación:</strong> {stockRotationReport.summary.averageRotationRate.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Productos de Rápido Movimiento:</strong> {stockRotationReport.summary.fastMovingCount}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Productos de Lento Movimiento:</strong> {stockRotationReport.summary.slowMovingCount}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Stock Muerto:</strong> {stockRotationReport.summary.deadStockCount}
              </p>
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-2">Productos de Rápido Movimiento</h3>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Libro</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tasa de Rotación</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Días para Vender</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Actual</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stockRotationReport.fastMoving.slice(0, 10).map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.rotationRate.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.daysToSell}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.currentStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {auditTrailReport && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Registro de Auditoría</h2>
            
            <div className="mb-6 p-4 bg-purple-50 rounded-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Resumen</h3>
              <p className="text-sm text-gray-600">
                <strong>Total de Cambios:</strong> {auditTrailReport.summary.totalChanges}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entidad</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditTrailReport.changes.slice(0, 20).map((change) => (
                    <tr key={change.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(change.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{change.user}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{change.action}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{change.entityType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
