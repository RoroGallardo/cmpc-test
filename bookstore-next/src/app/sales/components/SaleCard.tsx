'use client';

import { Sale } from '../../../types/sale';

interface SaleCardProps {
  sale: Sale;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onComplete?: (saleId: string) => void;
  onCancel?: (saleId: string) => void;
}

export default function SaleCard({ sale, isExpanded, onToggleExpand, onComplete, onCancel }: SaleCardProps) {
  const formattedPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Completada';
      case 'PENDING': return 'Pendiente';
      case 'CANCELLED': return 'Cancelada';
      case 'CONFIRMED': return 'Confirmada';
      case 'REFUNDED': return 'Reembolsada';
      default: return status;
    }
  };

  const getPaymentMethodText = (method?: string) => {
    switch (method) {
      case 'CASH': return 'Efectivo';
      case 'CREDIT_CARD': return 'Tarjeta de Crédito';
      case 'DEBIT_CARD': return 'Tarjeta de Débito';
      case 'TRANSFER': return 'Transferencia';
      case 'OTHER': return 'Otro';
      default: return 'N/A';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6">
        <div 
          className="cursor-pointer hover:bg-gray-50 transition-colors rounded-lg p-2 -m-2 mb-4"
          onClick={onToggleExpand}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 grid grid-cols-5 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">ID</p>
                <p className="font-mono text-sm font-medium">{sale.id.substring(0, 8)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Fecha</p>
                <p className="text-sm">{new Date(sale.createdAt).toLocaleDateString('es-CL')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Items</p>
                <p className="text-sm font-semibold">{sale.items?.length || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Total</p>
                <p className="text-sm font-bold text-indigo-600">{formattedPrice(sale.total)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Estado</p>
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(sale.status)}`}>
                  {getStatusText(sale.status)}
                </span>
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Botones de acción */}
        {(sale.status === 'PENDING' || sale.status === 'CONFIRMED') && (
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onComplete?.(sale.id);
              }}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center justify-center gap-2"
              title="Completar venta"
            >
              <span>✓</span>
              <span>Completar</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancel?.(sale.id);
              }}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center justify-center gap-2"
              title="Cancelar venta"
            >
              <span>✗</span>
              <span>Cancelar</span>
            </button>
          </div>
        )}
      </div>

      {/* Detalle expandido */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Información de Pago</p>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-500">Método:</span> {getPaymentMethodText(sale.paymentMethod)}</p>
                <p><span className="text-gray-500">Subtotal:</span> {formattedPrice(sale.subtotal || sale.total)}</p>
                {sale.discount > 0 && <p><span className="text-gray-500">Descuento:</span> {formattedPrice(sale.discount)}</p>}
                {sale.tax > 0 && <p><span className="text-gray-500">Impuesto:</span> {formattedPrice(sale.tax)}</p>}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Vendedor</p>
              <div className="text-sm">
                {sale.seller ? (
                  <p>{sale.seller.firstName} {sale.seller.lastName}</p>
                ) : (
                  <p className="text-gray-500">No disponible</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Productos</p>
            <div className="space-y-2">
              {sale.items && sale.items.length > 0 ? (
                sale.items.map((item, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{item.book?.title || `Libro ID: ${item.bookId.substring(0, 8)}`}</p>
                      {item.book?.author && <p className="text-xs text-gray-500">{item.book.author}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm"><span className="text-gray-500">Cantidad:</span> {item.quantity}</p>
                      <p className="text-sm font-semibold">{formattedPrice(item.subtotal)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No hay items registrados</p>
              )}
            </div>
          </div>

          {sale.notes && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-1">Notas</p>
              <p className="text-sm text-gray-600">{sale.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
