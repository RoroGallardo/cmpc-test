'use client';

import { useMemo } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import Navbar from '../../components/Navbar';
import { useDashboard } from '../../hooks/useDashboard';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { dashboard, loading, error, refetch } = useDashboard();

  const formattedNumber = useMemo(() => (num: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(num);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <svg className="w-16 h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-red-700 font-bold text-lg mb-2">{error}</p>
                <p className="text-red-600 text-sm">El servicio de analytics no está disponible. Verifica que esté corriendo en el puerto 3003.</p>
              </div>
              <button
                onClick={refetch}
                className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Ventas del Mes</p>
                <p className="text-3xl font-bold mt-2">{dashboard.thisMonth.orders}</p>
              </div>
              <div className="text-5xl opacity-20">📊</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Ingresos del Mes</p>
                <p className="text-3xl font-bold mt-2">{formattedNumber(dashboard.thisMonth.revenue)}</p>
              </div>
              <div className="text-5xl opacity-20">💰</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Libros</p>
                <p className="text-3xl font-bold mt-2">{dashboard.inventory.totalBooks}</p>
              </div>
              <div className="text-5xl opacity-20">📚</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Stock Bajo</p>
                <p className="text-3xl font-bold mt-2">{dashboard.inventory.lowStockCount}</p>
              </div>
              <div className="text-5xl opacity-20">📦</div>
            </div>
          </div>
        </div>

        {/* Métricas por período */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Métricas por Período</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-l-4 border-indigo-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Hoy</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">Órdenes: <span className="font-semibold text-gray-900">{dashboard.today.orders}</span></p>
                <p className="text-gray-600">Items Vendidos: <span className="font-semibold text-gray-900">{dashboard.today.sales}</span></p>
                <p className="text-gray-600">Ingresos: <span className="font-semibold text-gray-900">{formattedNumber(dashboard.today.revenue)}</span></p>
              </div>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Esta Semana</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">Órdenes: <span className="font-semibold text-gray-900">{dashboard.thisWeek.orders}</span></p>
                <p className="text-gray-600">Items Vendidos: <span className="font-semibold text-gray-900">{dashboard.thisWeek.sales}</span></p>
                <p className="text-gray-600">Ingresos: <span className="font-semibold text-gray-900">{formattedNumber(dashboard.thisWeek.revenue)}</span></p>
              </div>
            </div>
            <div className="border-l-4 border-pink-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Este Mes</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">Órdenes: <span className="font-semibold text-gray-900">{dashboard.thisMonth.orders}</span></p>
                <p className="text-gray-600">Items Vendidos: <span className="font-semibold text-gray-900">{dashboard.thisMonth.sales}</span></p>
                <p className="text-gray-600">Ingresos: <span className="font-semibold text-gray-900">{formattedNumber(dashboard.thisMonth.revenue)}</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ventas recientes */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ventas Recientes</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fecha</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Items</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recentSales.map((sale) => (
                    <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">{sale.id.substring(0, 8)}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(sale.createdAt).toLocaleDateString('es-CL')}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{sale.items.length}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                        {formattedNumber(sale.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Libros más vendidos */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Libros Más Vendidos</h2>
            <div className="space-y-3">
              {dashboard.topSelling.map((book, index) => (
                <div key={book.bookId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{book.title}</p>
                      <p className="text-sm text-gray-600">{book.unitsSold} unidades vendidas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formattedNumber(book.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
