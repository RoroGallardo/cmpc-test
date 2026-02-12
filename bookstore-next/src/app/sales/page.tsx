'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import Navbar from '../../components/Navbar';
import { saleService } from '../../services/sale.service';
import { bookService } from '../../services/book.service';
import { Sale, CreateSaleDto } from '../../types/sale';
import { Book } from '../../types/book';
import CreateSaleModal from './components/CreateSaleModal';
import SaleCard from './components/SaleCard';
import CompleteSaleModal from './components/CompleteSaleModal';

export default function SalesPage() {
  return (
    <ProtectedRoute>
      <SalesContent />
    </ProtectedRoute>
  );
}

function SalesContent() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string>('');
  const [expandedSale, setExpandedSale] = useState<string | null>(null);

  useEffect(() => {
    loadSales();
    loadBooks();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await saleService.getSales();
      if (Array.isArray(data)) {
        setSales(data);
      } else {
        setSales([]);
        setError('No se pudieron cargar las ventas. Intenta nuevamente.');
      }
    } catch (err) {
      console.error('Error al cargar ventas:', err);
      setSales([]);
      setError(err instanceof Error ? err.message : 'Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  };

  const loadBooks = async () => {
    try {
      const response = await bookService.getBooks({ limit: 100 });
      setBooks(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error al cargar libros:', err);
    }
  };

  const handleCreateSale = async (saleData: CreateSaleDto) => {
    try {
      await saleService.createSale(saleData);
      setShowModal(false);
      loadSales();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear venta');
      throw err;
    }
  };

  const handleOpenCompleteModal = (saleId: string) => {
    setSelectedSaleId(saleId);
    setShowCompleteModal(true);
  };

  const handleCompleteSale = async (paymentMethod: string, paymentReference?: string) => {
    try {
      await saleService.completeSale(selectedSaleId, paymentMethod, paymentReference);
      setShowCompleteModal(false);
      setSelectedSaleId('');
      loadSales();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al completar venta');
      throw err;
    }
  };

  const handleCancelSale = async (saleId: string) => {
    if (!confirm('¿Está seguro de cancelar esta venta?')) {
      return;
    }

    try {
      await saleService.cancelSale(saleId);
      loadSales();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cancelar venta');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ventas</h1>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg"
          >
            Nueva Venta
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando ventas...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
              <button onClick={loadSales} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                Reintentar
              </button>
            </div>
          </div>
        ) : sales.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-600 text-lg">No hay ventas registradas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sales.map((sale) => (
              <SaleCard
                key={sale.id}
                sale={sale}
                isExpanded={expandedSale === sale.id}
                onToggleExpand={() => setExpandedSale(expandedSale === sale.id ? null : sale.id)}
                onComplete={handleOpenCompleteModal}
                onCancel={handleCancelSale}
              />
            ))}
          </div>
        )}

        <CreateSaleModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleCreateSale}
          books={books}
        />

        <CompleteSaleModal
          isOpen={showCompleteModal}
          onClose={() => {
            setShowCompleteModal(false);
            setSelectedSaleId('');
          }}
          onConfirm={handleCompleteSale}
          saleId={selectedSaleId}
        />
      </div>
    </div>
  );
}
