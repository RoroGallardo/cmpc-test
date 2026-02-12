'use client';

import { useState } from 'react';
import { CreateSaleDto } from '../../../types/sale';
import { Book } from '../../../types/book';

interface SaleItem {
  bookId: string;
  quantity: number;
  price: number; // Solo para mostrar en la UI, no se envía al backend
}

interface CreateSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSaleDto) => Promise<void>;
  books: Book[];
}

export default function CreateSaleModal({ isOpen, onClose, onSubmit, books }: CreateSaleModalProps) {
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedBook, setSelectedBook] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const addItem = () => {
    if (!selectedBook) return;
    
    const book = books.find(b => b.id === selectedBook);
    if (!book) return;

    const existingIndex = saleItems.findIndex(item => item.bookId === selectedBook);
    if (existingIndex !== -1) {
      const updatedItems = [...saleItems];
      updatedItems[existingIndex].quantity += quantity;
      setSaleItems(updatedItems);
    } else {
      setSaleItems([...saleItems, {
        bookId: selectedBook,
        quantity,
        price: book.price,
      }]);
    }
    
    setSelectedBook('');
    setQuantity(1);
  };

  const removeItem = (bookId: string) => {
    setSaleItems(saleItems.filter(item => item.bookId !== bookId));
  };

  const calculateTotal = () => {
    const subtotal = saleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return subtotal - discount;
  };

  const formattedPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmit = async () => {
    if (saleItems.length === 0) {
      alert('Agrega al menos un libro a la venta');
      return;
    }

    try {
      setSubmitting(true);
      const saleData: CreateSaleDto = {
        items: saleItems.map(item => ({
          bookId: item.bookId,
          quantity: item.quantity,
        })),
        discount: discount > 0 ? discount : undefined,
        notes: notes || undefined,
      };

      await onSubmit(saleData);
      resetForm();
    } catch (error) {
      console.error('Error al crear venta:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSaleItems([]);
    setSelectedBook('');
    setQuantity(1);
    setDiscount(0);
    setNotes('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Nueva Venta</h2>
        
        {/* Agregar Items */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Agregar Productos</h3>
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-7">
              <label className="block text-sm font-medium text-gray-700 mb-2">Libro</label>
              <select
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Seleccionar libro...</option>
                {books.map(book => (
                  <option key={book.id} value={book.id}>
                    {book.title} - {formattedPrice(book.price)}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="col-span-2 flex items-end">
              <button
                onClick={addItem}
                type="button"
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                +
              </button>
            </div>
          </div>

          {/* Lista de Items */}
          {saleItems.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4 max-h-48 overflow-y-auto">
              {saleItems.map((item) => {
                const book = books.find(b => b.id === item.bookId);
                return (
                  <div key={item.bookId} className="flex justify-between items-center mb-2 pb-2 border-b last:border-0">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{book?.title || 'Libro'}</p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} x {formattedPrice(item.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{formattedPrice(item.price * item.quantity)}</span>
                      <button
                        onClick={() => removeItem(item.bookId)}
                        className="text-red-600 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Descuento</label>
          <input
            type="number"
            min="0"
            value={discount}
            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="0"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            rows={3}
            placeholder="Notas adicionales..."
          />
        </div>

        {/* Total */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total:</span>
            <span className="text-indigo-600">{formattedPrice(calculateTotal())}</span>
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
            disabled={submitting}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
          >
            {submitting ? 'Creando...' : 'Crear Venta'}
          </button>
        </div>
      </div>
    </div>
  );
}
