'use client';

import { useState, useEffect } from 'react';
import AdminRoute from '../../../components/AdminRoute';
import Navbar from '../../../components/Navbar';
import { bookService } from '../../../services/book.service';
import { Genre } from '../../../types/book';
import { useForm } from '../../../hooks/useForm';

export default function GenresPage() {
  return (
    <AdminRoute>
      <GenresContent />
    </AdminRoute>
  );
}

function GenresContent() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);

  const { values, handleChange, handleSubmit, resetForm, setValues } = useForm<Omit<Genre, 'id'>>({
    initialValues: { name: '', description: '' },
    onSubmit: async (values) => {
      try {
        if (editingGenre) {
          await bookService.updateGenre(editingGenre.id, values);
        } else {
          await bookService.createGenre(values);
        }
        resetForm();
        setShowModal(false);
        setEditingGenre(null);
        loadGenres();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al guardar género');
      }
    },
  });

  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    try {
      setLoading(true);
      const data = await bookService.getGenres();
      setGenres(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar géneros');
      setGenres([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (genre: Genre) => {
    setEditingGenre(genre);
    setValues({
      name: genre.name,
      description: genre.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este género?')) return;
    
    try {
      await bookService.deleteGenre(id);
      loadGenres();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar género');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGenre(null);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Géneros Literarios</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-lg"
          >
            Nuevo Género
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : genres.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-600">No hay géneros registrados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {genres.map((genre) => (
              <div key={genre.id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-purple-100">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex-shrink-0 h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📚</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{genre.name}</h3>
                  </div>
                </div>
                {genre.description && (
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">{genre.description}</p>
                )}
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => handleEdit(genre)}
                    className="flex-1 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-sm font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(genre.id)}
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
                {editingGenre ? 'Editar Género' : 'Nuevo Género'}
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                      placeholder="Ficción, No Ficción, Poesía..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                    <textarea
                      value={values.description || ''}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={4}
                      placeholder="Descripción del género literario..."
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
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                  >
                    {editingGenre ? 'Actualizar' : 'Crear'}
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
