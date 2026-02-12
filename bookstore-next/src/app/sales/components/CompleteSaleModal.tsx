'use client';

import { useState } from 'react';
import { PaymentMethod } from '../../../types/sale';

interface CompleteSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentMethod: string, paymentReference?: string) => Promise<void>;
  saleId: string;
}

export default function CompleteSaleModal({ isOpen, onClose, onConfirm, saleId }: CompleteSaleModalProps) {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const paymentMethods = [
    { value: 'CASH', label: 'Efectivo' },
    { value: 'CREDIT_CARD', label: 'Tarjeta de Crédito' },
    { value: 'DEBIT_CARD', label: 'Tarjeta de Débito' },
    { value: 'TRANSFER', label: 'Transferencia' },
    { value: 'OTHER', label: 'Otro' }
  ];

  const handleSubmit = async () => {
    if (!paymentMethod) {
      setError('Debe seleccionar un método de pago');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await onConfirm(paymentMethod, paymentReference || undefined);
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al completar venta');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setPaymentMethod('');
    setPaymentReference('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Completar Venta</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pago <span className="text-red-500">*</span>
            </label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">Seleccione un método de pago</option>
              {paymentMethods.map(method => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="paymentReference" className="block text-sm font-medium text-gray-700 mb-2">
              Referencia de Pago (Opcional)
            </label>
            <input
              type="text"
              id="paymentReference"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Ej: REF-123456"
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !paymentMethod}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
          >
            {submitting ? 'Confirmando...' : 'Confirmar Venta'}
          </button>
        </div>
      </div>
    </div>
  );
}
