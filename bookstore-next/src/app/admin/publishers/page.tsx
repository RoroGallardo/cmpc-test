'use client';

import { useState, useEffect } from 'react';
import AdminRoute from '../../../components/AdminRoute';
import Navbar from '../../../components/Navbar';
import { bookService } from '../../../services/book.service';
import { Publisher } from '../../../types/book';
import { useForm } from '../../../hooks/useForm';

export default function PublishersPage() {
  return (
    <AdminRoute>
      <PublishersContent />
    </AdminRoute>
  );
}

function PublishersContent() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState<Publisher | null>(null);

  const { values, handleChange, handleSubmit, resetForm, setValues } = useForm<Omit<Publisher, 'id'>>({
    initialValues: { name: '', country: '', website: '' },
    onSubmit: async (values) => {
      try {
        if (editingPublisher) {
          await bookService.updatePublisher(editingPublisher.id, values);
        } else {
          await bookService.createPublisher(values);
        }
        resetForm();
        setShowModal(false);
        setEditingPublisher(null);
        loadPublishers();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al guardar editorial');
      }
    },
  });

  useEffect(() => {
    loadPublishers();
  }, []);

  const loadPublishers = async () => {
    try {
      setLoading(true);
      const data = await bookService.getPublishers();
      setPublishers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar editoriales');
      setPublishers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (publisher: Publisher) => {
    setEditingPublisher(publisher);
    setValues({
      name: publisher.name,
      country: publisher.country || '',
      website: publisher.website || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta editorial?')) return;
    
    try {
      await bookService.deletePublisher(id);
      loadPublishers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar editorial');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPublisher(null);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Editoriales</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-lg"
          >
            Nueva Editorial
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : publishers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-600">No hay editoriales registradas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishers.map((publisher) => (
              <div key={publisher.id} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-green-100">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex-shrink-0 h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🏢</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{publisher.name}</h3>
                    {publisher.country && (
                      <p className="text-sm text-gray-600">{publisher.country}</p>
                    )}
                  </div>
                </div>
                {publisher.website && (
                  <p className="text-xs text-blue-600 mb-4 truncate">
                    🔗 <a href={publisher.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {publisher.website}
                    </a>
                  </p>
                )}
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => handleEdit(publisher)}
                    className="flex-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-sm font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(publisher.id)}
                    className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingPublisher ? 'Editar Editorial' : 'Nueva Editorial'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={values.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
                    <input
                      type="text"
                      value={values.country || ''}
                      onChange={(e) => handleChange('country', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Chile, Argentina, España..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sitio Web
                    </label>
                    <input
                      type="url"
                      value={values.website || ''}
                      onChange={(e) => handleChange('website', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="https://editorial.com"
                    />
                  </div>
                </div>
                <div className="flex space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    {editingPublisher ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
